import { Card, Badge } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Users, CalendarDays, ClipboardList, Clock, AlertCircle } from "lucide-react";
import { requireUser } from "@/lib/auth/current-user";
import { getTrainerDashboard } from "@/lib/queries/trainer";

export default async function TrainerDashboard() {
  const user = await requireUser("TRAINER");
  const data = await getTrainerDashboard(user.id);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <main className="px-6 md:px-10 py-8 max-w-[1200px]">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold">
          {greeting}, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          {data.todaysClasses.length > 0
            ? `You've got ${data.todaysClasses.length} class${data.todaysClasses.length === 1 ? "" : "es"} today. First one starts at ${data.todaysClasses[0].startsAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}.`
            : "No classes on your schedule today — a good day to catch up on plans."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="My members" value={String(data.memberCount)} icon={Users} />
        <StatCard label="Today's classes" value={String(data.todaysClasses.length)} icon={CalendarDays} />
        <StatCard label="Active plans" value={String(data.plansCount)} icon={ClipboardList} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h3 className="font-display text-lg font-semibold mb-4">Today's schedule</h3>
          <div className="space-y-1">
            {data.todaysClasses.map((c) => (
              <div key={c.id} className="flex items-center gap-4 py-3 border-b border-border-soft last:border-0">
                <div className="w-16 shrink-0 flex items-center gap-1.5 text-sm text-text-secondary">
                  <Clock size={13} /> {c.startsAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.title}</p>
                  <p className="text-xs text-text-muted">{c.type} · {c.bookings.length}/{c.capacity} booked</p>
                </div>
                <Badge tone="neutral">{c.durationMinutes} min</Badge>
              </div>
            ))}
            {data.todaysClasses.length === 0 && <p className="text-sm text-text-muted py-6">Nothing scheduled today.</p>}
          </div>
        </Card>

        <Card>
          <h3 className="font-display text-lg font-semibold mb-1">Needs attention</h3>
          <p className="text-text-muted text-xs mb-4">Members trending the wrong way</p>
          <div className="space-y-4">
            {data.needsAttention.map((a, i) => (
              <div key={i} className="flex gap-3">
                <span className="h-8 w-8 rounded-full bg-amber-soft flex items-center justify-center text-amber shrink-0">
                  <AlertCircle size={15} />
                </span>
                <div>
                  <p className="text-sm font-medium">{a.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">{a.note}</p>
                </div>
              </div>
            ))}
            {data.needsAttention.length === 0 && <p className="text-sm text-text-muted">Everyone's on track 🎉</p>}
          </div>
        </Card>
      </div>
    </main>
  );
}
