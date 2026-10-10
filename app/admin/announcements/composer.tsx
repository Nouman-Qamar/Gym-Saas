"use client";

import { useActionState, useTransition } from "react";
import { Pin, Trash2 } from "lucide-react";
import { createAnnouncement, deleteAnnouncement } from "@/lib/actions/admin";
import { SubmitButton } from "@/components/ui/submit-button";

const inputClass =
  "w-full rounded-[var(--radius-sm)] bg-bg-elevated border border-border px-3.5 py-2.5 text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors";

export function AnnouncementComposer() {
  const [state, formAction] = useActionState(createAnnouncement, undefined);
  return (
    <form action={formAction} className="rounded-[var(--radius-lg)] bg-surface border border-border-soft p-5 mb-6 flex flex-col gap-3">
      <input name="title" placeholder="Announcement title" required className={inputClass} />
      <textarea name="body" placeholder="What's the update?" required rows={3} className={inputClass} />
      <label className="flex items-center gap-2 text-sm text-text-secondary">
        <input type="checkbox" name="pinned" className="accent-[var(--accent)]" />
        Pin to top
      </label>
      {state?.error && (
        <p className="text-sm text-danger bg-danger-soft border border-danger/20 rounded-[var(--radius-sm)] px-3 py-2">{state.error}</p>
      )}
      <SubmitButton pendingText="Posting…" className="self-start px-6">
        Post announcement
      </SubmitButton>
    </form>
  );
}

export function DeleteAnnouncementButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(() => deleteAnnouncement(id))}
      disabled={pending}
      className="text-text-muted hover:text-danger transition-colors disabled:opacity-50"
      title="Delete"
    >
      <Trash2 size={14} />
    </button>
  );
}

export function PinnedTag() {
  return (
    <span className="flex items-center gap-1 text-[11px] text-amber font-medium">
      <Pin size={11} /> Pinned
    </span>
  );
}
