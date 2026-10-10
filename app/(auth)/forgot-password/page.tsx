"use client";

import Link from "next/link";
import { useActionState } from "react";
import { motion } from "framer-motion";
import { MailCheck, ArrowLeft } from "lucide-react";
import { requestPasswordReset } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/ui/submit-button";

const inputClass =
  "h-12 w-full rounded-[var(--radius-md)] bg-bg-elevated border border-border px-4 text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors";

export default function ForgotPasswordPage() {
  const [state, formAction] = useActionState(requestPasswordReset, undefined);

  if (state?.sent) {
    return (
      <motion.div
        className="text-center py-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <span className="mx-auto h-14 w-14 rounded-full bg-mint-soft text-mint flex items-center justify-center mb-4">
          <MailCheck size={24} />
        </span>
        <h1 className="font-display text-xl font-semibold mb-2">Check your email</h1>
        <p className="text-text-secondary text-sm max-w-xs mx-auto">
          If an account exists for that address, we've sent a link to reset your password. It expires in 1 hour.
        </p>
        <Link href="/login" className="inline-flex items-center gap-1.5 text-accent text-sm font-medium mt-6 hover:underline">
          <ArrowLeft size={14} /> Back to log in
        </Link>
      </motion.div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">Forgot your password?</h1>
      <p className="text-text-secondary text-sm mb-6">Enter your email and we'll send you a reset link.</p>

      <form action={formAction} className="flex flex-col gap-3">
        <input name="email" type="email" placeholder="Email" required className={inputClass} />

        {state?.error && (
          <p className="text-sm text-danger bg-danger-soft border border-danger/20 rounded-[var(--radius-sm)] px-3 py-2">
            {state.error}
          </p>
        )}

        <SubmitButton pendingText="Sending…" className="mt-2">
          Send reset link
        </SubmitButton>
      </form>

      <p className="text-sm text-text-secondary text-center mt-6">
        <Link href="/login" className="text-accent font-medium hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
