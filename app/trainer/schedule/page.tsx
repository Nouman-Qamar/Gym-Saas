import { requireUser } from "@/lib/auth/current-user";
import { getTrainerSchedule } from "@/lib/queries/trainer";
import { Badge } from "@/components/ui/card";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { CreateClassPanel } from "./create-class-panel";
import { Users } from "lucide-react";

export default async function TrainerSchedulePage() {
  const user = await requireUser("TRAINER");
  const classes = await getTrainerSchedule(user.id);
  const upcoming = classes.filter((c) => c.startsAt >= new Date());
  const past = classes.filter((c) => c.startsAt < new Date());

  return (
    <main className="px-6 md:px-10 py-8 max-w-[1000px]">
      <Reveal className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Schedule</h1>
        <p className="text-text-secondary text-sm mt-1">Classes you're running.</p>
      </Reveal>

      <CreateClassPanel />

      <Stagger className="space-y-3">
        {upcoming.map((c) => (
          <StaggerItem key={c.id} className="rounded-[var(--radius-lg)] bg-surface border border-border-soft p-5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-semibold text-sm">{c.title}</p>
              <p className="text-xs text-text-muted mt-0.5">
                {c.startsAt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} ·{" "}
                {c.startsAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} · {c.durationMinutes} min
              </p>
            </div>
            <Badge tone="accent">
              <Users size={11} /> {c.bookings.length}/{c.capacity}
            </Badge>
          </StaggerItem>
        ))}
        {upcoming.length === 0 && <p className="text-sm text-text-muted">No upcoming classes — schedule one above.</p>}
      </Stagger>

      {past.length > 0 && (
        <div className="mt-8">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-3">Past</p>
          <div className="space-y-2 opacity-60">
            {past.slice(0, 5).map((c) => (
              <div key={c.id} className="rounded-[var(--radius-md)] bg-surface border border-border-soft p-4 flex items-center justify-between">
                <p className="text-sm">{c.title}</p>
                <p className="text-xs text-text-muted">{c.startsAt.toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
