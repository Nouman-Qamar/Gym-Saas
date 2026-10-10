"use client";

import { useActionState } from "react";
import { updateProfile, updateGender } from "@/lib/actions/profile";
import { SubmitButton } from "@/components/ui/submit-button";
import { Check } from "lucide-react";
import type { Gender } from "@/lib/theme";
import { Stagger, StaggerItem } from "@/components/ui/motion";

const inputClass =
  "h-11 w-full rounded-[var(--radius-sm)] bg-bg-elevated border border-border px-3.5 text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors";

export function MemberProfileForm({ name, phone }: { name: string; phone: string | null }) {
  const [state, formAction] = useActionState(updateProfile, undefined);
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input name="name" defaultValue={name} required className={inputClass} />
      <input name="phone" defaultValue={phone ?? ""} placeholder="Phone" className={inputClass} />
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <SubmitButton pendingText="Saving…" className="self-start px-6">
        Save
      </SubmitButton>
    </form>
  );
}

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
  { value: "UNSPECIFIED", label: "Prefer not to say" },
];

export function GenderForm({ current }: { current: Gender }) {
  const [, formAction] = useActionState(updateGender, undefined);

  return (
    <form action={formAction}>
      <Stagger className="grid grid-cols-2 gap-2">
        {GENDER_OPTIONS.map((opt) => (
          <StaggerItem key={opt.value}>
            <button
              type="submit"
              name="gender"
              value={opt.value}
              className={`w-full text-left rounded-[var(--radius-sm)] border px-3 py-2.5 text-sm transition-colors ${
                current === opt.value ? "border-accent bg-accent-soft text-accent" : "border-border-soft bg-bg-elevated hover:border-border"
              }`}
            >
              <span className="flex items-center justify-between">
                {opt.label}
                {current === opt.value && <Check size={13} />}
              </span>
            </button>
          </StaggerItem>
        ))}
      </Stagger>
    </form>
  );
}
