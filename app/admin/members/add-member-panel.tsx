"use client";

import { useActionState, useState } from "react";
import { Plus, X } from "lucide-react";
import { addMember } from "@/lib/actions/admin";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatMoney } from "@/lib/queries/shared";
import { Reveal } from "@/components/ui/motion";

const inputClass =
  "h-11 w-full rounded-[var(--radius-sm)] bg-bg-elevated border border-border px-3.5 text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors";

export function AddMemberPanel({
  plans,
  trainers,
}: {
  plans: { id: string; name: string; priceCents: number }[];
  trainers: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(addMember, undefined);

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen((o) => !o)}
        className="h-11 px-5 rounded-[var(--radius-md)] bg-accent text-white font-semibold text-sm flex items-center gap-2 hover:bg-accent-strong active:scale-[0.98] transition-all"
      >
        {open ? <X size={17} /> : <Plus size={17} />}
        {open ? "Close" : "Add member"}
      </button>

      {open && (
        <Reveal className="mt-4 rounded-[var(--radius-lg)] bg-surface border border-border-soft p-5">
          <form action={formAction} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input name="name" placeholder="Full name" required className={inputClass} />
            <input name="email" type="email" placeholder="Email" required className={inputClass} />
            <select name="planId" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                Membership plan
              </option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatMoney(p.priceCents)}/mo
                </option>
              ))}
            </select>
            <select name="trainerId" defaultValue="" className={inputClass}>
              <option value="">No trainer assigned</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <input name="goal" placeholder="Goal (optional)" className={`${inputClass} sm:col-span-2`} />

            {state?.error && (
              <p className="sm:col-span-2 text-sm text-danger bg-danger-soft border border-danger/20 rounded-[var(--radius-sm)] px-3 py-2">
                {state.error}
              </p>
            )}

            <p className="sm:col-span-2 text-xs text-text-muted">
              New members get a temporary password of <span className="font-medium text-text-secondary">welcome123</span> — share it with them to log in.
            </p>

            <SubmitButton pendingText="Adding…" className="sm:col-span-2">
              Create member
            </SubmitButton>
          </form>
        </Reveal>
      )}
    </div>
  );
}
