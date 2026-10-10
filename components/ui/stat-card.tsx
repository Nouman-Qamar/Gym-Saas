import { cn } from "@/lib/utils";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { StatCardShell, AnimatedValue } from "./stat-card-shell";

// StatCard itself stays a plain (non-"use client") function: pages pass it a
// `LucideIcon` component reference as the `icon` prop, and a Server
// Component can only hand a Client Component serializable props/children —
// not a bare function reference (see the sidebar RSC-boundary note). So the
// icon is resolved to JSX right here, server-side, and only the *rendered*
// markup is handed to the client shell for animation.
export function StatCard({
  label,
  value,
  delta,
  deltaDirection = "up",
  icon: Icon,
  size = "md",
  className,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaDirection?: "up" | "down";
  icon?: LucideIcon;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const isLg = size === "lg";
  return (
    <StatCardShell className={cn(isLg ? "p-6 min-h-[152px]" : "p-5 min-h-[112px]", className)}>
      <div className="flex items-start justify-between">
        <span className="text-sm text-text-secondary">{label}</span>
        {Icon && (
          <span className="h-8 w-8 rounded-full bg-surface-2 flex items-center justify-center text-text-secondary shrink-0">
            <Icon size={16} />
          </span>
        )}
      </div>
      <div className="flex items-end justify-between mt-4">
        <AnimatedValue value={value} className={cn("font-display font-semibold tracking-tight", isLg ? "text-4xl" : "text-2xl")} />
        {delta && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium mb-1",
              deltaDirection === "up" ? "text-mint" : "text-danger"
            )}
          >
            {deltaDirection === "up" ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {delta}
          </span>
        )}
      </div>
    </StatCardShell>
  );
}
