import { requireUser } from "@/lib/auth/current-user";
import { getPayments } from "@/lib/queries/admin";
import { Badge } from "@/components/ui/card";
import { formatMoney, initials } from "@/lib/queries/shared";
import { Reveal, Stagger, StaggerRow } from "@/components/ui/motion";
import { MarkPaidButton, RemindButton } from "./actions";

const STATUS_TONE: Record<string, "mint" | "amber" | "danger" | "neutral"> = {
  PAID: "mint",
  PENDING: "amber",
  OVERDUE: "danger",
  REFUNDED: "neutral",
};

export default async function PaymentsPage() {
  const user = await requireUser("ADMIN");
  const rows = await getPayments(user.gymId);

  const totalPaid = rows.filter((r) => r.status === "PAID").reduce((s, r) => s + r.amountCents, 0);
  const totalOverdue = rows.filter((r) => r.status === "OVERDUE").reduce((s, r) => s + r.amountCents, 0);

  return (
    <main className="px-6 md:px-10 py-8 max-w-[1400px]">
      <Reveal className="mb-6 flex flex-wrap items-center gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Payments</h1>
          <p className="text-text-secondary text-sm mt-1">Collections, overdue balances, and reminders.</p>
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <Badge tone="mint">{formatMoney(totalPaid)} collected</Badge>
          <Badge tone="danger">{formatMoney(totalOverdue)} overdue</Badge>
        </div>
      </Reveal>

      <Reveal delay={0.08} className="rounded-[var(--radius-lg)] bg-surface border border-border-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-soft text-left text-text-muted text-xs uppercase tracking-wide">
                <th className="px-5 py-3 font-medium">Member</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Method</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <Stagger as="tbody">
              {rows.map((p) => (
                <StaggerRow key={p.id} className="border-b border-border-soft last:border-0 hover:bg-bg-elevated/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-8 w-8 rounded-full bg-surface-2 flex items-center justify-center text-xs font-semibold shrink-0">
                        {initials(p.member.user.name)}
                      </span>
                      <span className="font-medium">{p.member.user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-medium">{formatMoney(p.amountCents)}</td>
                  <td className="px-5 py-3 text-text-secondary">{p.method}</td>
                  <td className="px-5 py-3 text-text-secondary">
                    {p.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {p.status !== "PAID" && (
                      <div className="flex items-center justify-end gap-2">
                        <RemindButton paymentId={p.id} />
                        <MarkPaidButton paymentId={p.id} />
                      </div>
                    )}
                  </td>
                </StaggerRow>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-text-muted text-sm">
                    No payments recorded yet.
                  </td>
                </tr>
              )}
            </Stagger>
          </table>
        </div>
      </Reveal>
    </main>
  );
}
