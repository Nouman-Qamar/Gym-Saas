import { requireUser } from "@/lib/auth/current-user";
import { getExercises, getAllWorkoutPlans } from "@/lib/queries/admin";
import { Badge } from "@/components/ui/card";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { AddExercisePanel } from "./add-exercise-panel";

export default async function AdminWorkoutsPage() {
  const user = await requireUser("ADMIN");
  const [exercises, plans] = await Promise.all([getExercises(user.gymId), getAllWorkoutPlans(user.gymId)]);

  const grouped = exercises.reduce<Record<string, typeof exercises>>((acc, e) => {
    (acc[e.muscleGroup] ??= []).push(e);
    return acc;
  }, {});

  return (
    <main className="px-6 md:px-10 py-8 max-w-[1400px]">
      <Reveal className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Workouts</h1>
        <p className="text-text-secondary text-sm mt-1">Exercise library and active plans across your gym.</p>
      </Reveal>

      <AddExercisePanel />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Reveal delay={0.06} className="rounded-[var(--radius-lg)] bg-surface border border-border-soft p-5">
          <h3 className="font-display text-lg font-semibold mb-4">Exercise library ({exercises.length})</h3>
          <Stagger className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {Object.entries(grouped).map(([group, list]) => (
              <StaggerItem key={group}>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">{group}</p>
                <div className="flex flex-wrap gap-1.5">
                  {list.map((e) => (
                    <span key={e.id} className="text-xs bg-surface-2 rounded-full px-3 py-1.5">
                      {e.name}
                      {e.equipment && <span className="text-text-muted"> · {e.equipment}</span>}
                    </span>
                  ))}
                </div>
              </StaggerItem>
            ))}
            {exercises.length === 0 && <p className="text-sm text-text-muted">No exercises yet.</p>}
          </Stagger>
        </Reveal>

        <Reveal delay={0.12} className="rounded-[var(--radius-lg)] bg-surface border border-border-soft p-5">
          <h3 className="font-display text-lg font-semibold mb-4">Active plans ({plans.length})</h3>
          <Stagger className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {plans.map((p) => (
              <StaggerItem key={p.id} className="rounded-[var(--radius-md)] bg-bg-elevated border border-border-soft p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold">{p.title}</p>
                  <Badge tone="accent">{p.days.length} day{p.days.length === 1 ? "" : "s"}</Badge>
                </div>
                <p className="text-xs text-text-muted">
                  {p.member.user.name} · coached by {p.trainer?.name ?? "self-guided"}
                </p>
              </StaggerItem>
            ))}
            {plans.length === 0 && <p className="text-sm text-text-muted">No workout plans yet — trainers build these from their dashboard.</p>}
          </Stagger>
        </Reveal>
      </div>
    </main>
  );
}
