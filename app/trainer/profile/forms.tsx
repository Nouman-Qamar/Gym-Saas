"use client";

import { useActionState } from "react";
import { updateProfile } from "@/lib/actions/profile";
import { updateTrainerProfile } from "@/lib/actions/trainer";
import { SubmitButton } from "@/components/ui/submit-button";

const inputClass =
  "h-11 w-full rounded-[var(--radius-sm)] bg-bg-elevated border border-border px-3.5 text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors";

export function TrainerProfileForm({ name, phone }: { name: string; phone: string | null }) {
  const [state, formAction] = useActionState(updateProfile, undefined);
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input name="name" defaultValue={name} required className={inputClass} />
      <input name="phone" defaultValue={phone ?? ""} placeholder="Phone" className={inputClass} />
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <SubmitButton pendingText="Saving…" className="self-start px-6">
        Save profile
      </SubmitButton>
    </form>
  );
}

export function TrainerSpecialtyForm({ specialty, bio }: { specialty: string | null; bio: string | null }) {
  const [state, formAction] = useActionState(updateTrainerProfile, undefined);
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input name="specialty" defaultValue={specialty ?? ""} placeholder="Specialty" className={inputClass} />
      <textarea name="bio" defaultValue={bio ?? ""} placeholder="Short bio" rows={3} className={inputClass} />
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <SubmitButton pendingText="Saving…" className="self-start px-6">
        Save
      </SubmitButton>
    </form>
  );
}
