"use client";

import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/motion";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { formatMoney } from "@/lib/queries/shared";

const PLAN_COLORS = ["var(--text-muted)", "var(--accent)", "var(--violet)"];

export function ReportsCharts({
  revenueByPlan,
  membersByTrainer,
}: {
  revenueByPlan: { name: string; value: number }[];
  membersByTrainer: { name: string; value: number }[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Reveal delay={0}>
        <Card>
          <h3 className="font-display text-lg font-semibold mb-1">Revenue by plan</h3>
          <p className="text-text-muted text-xs mb-4">All-time, paid invoices</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueByPlan} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={70} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
              <Tooltip
                formatter={(v) => formatMoney(Number(v))}
                contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {revenueByPlan.map((entry, i) => (
                  <Cell key={entry.name} fill={PLAN_COLORS[i % PLAN_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Reveal>

      <Reveal delay={0.06}>
        <Card>
          <h3 className="font-display text-lg font-semibold mb-1">Members per trainer</h3>
          <p className="text-text-muted text-xs mb-4">Current assignment load</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={membersByTrainer} margin={{ left: -20 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="value" fill="var(--mint)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Reveal>
    </div>
  );
}
