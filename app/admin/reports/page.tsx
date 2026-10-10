import { requireUser } from "@/lib/auth/current-user";
import { getAdminDashboard, getReportsData } from "@/lib/queries/admin";
import { DashboardCharts } from "../dashboard/charts";
import { ReportsCharts } from "./charts";
import { Reveal } from "@/components/ui/motion";

export default async function ReportsPage() {
  const user = await requireUser("ADMIN");
  const [dashboard, reports] = await Promise.all([getAdminDashboard(user.gymId), getReportsData(user.gymId)]);

  const mixColors: Record<string, string> = {
    ACTIVE: "var(--mint)",
    EXPIRING: "var(--amber)",
    EXPIRED: "var(--danger)",
    FROZEN: "var(--text-muted)",
  };

  return (
    <main className="px-6 md:px-10 py-8 max-w-[1400px]">
      <Reveal className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Reports</h1>
        <p className="text-text-secondary text-sm mt-1">Revenue, attendance, and staff load at a glance.</p>
      </Reveal>

      <Reveal delay={0.06} className="mb-4">
        <DashboardCharts
          revenue={dashboard.revenueTrend}
          membershipMix={dashboard.membershipMix.map((m) => ({ name: m.status, value: m.n, color: mixColors[m.status] }))}
          attendanceByHour={dashboard.attendanceByHour}
        />
      </Reveal>

      <Reveal delay={0.12}>
        <ReportsCharts revenueByPlan={reports.revenueByPlan} membersByTrainer={reports.membersByTrainer} />
      </Reveal>
    </main>
  );
}
