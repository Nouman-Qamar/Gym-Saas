"use client";

import { useActionState, useState } from "react";
import { Plus, X } from "lucide-react";
import { logBodyMetric } from "@/lib/actions/member";
import { SubmitButton } from "@/components/ui/submit-button";
import { Reveal } from "@/components/ui/motion";

export function LogWeightForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(logBodyMetric, undefined);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="h-10 px-4 rounded-[var(--radius-md)] bg-surface-2 text-sm font-medium flex items-center gap-2"
      >
        <Plus size={15} /> Log weight
      </button>
    );
  }

  return (
    <Reveal>
      <form action={formAction} className="rounded-[var(--radius-lg)] bg-surface border border-border-soft p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <input
            name="weightKg"
            type="number"
            step="0.1"
            placeholder="Weight (kg)"
            required
            autoFocus
            className="h-11 flex-1 rounded-[var(--radius-sm)] bg-bg-elevated border border-border px-3 text-sm focus:outline-none focus:border-accent"
          />
          <button type="button" onClick={() => setOpen(false)} className="text-text-muted">
            <X size={16} />
          </button>
        </div>
        {state?.error && <p className="text-xs text-danger">{state.error}</p>}
        <SubmitButton pendingText="Saving…">Save entry</SubmitButton>
      </form>
    </Reveal>
  );
}
