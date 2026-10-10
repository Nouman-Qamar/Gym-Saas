"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPassword } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/ui/submit-button";

const inputClass =
  "h-12 w-full rounded-[var(--radius-md)] bg-bg-elevated border border-border px-4 text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(resetPassword, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="token" value={token} />
      <input name="password" type="password" placeholder="New password" required minLength={8} className={inputClass} />

      {state?.error && (
        <p className="text-sm text-danger bg-danger-soft border border-danger/20 rounded-[var(--radius-sm)] px-3 py-2">
          {state.error}
        </p>
      )}

      <SubmitButton pendingText="Saving…" className="mt-2">
        Set new password
      </SubmitButton>

      <p className="text-sm text-text-secondary text-center mt-3">
        <Link href="/login" className="text-accent font-medium hover:underline">
          Back to log in
        </Link>
      </p>
    </form>
  );
}
