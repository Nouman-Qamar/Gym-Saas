"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createGymAndAdmin } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/ui/submit-button";

const inputClass =
  "h-12 w-full rounded-[var(--radius-md)] bg-bg-elevated border border-border px-4 text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors";

export default function GymSignupPage() {
  const [state, formAction] = useActionState(createGymAndAdmin, undefined);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">Set up your gym</h1>
      <p className="text-text-secondary text-sm mb-6">
        You'll get an admin console, a shareable join code for members, and starter membership plans instantly.
      </p>

      <form action={formAction} className="flex flex-col gap-3">
        <input name="gymName" placeholder="Gym name (e.g. Ironline Fitness)" required className={inputClass} />
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

        {state?.error && (
          <p className="text-sm text-danger bg-danger-soft border border-danger/20 rounded-[var(--radius-sm)] px-3 py-2">
            {state.error}
          </p>
        )}

        <SubmitButton pendingText="Creating your gym…" className="mt-2">
          Create gym &amp; continue
        </SubmitButton>
      </form>

      <p className="text-sm text-text-secondary text-center mt-6">
        Joining an existing gym instead?{" "}
        <Link href="/signup/member" className="text-accent font-medium hover:underline">
          Use a join code
        </Link>
      </p>
    </div>
  );
}
