"use client";

import { useActionState, useState, useTransition } from "react";
import { updateGym, updatePlanPrice } from "@/lib/actions/admin";
import { updateProfile } from "@/lib/actions/profile";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatMoney } from "@/lib/queries/shared";
import { Check, Pencil } from "lucide-react";

const inputClass =
  "h-11 w-full rounded-[var(--radius-sm)] bg-bg-elevated border border-border px-3.5 text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors";

export function GymSettingsForm({ name, address, phone }: { name: string; address: string | null; phone: string | null }) {
  const [state, formAction] = useActionState(updateGym, undefined);
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input name="name" defaultValue={name} placeholder="Gym name" required className={inputClass} />
      <input name="address" defaultValue={address ?? ""} placeholder="Address" className={inputClass} />
      <input name="phone" defaultValue={phone ?? ""} placeholder="Phone" className={inputClass} />
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <SubmitButton pendingText="Saving…" className="self-start px-6">
        Save gym details
      </SubmitButton>
    </form>
  );
}

export function ProfileForm({ name, phone }: { name: string; phone: string | null }) {
  const [state, formAction] = useActionState(updateProfile, undefined);
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input name="name" defaultValue={name} placeholder="Your name" required className={inputClass} />
      <input name="phone" defaultValue={phone ?? ""} placeholder="Phone" className={inputClass} />
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <SubmitButton pendingText="Saving…" className="self-start px-6">
        Save profile
      </SubmitButton>
    </form>
  );
}

export function PlanPriceRow({ id, name, priceCents }: { id: string; name: string; priceCents: number }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(priceCents / 100));
  const [pending, start] = useTransition();

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border-soft last:border-0">
      <span className="text-sm font-medium flex-1">{name}</span>
      {editing ? (
        <>
          <span className="text-xs text-text-muted">Rs.</span>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-8 w-24 rounded-[var(--radius-sm)] bg-bg-elevated border border-border px-2 text-sm"
          />
          <button
            disabled={pending}
            onClick={() => {
              const fd = new FormData();
              fd.set("planId", id);
              fd.set("priceCents", String(Number(value) * 100));
              start(async () => {
                await updatePlanPrice(undefined, fd);
                setEditing(false);
              });
            }}
            className="text-mint"
          >
            <Check size={16} />
          </button>
        </>
      ) : (
        <>
          <span className="text-sm text-text-secondary">{formatMoney(priceCents)}/mo</span>
          <button onClick={() => setEditing(true)} className="text-text-muted hover:text-accent">
            <Pencil size={14} />
          </button>
        </>
      )}
    </div>
  );
}
