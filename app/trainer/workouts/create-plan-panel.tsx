"use client";

import { useActionState, useState } from "react";
import { Plus, X } from "lucide-react";
import { createWorkoutPlan } from "@/lib/actions/trainer";
import { SubmitButton } from "@/components/ui/submit-button";
import { Reveal } from "@/components/ui/motion";

const inputClass =
  "h-11 w-full rounded-[var(--radius-sm)] bg-bg-elevated border border-border px-3.5 text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors";

export function CreatePlanPanel({ members }: { members: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(createWorkoutPlan, undefined);

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen((o) => !o)}
        className="h-11 px-5 rounded-[var(--radius-md)] bg-accent text-white font-semibold text-sm flex items-center gap-2 hover:bg-accent-strong active:scale-[0.98] transition-all"
      >
        {open ? <X size={17} /> : <Plus size={17} />}
        {open ? "Close" : "New workout plan"}
      </button>

      {open && (
        <Reveal className="mt-4 rounded-[var(--radius-lg)] bg-surface border border-border-soft p-5">
          <form action={formAction} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select name="memberId" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                Choose a member
              </option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <input name="title" placeholder="Plan title (e.g. Push / Pull / Legs)" required className={inputClass} />
            <input name="goal" placeholder="Goal (optional)" className={`${inputClass} sm:col-span-2`} />

            {state?.error && (
              <p className="sm:col-span-2 text-sm text-danger bg-danger-soft border border-danger/20 rounded-[var(--radius-sm)] px-3 py-2">
                {state.error}
              </p>
            )}

            <SubmitButton pendingText="Creating…" className="sm:col-span-2">
              Create &amp; start building
            </SubmitButton>
          </form>
        </Reveal>
      )}
    </div>
  );
}
