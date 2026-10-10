"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { CountUp } from "./motion";

const EASE = [0.16, 1, 0.3, 1] as const;

export function StatCardShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={cn(
        "bg-surface border border-border-soft rounded-[var(--radius-md)] flex flex-col justify-between transition-shadow hover:shadow-[0_12px_28px_-14px_rgba(0,0,0,0.55)] hover:border-[color:var(--border)]",
        className
      )}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

// Numeric-looking values ("6", "1,204") get a count-up animation; anything
// else (formatted currency strings with symbols, mixed text) just fades in —
// safer than trying to parse every possible prefix/suffix combination.
export function AnimatedValue({ value, className }: { value: string; className?: string }) {
  const cleaned = value.replace(/,/g, "");
  const isPlainInt = /^-?\d+$/.test(cleaned);

  if (isPlainInt) {
    return <CountUp value={parseInt(cleaned, 10)} className={className} />;
  }

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
    >
      {value}
    </motion.span>
  );
}
