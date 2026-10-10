import { requireUser } from "@/lib/auth/current-user";
import { getAnnouncements } from "@/lib/queries/admin";
import { timeAgo } from "@/lib/queries/shared";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { AnnouncementComposer, DeleteAnnouncementButton, PinnedTag } from "./composer";
import { Megaphone } from "lucide-react";

export default async function AnnouncementsPage() {
  const user = await requireUser("ADMIN");
  const rows = await getAnnouncements(user.gymId);

  return (
    <main className="px-6 md:px-10 py-8 max-w-[900px]">
      <Reveal className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Announcements</h1>
        <p className="text-text-secondary text-sm mt-1">Broadcast updates — they show up in every member's app.</p>
      </Reveal>

      <AnnouncementComposer />

      <Stagger className="space-y-3">
        {rows.map((a) => (
          <StaggerItem key={a.id} className="rounded-[var(--radius-lg)] bg-surface border border-border-soft p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <span className="h-9 w-9 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
                  <Megaphone size={16} />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{a.title}</p>
                    {a.pinned && <PinnedTag />}
                  </div>
                  <p className="text-sm text-text-secondary mt-1">{a.body}</p>
                  <p className="text-xs text-text-muted mt-2">
                    {a.author.name} · {timeAgo(a.createdAt)}
                  </p>
                </div>
              </div>
              <DeleteAnnouncementButton id={a.id} />
            </div>
          </StaggerItem>
        ))}
        {rows.length === 0 && <p className="text-sm text-text-muted">No announcements yet.</p>}
      </Stagger>
    </main>
  );
}
