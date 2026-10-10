import Link from "next/link";
import { requireUser } from "@/lib/auth/current-user";
import { getTrainerMembers } from "@/lib/queries/trainer";
import { initials, timeAgo } from "@/lib/queries/shared";
import { Badge } from "@/components/ui/card";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { Flame, MessageCircle } from "lucide-react";

export default async function TrainerMembersPage() {
  const user = await requireUser("TRAINER");
  const members = await getTrainerMembers(user.id);

  return (
    <main className="px-6 md:px-10 py-8 max-w-[1200px]">
      <Reveal className="mb-6">
        <h1 className="font-display text-2xl font-semibold">My members</h1>
        <p className="text-text-secondary text-sm mt-1">{members.length} assigned to you</p>
      </Reveal>

      <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {members.map((m) => (
          <StaggerItem key={m.userId} className="rounded-[var(--radius-lg)] bg-surface border border-border-soft p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="h-11 w-11 rounded-full bg-surface-2 flex items-center justify-center text-sm font-semibold shrink-0">
                {initials(m.user.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{m.user.name}</p>
                <p className="text-xs text-text-muted truncate">{m.goal ?? "No goal set"}</p>
              </div>
              {m.memberships[0] && <Badge tone="accent">{m.memberships[0].plan.name}</Badge>}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted">
                {m.workoutLogs[0] ? `Last workout ${timeAgo(m.workoutLogs[0].completedAt)}` : "No workouts logged"}
              </span>
              <div className="flex items-center gap-3">
                {!!m.streak?.currentStreak && (
                  <span className="flex items-center gap-1 text-amber font-medium">
                    <Flame size={12} /> {m.streak.currentStreak}d
                  </span>
                )}
                <Link href={`/trainer/messages?to=${m.userId}`} className="text-accent hover:underline flex items-center gap-1">
                  <MessageCircle size={12} /> Message
                </Link>
              </div>
            </div>
          </StaggerItem>
        ))}
        {members.length === 0 && <p className="text-sm text-text-muted">No members assigned to you yet.</p>}
      </Stagger>
    </main>
  );
}
