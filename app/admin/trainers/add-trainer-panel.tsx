"use client";

import { useActionState, useState } from "react";
import { Plus, X } from "lucide-react";
import { addTrainer } from "@/lib/actions/admin";
import { SubmitButton } from "@/components/ui/submit-button";
import { Reveal } from "@/components/ui/motion";

const inputClass =
  "h-11 w-full rounded-[var(--radius-sm)] bg-bg-elevated border border-border px-3.5 text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors";

export function AddTrainerPanel() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(addTrainer, undefined);

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen((o) => !o)}
        className="h-11 px-5 rounded-[var(--radius-md)] bg-accent text-white font-semibold text-sm flex items-center gap-2 hover:bg-accent-strong active:scale-[0.98] transition-all"
      >
        {open ? <X size={17} /> : <Plus size={17} />}
        {open ? "Close" : "Add trainer"}
      </button>

      {open && (
        <Reveal className="mt-4 rounded-[var(--radius-lg)] bg-surface border border-border-soft p-5">
          <form action={formAction} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input name="name" placeholder="Full name" required className={inputClass} />
            <input name="email" type="email" placeholder="Email" required className={inputClass} />
            <input name="specialty" placeholder="Specialty (e.g. HIIT & Fat Loss)" className={`${inputClass} sm:col-span-2`} />

            {state?.error && (
              <p className="sm:col-span-2 text-sm text-danger bg-danger-soft border border-danger/20 rounded-[var(--radius-sm)] px-3 py-2">
                {state.error}
              </p>
            )}

            <p className="sm:col-span-2 text-xs text-text-muted">
              New trainers get a temporary password of <span className="font-medium text-text-secondary">welcome123</span>.
            </p>

            <SubmitButton pendingText="Adding…" className="sm:col-span-2">
              Create trainer
            </SubmitButton>
          </form>
        </Reveal>
      )}
    </div>
  );
}
