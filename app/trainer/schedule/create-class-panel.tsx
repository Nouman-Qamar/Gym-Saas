"use client";

import { useActionState, useState } from "react";
import { Plus, X } from "lucide-react";
import { createClass } from "@/lib/actions/trainer";
import { SubmitButton } from "@/components/ui/submit-button";
import { Reveal } from "@/components/ui/motion";

const inputClass =
  "h-11 w-full rounded-[var(--radius-sm)] bg-bg-elevated border border-border px-3.5 text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors";

export function CreateClassPanel() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(createClass, undefined);

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen((o) => !o)}
        className="h-11 px-5 rounded-[var(--radius-md)] bg-accent text-white font-semibold text-sm flex items-center gap-2 hover:bg-accent-strong active:scale-[0.98] transition-all"
      >
        {open ? <X size={17} /> : <Plus size={17} />}
        {open ? "Close" : "Schedule a class"}
      </button>

      {open && (
        <Reveal className="mt-4 rounded-[var(--radius-lg)] bg-surface border border-border-soft p-5">
          <form action={formAction} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input name="title" placeholder="Class title (e.g. Sunrise Yoga Flow)" required className={inputClass} />
            <input name="type" placeholder="Type (e.g. Yoga · Recovery)" required className={inputClass} />
            <input name="startsAt" type="datetime-local" required className={inputClass} />
            <div className="grid grid-cols-2 gap-3">
              <input name="durationMinutes" type="number" placeholder="Minutes" defaultValue={45} min={10} max={180} required className={inputClass} />
              <input name="capacity" type="number" placeholder="Capacity" defaultValue={16} min={1} max={200} required className={inputClass} />
            </div>

            {state?.error && (
              <p className="sm:col-span-2 text-sm text-danger bg-danger-soft border border-danger/20 rounded-[var(--radius-sm)] px-3 py-2">
                {state.error}
              </p>
            )}

            <SubmitButton pendingText="Scheduling…" className="sm:col-span-2">
              Schedule class
            </SubmitButton>
          </form>
        </Reveal>
      )}
    </div>
  );
}
