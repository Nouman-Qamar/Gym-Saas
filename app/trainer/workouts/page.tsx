import Link from "next/link";
import { requireUser } from "@/lib/auth/current-user";
import { getTrainerWorkoutPlans, getTrainerMembers } from "@/lib/queries/trainer";
import { CreatePlanPanel } from "./create-plan-panel";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { ChevronRight } from "lucide-react";

export default async function TrainerWorkoutsPage() {
  const user = await requireUser("TRAINER");
  const [plans, members] = await Promise.all([getTrainerWorkoutPlans(user.id), getTrainerMembers(user.id)]);

  return (
    <main className="px-6 md:px-10 py-8 max-w-[1200px]">
      <Reveal className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Workout plans</h1>
        <p className="text-text-secondary text-sm mt-1">{plans.length} plans you've built</p>
      </Reveal>

      <CreatePlanPanel members={members.map((m) => ({ id: m.userId, name: m.user.name }))} />

      <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {plans.map((p) => (
          <StaggerItem key={p.id}>
            <Link
              href={`/trainer/workouts/${p.id}`}
              className="rounded-[var(--radius-lg)] bg-surface border border-border-soft p-5 hover:border-accent/40 transition-colors flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{p.title}</p>
                <p className="text-xs text-text-muted mt-0.5 truncate">
                  {p.member.user.name} · {p.days.length} day{p.days.length === 1 ? "" : "s"}
                </p>
              </div>
              <ChevronRight size={16} className="text-text-muted shrink-0" />
            </Link>
          </StaggerItem>
        ))}
        {plans.length === 0 && <p className="text-sm text-text-muted">No plans yet — build your first one above.</p>}
      </Stagger>
    </main>
  );
}
