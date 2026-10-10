"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { joinGymAsMember } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/ui/submit-button";

const inputClass =
  "h-12 w-full rounded-[var(--radius-md)] bg-bg-elevated border border-border px-4 text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors";

export default function MemberSignupPage() {
  const [state, formAction] = useActionState(joinGymAsMember, undefined);
  const params = useSearchParams();
  const ref = params.get("ref") ?? "";

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">Join your gym</h1>
      <p className="text-text-secondary text-sm mb-6">Ask the front desk for your gym's join code, or find it on their signage.</p>

      <form action={formAction} className="flex flex-col gap-3">
        <input name="gymCode" placeholder="Gym join code" required className={inputClass} />
        <input name="name" placeholder="Your full name" required className={inputClass} />
        <input name="email" type="email" placeholder="Email" required className={inputClass} />
        <input
          name="password"
          type="password"
          placeholder="Password (min. 8 characters)"
          minLength={8}
          required
          className={inputClass}
        />
        <input
          name="referralCode"
          placeholder="Referral code (optional)"
          defaultValue={ref}
          className={inputClass}
        />

        {state?.error && (
          <p className="text-sm text-danger bg-danger-soft border border-danger/20 rounded-[var(--radius-sm)] px-3 py-2">
            {state.error}
          </p>
        )}

        <SubmitButton pendingText="Joining…" className="mt-2">
          Join &amp; continue
        </SubmitButton>
      </form>

      <p className="text-sm text-text-secondary text-center mt-6">
        Setting up a gym instead?{" "}
        <Link href="/signup/gym" className="text-accent font-medium hover:underline">
          Start here
        </Link>
      </p>
    </div>
  );
}
