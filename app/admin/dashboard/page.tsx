import Link from "next/link";
import { Plus, Users, CalendarCheck, Wallet, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Stagger, StaggerItem, CountUp } from "@/components/ui/motion";
import { requireUser } from "@/lib/auth/current-user";
import { getAdminDashboard } from "@/lib/queries/admin";
import { formatMoney, timeAgo, initials } from "@/lib/queries/shared";
import { DashboardCharts } from "./charts";

export default async function AdminDashboard() {
  const user = await requireUser("ADMIN");
  const data = await getAdminDashboard(user.gymId);

  const mixColors: Record<string, string> = {
    ACTIVE: "var(--mint)",
    EXPIRING: "var(--amber)",
    EXPIRED: "var(--danger)",
    FROZEN: "var(--text-muted)",
  };
  const membershipMix = data.membershipMix.map((m) => ({ name: m.status, value: m.n, color: mixColors[m.status] }));

  type Activity = { text: string; time: Date; tone: "mint" | "accent" | "violet" | "danger" };
  const activity: Activity[] = [
    ...data.recentPayments.map((p): Activity => ({
      text: `${p.member.user.name} ${p.status === "PAID" ? "paid" : p.status === "OVERDUE" ? "has an overdue payment of" : "owes"} ${formatMoney(p.amountCents)}`,
      time: p.date,
      tone: p.status === "PAID" ? "mint" : "danger",
    })),
    ...data.recentMemberships.map((m): Activity => ({
      text: `${m.member.user.name} started a new membership`,
      time: m.startDate,
      tone: "accent",
    })),
  ]
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 5);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <main className="px-6 md:px-10 py-8 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold">
            {greeting}, {user.name.split(" ")[0]}
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} — here's how {user.gym?.name} is doing.
          </p>
        </div>
        <Link
          href="/admin/members"
          className="h-11 px-5 rounded-[var(--radius-md)] bg-accent text-white font-semibold text-sm flex items-center gap-2 hover:bg-accent-strong active:scale-[0.98] transition-all"
        >
          <Plus size={17} /> Add member
        </Link>
      </div>

      {/* Bento stat grid — one hero stat, three supporting */}
      <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StaggerItem className="lg:col-span-1 sm:row-span-2">
          <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-br from-[color:var(--surface)] to-[color:var(--accent-soft)] border border-border-soft p-6 flex flex-col justify-between min-h-[240px] h-full heat-glow grain transition-transform duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Active members</span>
              <span className="h-9 w-9 rounded-full bg-surface-2 flex items-center justify-center">
                <Users size={17} />
              </span>
            </div>
            <div>
              <p className="font-display text-6xl font-semibold tracking-tight">
                <CountUp value={data.activeMembers} />
              </p>
              <p className="text-mint text-sm font-medium mt-2">of {data.totalMembers} total members</p>
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="bg-surface border border-border-soft rounded-[var(--radius-md)] p-5 flex flex-col justify-between min-h-[112px] h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_-14px_rgba(0,0,0,0.55)]">
            <div className="flex items-start justify-between">
              <span className="text-sm text-text-secondary">Today's attendance</span>
              <span className="h-8 w-8 rounded-full bg-surface-2 flex items-center justify-center text-text-secondary shrink-0">
                <CalendarCheck size={16} />
              </span>
            </div>
            <span className="font-display font-semibold tracking-tight text-2xl mt-4">
              <CountUp value={data.todaysAttendance} />
            </span>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="bg-surface border border-border-soft rounded-[var(--radius-md)] p-5 flex flex-col justify-between min-h-[112px] h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_-14px_rgba(0,0,0,0.55)]">
            <div className="flex items-start justify-between">
              <span className="text-sm text-text-secondary">Monthly revenue</span>
              <span className="h-8 w-8 rounded-full bg-surface-2 flex items-center justify-center text-text-secondary shrink-0">
                <Wallet size={16} />
              </span>
            </div>
            <span className="font-display font-semibold tracking-tight text-2xl mt-4">{formatMoney(data.monthlyRevenueCents)}</span>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="bg-surface border border-border-soft rounded-[var(--radius-md)] p-5 flex flex-col justify-between min-h-[112px] h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_-14px_rgba(0,0,0,0.55)]">
            <div className="flex items-start justify-between">
              <span className="text-sm text-text-secondary">Expiring soon</span>
              <span className="h-8 w-8 rounded-full bg-surface-2 flex items-center justify-center text-text-secondary shrink-0">
                <AlertTriangle size={16} />
              </span>
            </div>
            <span className="font-display font-semibold tracking-tight text-2xl mt-4">
              <CountUp value={data.expiringSoon} />
            </span>
          </div>
        </StaggerItem>
      </Stagger>

      <DashboardCharts
        revenue={data.revenueTrend}
        membershipMix={membershipMix}
        attendanceByHour={data.attendanceByHour}
      />

      {/* Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Card className="lg:col-span-2">
          <h3 className="font-display text-lg font-semibold mb-1">Overdue payments</h3>
          <p className="text-text-muted text-xs mb-4">{data.overdueCount} member{data.overdueCount === 1 ? "" : "s"} behind on payment</p>
          <Link href="/admin/payments" className="text-accent text-sm font-medium hover:underline">
            Review payments →
          </Link>
        </Card>

        <Card>
          <h3 className="font-display text-lg font-semibold mb-4">Recent activity</h3>
          <div className="space-y-4">
            {activity.length === 0 && <p className="text-sm text-text-muted">No activity yet.</p>}
            {activity.map((a, i) => (
              <div key={i} className="flex gap-3">
                <span
                  className="h-2 w-2 rounded-full mt-1.5 shrink-0"
                  style={{ background: `var(--${a.tone})` }}
                />
                <div>
                  <p className="text-sm leading-snug">{a.text}</p>
                  <p className="text-xs text-text-muted mt-0.5">{timeAgo(a.time)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
