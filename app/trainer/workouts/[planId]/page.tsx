import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireUser } from "@/lib/auth/current-user";
import { getWorkoutPlanDetail } from "@/lib/queries/trainer";
import { getExercises } from "@/lib/queries/admin";
import { AddDayForm, AddExerciseForm, RemoveExerciseButton } from "./builder";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

export default async function PlanDetailPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params;
  const user = await requireUser("TRAINER");
  const [plan, exercises] = await Promise.all([getWorkoutPlanDetail(user.id, planId), getExercises(user.gymId)]);

  if (!plan) notFound();

  return (
    <main className="px-6 md:px-10 py-8 max-w-[900px]">
      <Link href="/trainer/workouts" className="text-sm text-text-muted hover:text-text-primary flex items-center gap-1 mb-4">
        <ChevronLeft size={15} /> All plans
      </Link>

      <Reveal className="mb-6">
        <h1 className="font-display text-2xl font-semibold">{plan.title}</h1>
        <p className="text-text-secondary text-sm mt-1">
          {plan.member.user.name} {plan.goal && `· ${plan.goal}`}
        </p>
      </Reveal>

      <Stagger className="space-y-4 mb-6">
        {plan.days.map((day) => (
          <StaggerItem key={day.id} className="rounded-[var(--radius-lg)] bg-surface border border-border-soft p-5">
            <h3 className="font-display font-semibold mb-3">{day.dayLabel}</h3>
            <div className="space-y-2">
              {day.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-2 border-b border-border-soft last:border-0">
                  <span className="flex-1 text-sm font-medium">{item.exercise.name}</span>
                  <span className="text-xs text-text-muted">
                    {item.sets} × {item.reps}
                  </span>
                  <span className="text-xs text-text-muted">{item.restSeconds}s rest</span>
                  <RemoveExerciseButton id={item.id} planId={plan.id} />
                </div>
              ))}
              {day.items.length === 0 && <p className="text-xs text-text-muted">No exercises yet.</p>}
            </div>
            <div className="mt-3">
              <AddExerciseForm planId={plan.id} dayId={day.id} exercises={exercises} />
            </div>
          </StaggerItem>
        ))}
        {plan.days.length === 0 && <p className="text-sm text-text-muted">No days yet — add one below.</p>}
      </Stagger>

      <AddDayForm planId={plan.id} />
    </main>
  );
}
