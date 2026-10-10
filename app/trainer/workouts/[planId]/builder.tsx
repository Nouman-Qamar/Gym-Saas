"use client";

import { useActionState, useState, useTransition } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { addPlanDay, addPlanExercise, removePlanExercise } from "@/lib/actions/trainer";
import { SubmitButton } from "@/components/ui/submit-button";
import { Reveal } from "@/components/ui/motion";

const inputClass =
  "h-10 w-full rounded-[var(--radius-sm)] bg-bg-elevated border border-border px-3 text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors";

export function AddDayForm({ planId }: { planId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(addPlanDay, undefined);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="h-10 px-4 rounded-[var(--radius-md)] bg-surface-2 text-sm font-medium flex items-center gap-2 hover:bg-[color:var(--border)] transition-colors"
      >
        <Plus size={15} /> Add day
      </button>
    );
  }

  return (
    <form action={formAction} className="flex items-center gap-2 max-w-md">
      <input type="hidden" name="planId" value={planId} />
      <input name="dayLabel" placeholder="Day 4 — Shoulders &amp; Abs" required autoFocus className={inputClass} />
      <SubmitButton className="h-10 px-4 shrink-0" pendingText="Adding…">
        Add
      </SubmitButton>
      <button type="button" onClick={() => setOpen(false)} className="text-text-muted hover:text-text-primary shrink-0">
        <X size={16} />
      </button>
      {state?.error && <p className="text-xs text-danger">{state.error}</p>}
    </form>
  );
}

export function AddExerciseForm({
  planId,
  dayId,
  exercises,
}: {
  planId: string;
  dayId: string;
  exercises: { id: string; name: string; muscleGroup: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(addPlanExercise, undefined);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-accent text-xs font-medium hover:underline flex items-center gap-1">
        <Plus size={12} /> Add exercise
      </button>
    );
  }

  return (
    <Reveal>
      <form action={formAction} className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2 items-start bg-bg-elevated rounded-[var(--radius-sm)] p-3">
        <input type="hidden" name="planId" value={planId} />
        <input type="hidden" name="dayId" value={dayId} />
        <select name="exerciseId" required defaultValue="" className={`${inputClass} col-span-2 sm:col-span-2`}>
          <option value="" disabled>
            Exercise
          </option>
          {exercises.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
        <input name="sets" type="number" placeholder="Sets" defaultValue={3} min={1} max={20} required className={inputClass} />
        <input name="reps" placeholder="Reps (e.g. 8-10)" defaultValue="10" required className={inputClass} />
        <input name="restSeconds" type="number" placeholder="Rest (s)" defaultValue={60} min={0} max={600} required className={inputClass} />
        <div className="col-span-2 sm:col-span-5 flex items-center gap-2">
          <SubmitButton className="h-9 px-4 text-xs" pendingText="Adding…">
            Add
          </SubmitButton>
          <button type="button" onClick={() => setOpen(false)} className="text-text-muted hover:text-text-primary text-xs">
            Cancel
          </button>
          {state?.error && <p className="text-xs text-danger">{state.error}</p>}
        </div>
      </form>
    </Reveal>
  );
}

export function RemoveExerciseButton({ id, planId }: { id: string; planId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(() => removePlanExercise(id, planId))}
      disabled={pending}
      className="text-text-muted hover:text-danger transition-colors disabled:opacity-50"
    >
      <Trash2 size={13} />
    </button>
  );
}
