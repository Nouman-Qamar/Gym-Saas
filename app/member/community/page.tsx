import Link from "next/link";
import { ChevronLeft, Trophy } from "lucide-react";
import { requireUser } from "@/lib/auth/current-user";
import { getActiveChallenge } from "@/lib/queries/member";
import { initials } from "@/lib/queries/shared";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

export default async function CommunityPage() {
  const user = await requireUser("MEMBER");
  const data = await getActiveChallenge(user.gymId, user.id);

  return (
    <div className="px-5 pt-6 pb-8">
      <Link href="/member/dashboard" className="text-sm text-text-muted flex items-center gap-1 mb-4">
        <ChevronLeft size={15} /> Home
      </Link>
      <Reveal>
        <h1 className="font-display text-2xl font-semibold mb-1">Community</h1>
        <p className="text-text-secondary text-sm mb-6">Friendly competition keeps everyone moving.</p>
      </Reveal>

      {data ? (
        <>
          <Reveal delay={0.06} className="rounded-[var(--radius-lg)] bg-gradient-to-br from-accent to-accent-strong text-white p-5 mb-5">
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={16} />
              <p className="font-display font-semibold">{data.challenge.title}</p>
            </div>
            <p className="text-white/80 text-xs mb-2">{data.challenge.description}</p>
            {data.myRank && <p className="text-white/90 text-sm font-medium">You're #{data.myRank}</p>}
          </Reveal>

          <Stagger className="space-y-2">
            {data.entries.map((e, i) => {
              const mine = e.memberId === user.id;
              return (
                <StaggerItem
                  key={e.memberId}
                  className={`rounded-[var(--radius-md)] border p-3.5 flex items-center gap-3 ${
                    mine ? "border-accent bg-accent-soft" : "border-border-soft bg-surface"
                  }`}
                >
                  <span
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      i === 0 ? "bg-amber text-bg" : i === 1 ? "bg-text-secondary text-bg" : i === 2 ? "bg-[#B87333] text-white" : "bg-surface-2 text-text-secondary"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="h-8 w-8 rounded-full bg-surface-2 flex items-center justify-center text-[10px] font-semibold shrink-0">
                    {initials(e.member.user.name)}
                  </span>
                  <span className="flex-1 text-sm font-medium truncate">{mine ? "You" : e.member.user.name}</span>
                  <span className="text-sm font-semibold">{e.score}</span>
                </StaggerItem>
              );
            })}
          </Stagger>
        </>
      ) : (
        <p className="text-sm text-text-muted">No active challenge right now — check back soon.</p>
      )}
    </div>
  );
}
