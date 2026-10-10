import Link from "next/link";
import { requireUser } from "@/lib/auth/current-user";
import { getTrainerMembers, getTrainerMemberProgress } from "@/lib/queries/trainer";
import { cn } from "@/lib/utils";
import { WeightChart } from "@/components/ui/weight-chart";
import { initials, timeAgo } from "@/lib/queries/shared";
import { Reveal } from "@/components/ui/motion";
import { Flame } from "lucide-react";

export default async function TrainerProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ member?: string }>;
}) {
  const user = await requireUser("TRAINER");
  const { member: memberParam } = await searchParams;
  const members = await getTrainerMembers(user.id);
  const activeId = memberParam ?? members[0]?.userId;
  const detail = activeId ? await getTrainerMemberProgress(user.id, activeId) : null;

  return (
    <main className="px-6 md:px-10 py-8 max-w-[1200px]">
      <Reveal className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Progress</h1>
        <p className="text-text-secondary text-sm mt-1">Track how your members are trending.</p>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {members.map((m) => (
            <Link
              key={m.userId}
              href={`/trainer/progress?member=${m.userId}`}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius-md)] text-sm whitespace-nowrap shrink-0",
                activeId === m.userId ? "bg-accent-soft text-accent font-medium" : "text-text-secondary hover:bg-surface"
              )}
            >
              <span className="h-7 w-7 rounded-full bg-surface-2 flex items-center justify-center text-[10px] font-semibold shrink-0">
                {initials(m.user.name)}
              </span>
              {m.user.name}
            </Link>
          ))}
          {members.length === 0 && <p className="text-sm text-text-muted">No members yet.</p>}
        </div>

        {detail ? (
          <div key={activeId} className="space-y-4">
            <Reveal className="rounded-[var(--radius-lg)] bg-surface border border-border-soft p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold">Weight trend</h3>
                {!!detail.streak?.currentStreak && (
                  <span className="flex items-center gap-1 text-amber text-xs font-medium">
                    <Flame size={13} /> {detail.streak.currentStreak}-day streak
                  </span>
                )}
              </div>
              <WeightChart
                data={detail.bodyMetrics
                  .filter((b) => b.weightKg != null)
                  .map((b) => ({ date: b.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }), weightKg: b.weightKg! }))}
              />
            </Reveal>

            <Reveal delay={0.06} className="rounded-[var(--radius-lg)] bg-surface border border-border-soft p-5">
              <h3 className="font-display text-lg font-semibold mb-4">Recent workouts</h3>
              <div className="space-y-2">
                {detail.workoutLogs.map((l) => (
                  <div key={l.id} className="flex items-center justify-between text-sm py-2 border-b border-border-soft last:border-0">
                    <span className="text-text-secondary">{timeAgo(l.completedAt)}</span>
                    <span>{l.durationMinutes} min · {l.caloriesBurned} kcal</span>
                  </div>
                ))}
                {detail.workoutLogs.length === 0 && <p className="text-sm text-text-muted">No workouts logged yet.</p>}
              </div>
            </Reveal>

            {detail.badges.length > 0 && (
              <Reveal delay={0.12} className="rounded-[var(--radius-lg)] bg-surface border border-border-soft p-5">
                <h3 className="font-display text-lg font-semibold mb-3">Badges earned</h3>
                <div className="flex flex-wrap gap-2">
                  {detail.badges.map((b) => (
                    <span key={b.badgeId} className="text-xs bg-surface-2 rounded-full px-3 py-1.5 flex items-center gap-1.5">
                      <span>{b.badge.icon}</span> {b.badge.name}
                    </span>
                  ))}
                </div>
              </Reveal>
            )}
          </div>
        ) : (
          <p className="text-sm text-text-muted">Select a member to see their progress.</p>
        )}
      </div>
    </main>
  );
}
