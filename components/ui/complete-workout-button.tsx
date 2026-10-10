"use client";

import { useActionState, useEffect, useRef } from "react";
import { ChevronRight, Check } from "lucide-react";
import { logWorkout } from "@/lib/actions/member";

export function CompleteWorkoutButton({
  planDayId,
  durationMinutes = 45,
  caloriesBurned = 400,
  label = "Start workout",
  doneLabel = "Completed today ✓",
  done = false,
}: {
  planDayId?: string;
  durationMinutes?: number;
  caloriesBurned?: number;
  label?: string;
  doneLabel?: string;
  done?: boolean;
}) {
  const [state, formAction] = useActionState(logWorkout, undefined);
  const fired = useRef(false);

  useEffect(() => {
    if (state !== undefined && !state.error && !fired.current) {
      fired.current = true;
      import("canvas-confetti").then(({ default: confetti }) => {
        const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#FF3E63";
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.7 },
          colors: ["#ffffff", accent],
        });
      });
    }
  }, [state]);

  if (done) {
    return (
      <button
        disabled
        className="h-12 px-6 rounded-[var(--radius-md)] bg-white/15 text-white font-semibold text-sm flex items-center gap-2"
      >
        <Check size={16} /> {doneLabel}
      </button>
    );
  }

  return (
    <form action={formAction}>
      {planDayId && <input type="hidden" name="planDayId" value={planDayId} />}
      <input type="hidden" name="durationMinutes" value={durationMinutes} />
      <input type="hidden" name="caloriesBurned" value={caloriesBurned} />
      <button
        type="submit"
        className="h-12 px-6 rounded-[var(--radius-md)] bg-white text-accent-strong font-semibold text-sm flex items-center gap-2 active:scale-[0.98] transition-transform"
      >
        {label} <ChevronRight size={16} />
      </button>
    </form>
  );
}
