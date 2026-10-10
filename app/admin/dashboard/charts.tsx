"use client";

import { Card, Badge } from "@/components/ui/card";
import { Reveal } from "@/components/ui/motion";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { formatMoney } from "@/lib/queries/shared";

export function DashboardCharts({
  revenue,
  membershipMix,
  attendanceByHour,
}: {
  revenue: { month: string; value: number }[];
  membershipMix: { name: string; value: number; color: string }[];
  attendanceByHour: { hour: string; value: number }[];
}) {
  const totalMembers = membershipMix.reduce((s, m) => s + m.value, 0);
  const growth =
    revenue.length >= 2 && revenue[0].value > 0
      ? Math.round(((revenue[revenue.length - 1].value - revenue[0].value) / revenue[0].value) * 100)
      : null;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Reveal delay={0} className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-lg font-semibold">Revenue trend</h3>
                <p className="text-text-muted text-xs mt-0.5">Last 6 months</p>
              </div>
              {growth !== null && <Badge tone={growth >= 0 ? "mint" : "danger"}>{growth >= 0 ? "+" : ""}{growth}%</Badge>}
            </div>
            {revenue.length === 0 ? (
              <EmptyState label="No payments recorded yet" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={revenue} margin={{ left: -20, right: 10 }}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                  <Tooltip
                    formatter={(v) => formatMoney(Number(v))}
                    contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }}
                    labelStyle={{ color: "var(--text-secondary)" }}
                  />
                  <Area type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2.5} fill="url(#rev)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Reveal>

        <Reveal delay={0.06}>
          <Card>
            <h3 className="font-display text-lg font-semibold mb-1">Membership mix</h3>
            <p className="text-text-muted text-xs mb-2">{totalMembers} total members</p>
            {totalMembers === 0 ? (
              <EmptyState label="No members yet" />
            ) : (
              <>
                <div className="flex items-center justify-center">
                  <PieChart width={180} height={180}>
                    <Pie
                      data={membershipMix}
                      dataKey="value"
                      innerRadius={54}
                      outerRadius={80}
                      paddingAngle={3}
                      stroke="none"
                      isAnimationActive={false}
                    >
                      {membershipMix.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {membershipMix.map((m) => (
                    <div key={m.name} className="flex items-center gap-2 text-xs">
                      <span className="h-2 w-2 rounded-full" style={{ background: m.color }} />
                      <span className="text-text-secondary capitalize">{m.name.toLowerCase()}</span>
                      <span className="ml-auto font-medium">{m.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </Reveal>
      </div>

      <Reveal delay={0.12}>
        <Card>
          <h3 className="font-display text-lg font-semibold mb-4">Attendance by hour</h3>
          <p className="text-text-muted text-xs -mt-3 mb-4">Last 30 days</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={attendanceByHour} margin={{ left: -20 }}>
              <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: "var(--surface-2)" }}
                contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }}
              />
              <Bar dataKey="value" fill="var(--accent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Reveal>
    </>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="h-[180px] flex items-center justify-center text-sm text-text-muted">{label}</div>;
}
