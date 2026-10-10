"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Building2 } from "lucide-react";
import { platformLogin } from "@/lib/actions/platform";
import { SubmitButton } from "@/components/ui/submit-button";

const inputClass =
  "h-12 w-full rounded-[var(--radius-md)] bg-bg-elevated border border-border px-4 text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors";

export default function PlatformLoginPage() {
  const [state, formAction] = useActionState(platformLogin, undefined);

  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center px-5 py-12 bg-bg">
      <div className="pointer-events-none absolute -top-32 -left-24 h-72 w-72 rounded-full bg-violet/25 blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-accent-2/20 blur-[100px]" />

      <div className="relative w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <span className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet to-accent-strong flex items-center justify-center shadow-lg shadow-violet/30">
            <Building2 size={19} className="text-white" />
          </span>
          <span className="font-display text-xl font-semibold">Ironline Platform</span>
        </Link>

        <div className="rounded-[var(--radius-lg)] bg-surface border border-border-soft p-7 sm:p-8 shadow-2xl shadow-black/20">
          <h1 className="font-display text-2xl font-semibold mb-1">Owner console</h1>
          <p className="text-text-secondary text-sm mb-6">Manage every gym on the platform from one place.</p>

          <form action={formAction} className="flex flex-col gap-3">
            <input name="email" type="email" placeholder="Email" required className={inputClass} />
            <input name="password" type="password" placeholder="Password" required className={inputClass} />

            {state?.error && (
              <p className="text-sm text-danger bg-danger-soft border border-danger/20 rounded-[var(--radius-sm)] px-3 py-2">
                {state.error}
              </p>
            )}

            <SubmitButton pendingText="Signing in…" className="mt-2">
              Sign in
            </SubmitButton>
          </form>

          <p className="text-xs text-text-muted text-center mt-6">
            This is a separate login from gym staff and members — for the team operating Ironline itself.
          </p>
        </div>
      </div>
    </main>
  );
}
