"use client";

import { useActionState, useState } from "react";
import { Plus, X } from "lucide-react";
import { addExercise } from "@/lib/actions/admin";
import { SubmitButton } from "@/components/ui/submit-button";
import { Reveal } from "@/components/ui/motion";

const inputClass =
  "h-11 w-full rounded-[var(--radius-sm)] bg-bg-elevated border border-border px-3.5 text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors";

export function AddExercisePanel() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(addExercise, undefined);

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen((o) => !o)}
        className="h-10 px-4 rounded-[var(--radius-md)] bg-surface-2 text-sm font-medium flex items-center gap-2 hover:bg-[color:var(--border)] transition-colors"
      >
        {open ? <X size={15} /> : <Plus size={15} />}
        {open ? "Close" : "Add exercise to library"}
      </button>

      {open && (
        <Reveal className="mt-3 rounded-[var(--radius-lg)] bg-surface border border-border-soft p-5">
          <form action={formAction} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input name="name" placeholder="Exercise name" required className={inputClass} />
            <input name="muscleGroup" placeholder="Muscle group" required className={inputClass} />
            <input name="equipment" placeholder="Equipment (optional)" className={inputClass} />
            {state?.error && (
              <p className="sm:col-span-3 text-sm text-danger bg-danger-soft border border-danger/20 rounded-[var(--radius-sm)] px-3 py-2">
                {state.error}
              </p>
            )}
            <SubmitButton pendingText="Adding…" className="sm:col-span-3">
              Add to library
            </SubmitButton>
          </form>
        </Reveal>
      )}
    </div>
  );
}
