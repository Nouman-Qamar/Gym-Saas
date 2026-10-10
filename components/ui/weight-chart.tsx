"use client";

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

export function WeightChart({ data }: { data: { date: string; weightKg: number }[] }) {
  if (data.length === 0) {
    return <div className="h-[200px] flex items-center justify-center text-sm text-text-muted">No body metrics logged yet.</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ left: -20, right: 10 }}>
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
        <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
        <Tooltip
          contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }}
          formatter={(v) => [`${v} kg`, "Weight"]}
        />
        <Line type="monotone" dataKey="weightKg" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--accent)" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
