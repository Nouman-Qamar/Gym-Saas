import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireUser } from "@/lib/auth/current-user";
import { getMemberProfile, getMemberTrainer } from "@/lib/queries/member";
import { getThread } from "@/lib/queries/messages";
import { MessageThread } from "@/components/ui/message-thread";
import { Reveal } from "@/components/ui/motion";
import { initials } from "@/lib/queries/shared";

export default async function MemberMessagesPage() {
  const user = await requireUser("MEMBER");
  const profile = await getMemberProfile(user.id);
  const trainer = await getMemberTrainer(profile?.trainerId ?? null);
  const thread = trainer ? await getThread(user.id, trainer.id) : [];

  return (
    <div className="px-5 pt-6 pb-0 flex flex-col h-full">
      <Link href="/member/dashboard" className="text-sm text-text-muted flex items-center gap-1 mb-4">
        <ChevronLeft size={15} /> Home
      </Link>

      {trainer ? (
        <>
          <Reveal className="flex items-center gap-3 mb-4">
            <span className="h-10 w-10 rounded-full bg-accent-soft text-accent flex items-center justify-center text-sm font-semibold">
              {initials(trainer.name)}
            </span>
            <div>
              <p className="font-display font-semibold text-sm">{trainer.name}</p>
              <p className="text-xs text-text-muted">Your trainer</p>
            </div>
          </Reveal>
          <div className="flex-1 min-h-0 -mx-5 border-t border-border-soft">
            <MessageThread currentUserId={user.id} receiverId={trainer.id} messages={thread} />
          </div>
        </>
      ) : (
        <p className="text-sm text-text-muted">You don't have a trainer assigned yet.</p>
      )}
    </div>
  );
}
