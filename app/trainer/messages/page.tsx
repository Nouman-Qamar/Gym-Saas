import Link from "next/link";
import { requireUser } from "@/lib/auth/current-user";
import { getTrainerMembers } from "@/lib/queries/trainer";
import { getThread } from "@/lib/queries/messages";
import { initials } from "@/lib/queries/shared";
import { MessageThread } from "@/components/ui/message-thread";
import { Reveal } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

export default async function TrainerMessagesPage({ searchParams }: { searchParams: Promise<{ to?: string }> }) {
  const user = await requireUser("TRAINER");
  const { to } = await searchParams;
  const members = await getTrainerMembers(user.id);
  const activeId = to ?? members[0]?.userId;
  const thread = activeId ? await getThread(user.id, activeId) : [];
  const activeMember = members.find((m) => m.userId === activeId);

  return (
    <main className="px-6 md:px-10 py-8 max-w-[1100px]">
      <Reveal className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Messages</h1>
        <p className="text-text-secondary text-sm mt-1">Direct line to your members.</p>
      </Reveal>

      <Reveal delay={0.08} className="rounded-[var(--radius-lg)] bg-surface border border-border-soft overflow-hidden grid grid-cols-1 sm:grid-cols-[240px_1fr] h-[600px]">
        <div className="border-b sm:border-b-0 sm:border-r border-border-soft overflow-y-auto">
          {members.map((m) => (
            <Link
              key={m.userId}
              href={`/trainer/messages?to=${m.userId}`}
              className={cn(
                "flex items-center gap-2.5 px-4 py-3 text-sm border-b border-border-soft last:border-0",
                activeId === m.userId ? "bg-accent-soft text-accent font-medium" : "hover:bg-bg-elevated"
              )}
            >
              <span className="h-8 w-8 rounded-full bg-surface-2 flex items-center justify-center text-[10px] font-semibold shrink-0">
                {initials(m.user.name)}
              </span>
              {m.user.name}
            </Link>
          ))}
          {members.length === 0 && <p className="text-sm text-text-muted p-4">No members yet.</p>}
        </div>

        <div className="min-h-0">
          {activeMember ? (
            <MessageThread currentUserId={user.id} receiverId={activeMember.userId} messages={thread} />
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-text-muted">Select a member to start messaging.</div>
          )}
        </div>
      </Reveal>
    </main>
  );
}
