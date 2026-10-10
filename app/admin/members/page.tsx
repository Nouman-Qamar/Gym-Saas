import { requireUser } from "@/lib/auth/current-user";
import { getMembers, getMembershipPlans, getTrainers } from "@/lib/queries/admin";
import { Badge } from "@/components/ui/card";
import { formatMoney, initials } from "@/lib/queries/shared";
import { Reveal, Stagger, StaggerRow } from "@/components/ui/motion";
import { AddMemberPanel } from "./add-member-panel";
import { CheckInButton, TrainerSelect } from "./row-actions";
import { Flame } from "lucide-react";

const STATUS_TONE: Record<string, "mint" | "amber" | "danger" | "neutral"> = {
  ACTIVE: "mint",
  EXPIRING: "amber",
  EXPIRED: "danger",
  FROZEN: "neutral",
};

export default async function MembersPage() {
  const user = await requireUser("ADMIN");
  const [members, plans, trainers] = await Promise.all([
    getMembers(user.gymId),
    getMembershipPlans(user.gymId),
    getTrainers(user.gymId),
  ]);

  return (
    <main className="px-6 md:px-10 py-8 max-w-[1400px]">
      <Reveal className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Members</h1>
        <p className="text-text-secondary text-sm mt-1">{members.length} total — manage plans, trainers, and check-ins.</p>
      </Reveal>

      <AddMemberPanel plans={plans} trainers={trainers.map((t) => ({ id: t.id, name: t.name }))} />

      <Reveal delay={0.08} className="rounded-[var(--radius-lg)] bg-surface border border-border-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-soft text-left text-text-muted text-xs uppercase tracking-wide">
                <th className="px-5 py-3 font-medium">Member</th>
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Trainer</th>
                <th className="px-5 py-3 font-medium">Streak</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <Stagger as="tbody">
              {members.map((m) => {
                const membership = m.memberProfile?.memberships?.[0];
                return (
                  <StaggerRow key={m.id} className="border-b border-border-soft last:border-0 hover:bg-bg-elevated/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="h-9 w-9 rounded-full bg-surface-2 flex items-center justify-center text-xs font-semibold shrink-0">
                          {initials(m.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{m.name}</p>
                          <p className="text-xs text-text-muted truncate">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-text-secondary">{membership?.plan.name ?? "—"}</td>
                    <td className="px-5 py-3">
                      <Badge tone={STATUS_TONE[membership?.status ?? "FROZEN"]}>{membership?.status ?? "No plan"}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <TrainerSelect
                        memberId={m.id}
                        currentTrainerId={m.memberProfile?.trainerId ?? null}
                        trainers={trainers.map((t) => ({ id: t.id, name: t.name }))}
                      />
                    </td>
                    <td className="px-5 py-3">
                      {m.memberProfile?.streak?.currentStreak ? (
                        <span className="flex items-center gap-1 text-amber text-xs font-medium">
                          <Flame size={12} /> {m.memberProfile.streak.currentStreak}d
                        </span>
                      ) : (
                        <span className="text-text-muted text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <CheckInButton memberId={m.id} />
                    </td>
                  </StaggerRow>
                );
              })}
              {members.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-text-muted text-sm">
                    No members yet — add your first one above.
                  </td>
                </tr>
              )}
            </Stagger>
          </table>
        </div>
      </Reveal>
    </main>
  );
}
