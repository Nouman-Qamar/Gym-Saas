import { requireUser } from "@/lib/auth/current-user";
import { getActivePlan, getMemberWorkoutLogs, getMemberDashboard } from "@/lib/queries/member";
import { CompleteWorkoutButton } from "@/components/ui/complete-workout-button";
import { Badge } from "@/components/ui/card";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function MemberWorkoutsPage() {
  const user = await requireUser("MEMBER");
  const [plan, logs, dashboard] = await Promise.all([
    getActivePlan(user.id),
    getMemberWorkoutLogs(user.id, 10),
    getMemberDashboard(user.id, user.gymId),
  ]);

  return (
    <div className="px-5 pt-6 pb-8">
      <Link href="/member/dashboard" className="text-sm text-text-muted flex items-center gap-1 mb-4">
        <ChevronLeft size={15} /> Home
      </Link>
      <Reveal>
        <h1 className="font-display text-2xl font-semibold mb-1">Your plan</h1>
      </Reveal>
      {plan ? (
        <>
          <p className="text-text-secondary text-sm mb-6">
            {plan.title} {plan.trainer && `· coached by ${plan.trainer.name}`}
          </p>

          <Stagger className="space-y-4 mb-8">
            {plan.days.map((day) => {
              const isToday = dashboard.todaysDay?.id === day.id;
              return (
                <StaggerItem
                  key={day.id}
                  className={`rounded-[var(--radius-lg)] border p-4 ${isToday ? "border-accent bg-accent-soft" : "border-border-soft bg-surface"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-display font-semibold text-sm">{day.dayLabel}</p>
                    {isToday && <Badge tone="accent">Today</Badge>}
                  </div>
                  <div className="space-y-1.5 mb-3">
                    {day.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary">{item.exercise.name}</span>
                        <span className="text-text-muted">
                          {item.sets} × {item.reps}
                        </span>
                      </div>
                    ))}
                    {day.items.length === 0 && <p className="text-xs text-text-muted">No exercises yet.</p>}
                  </div>
                  {isToday && (
                    <CompleteWorkoutButton
                      planDayId={day.id}
                      done={dashboard.alreadyDoneToday}
                      label="Mark complete"
                      doneLabel="Done today ✓"
                    />
                  )}
                </StaggerItem>
              );
            })}
          </Stagger>
        </>
      ) : (
        <p className="text-sm text-text-secondary mb-8">No workout plan yet — ask your trainer to build one for you.</p>
      )}

      <p className="text-sm font-medium text-text-secondary mb-3">Recent history</p>
      <Stagger className="space-y-2">
        {logs.map((l) => (
          <StaggerItem key={l.id} className="rounded-[var(--radius-md)] bg-surface border border-border-soft p-3.5 flex items-center justify-between text-sm">
            <span className="text-text-secondary">{l.completedAt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
            <span>
              {l.durationMinutes} min · {l.caloriesBurned} kcal
            </span>
          </StaggerItem>
        ))}
        {logs.length === 0 && <p className="text-sm text-text-muted">No workouts logged yet.</p>}
      </Stagger>
    </div>
  );
}
