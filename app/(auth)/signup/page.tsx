import Link from "next/link";
import { Building2, UserRound, ChevronRight } from "lucide-react";

export default function SignupChoicePage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">Create your account</h1>
      <p className="text-text-secondary text-sm mb-6">Are you starting a gym, or joining one that already uses Ironline?</p>

      <div className="flex flex-col gap-3">
        <Link
          href="/signup/gym"
          className="group flex items-center gap-4 rounded-[var(--radius-md)] border border-border-soft bg-bg-elevated p-4 hover:border-accent/50 transition-colors"
        >
          <span className="h-11 w-11 rounded-xl bg-accent-soft text-accent flex items-center justify-center shrink-0">
            <Building2 size={19} />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-semibold">I run a gym</span>
            <span className="block text-xs text-text-muted mt-0.5">Set up your gym's admin console in under a minute</span>
          </span>
          <ChevronRight size={16} className="text-text-muted group-hover:text-accent transition-colors" />
        </Link>

        <Link
          href="/signup/member"
          className="group flex items-center gap-4 rounded-[var(--radius-md)] border border-border-soft bg-bg-elevated p-4 hover:border-accent/50 transition-colors"
        >
          <span className="h-11 w-11 rounded-xl bg-mint-soft text-mint flex items-center justify-center shrink-0">
            <UserRound size={19} />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-semibold">I'm joining a gym</span>
            <span className="block text-xs text-text-muted mt-0.5">Use the join code your gym gave you</span>
          </span>
          <ChevronRight size={16} className="text-text-muted group-hover:text-accent transition-colors" />
        </Link>
      </div>

      <p className="text-sm text-text-secondary text-center mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-accent font-medium hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
