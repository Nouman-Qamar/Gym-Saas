"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Card({
  className,
  noHover,
  ...props
}: HTMLAttributes<HTMLDivElement> & { noHover?: boolean }) {
  return (
    <motion.div
      className={cn(
        "bg-surface border border-border-soft rounded-[var(--radius-md)] p-5 transition-shadow",
        !noHover && "hover:border-[color:var(--border)] hover:shadow-[0_12px_28px_-14px_rgba(0,0,0,0.55)]",
        className
      )}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: EASE }}
      whileHover={noHover ? undefined : { y: -3 }}
      {...(props as HTMLMotionProps<"div">)}
    />
  );
}

export function CardHero({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  // The one "loud" surface treatment — reserved for a single hero moment per screen.
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-accent to-accent-strong text-white rounded-[var(--radius-lg)] p-6",
        className
      )}
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: EASE }}
      {...(props as HTMLMotionProps<"div">)}
    />
  );
}

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "mint" | "amber" | "violet" | "danger" | "accent";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-surface-2 text-text-secondary",
    mint: "bg-mint-soft text-mint",
    amber: "bg-amber-soft text-amber",
    violet: "bg-violet-soft text-violet",
    danger: "bg-danger-soft text-danger",
    accent: "bg-accent-soft text-accent",
  };
  return (
    <motion.span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3 py-1 text-xs font-medium",
        tones[tone],
        className
      )}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: EASE }}
      {...(props as HTMLMotionProps<"span">)}
    />
  );
}
