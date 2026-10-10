"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/ui/submit-button";

const inputClass =
  "h-12 w-full rounded-[var(--radius-md)] bg-bg-elevated border border-border px-4 text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors";

export default function LoginPage() {
  const [state, formAction] = useActionState(login, undefined);
  const searchParams = useSearchParams();
  const justReset = searchParams.get("reset") === "success";

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">Welcome back</h1>
      <p className="text-text-secondary text-sm mb-6">Log in to pick up right where you left off.</p>

      {justReset && (
        <p className="text-sm text-mint bg-mint-soft border border-mint/20 rounded-[var(--radius-sm)] px-3 py-2 mb-3">
          Password updated — log in with your new password.
        </p>
      )}

      <form action={formAction} className="flex flex-col gap-3">
        <input name="email" type="email" placeholder="Email" required className={inputClass} />
        <input name="password" type="password" placeholder="Password" required className={inputClass} />

        <div className="flex justify-end -mt-1">
          <Link href="/forgot-password" className="text-xs text-text-muted hover:text-accent transition-colors">
            Forgot password?
          </Link>
        </div>

        {state?.error && (
          <p className="text-sm text-danger bg-danger-soft border border-danger/20 rounded-[var(--radius-sm)] px-3 py-2">
            {state.error}
          </p>
        )}

        <SubmitButton pendingText="Logging in…" className="mt-2">
          Log in
        </SubmitButton>
      </form>

      <div className="mt-6 pt-6 border-t border-border-soft space-y-3">
        <p className="text-xs text-text-muted text-center">Demo access — no signup required</p>
        <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-text-secondary">
          <div className="rounded-[var(--radius-sm)] bg-bg-elevated border border-border-soft py-2 px-1">
            <p className="font-medium text-text-primary">Admin</p>
            <p>admin@demo.gym</p>
          </div>
          <div className="rounded-[var(--radius-sm)] bg-bg-elevated border border-border-soft py-2 px-1">
            <p className="font-medium text-text-primary">Trainer</p>
            <p>trainer@demo.gym</p>
          </div>
          <div className="rounded-[var(--radius-sm)] bg-bg-elevated border border-border-soft py-2 px-1">
            <p className="font-medium text-text-primary">Member</p>
            <p>member@demo.gym</p>
          </div>
        </div>
        <p className="text-[11px] text-text-muted text-center">password for all: demopass123</p>
      </div>

      <p className="text-sm text-text-secondary text-center mt-6">
        New here?{" "}
        <Link href="/signup" className="text-accent font-medium hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
