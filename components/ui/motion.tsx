"use client";

/**
 * Shared animation primitives. Every one of these is a thin, generic
 * wrapper around framer-motion — they take only `children` and plain
 * serializable props, so they're safe to use as the client boundary
 * underneath a Server Component (children are pre-rendered elements, not
 * function references, so passing them across the RSC boundary is fine —
 * see components/ui/sidebar.tsx for the pattern this project follows).
 */

import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const; // premium "ease-out-expo"-ish curve

/** Fade + rise entrance. Fires once, on mount or first scroll-into-view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 16,
  once = true,
  viewport = false,
  as: Component = motion.div,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
  viewport?: boolean;
  as?: typeof motion.div;
} & HTMLMotionProps<"div">) {
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={viewport ? { opacity: 1, y: 0 } : undefined}
      animate={viewport ? undefined : { opacity: 1, y: 0 }}
      viewport={viewport ? { once, margin: "-60px" } : undefined}
      transition={{ duration: 0.6, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </Component>
  );
}

/** Stagger container — pair with <StaggerItem> children. */
const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};
const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

export function Stagger({
  children,
  className,
  viewport = false,
  once = true,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  viewport?: boolean;
  once?: boolean;
  as?: "div" | "tbody";
}) {
  const Component = as === "tbody" ? motion.tbody : motion.div;
  return (
    <Component
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView={viewport ? "show" : undefined}
      animate={viewport ? undefined : "show"}
      viewport={viewport ? { once, margin: "-60px" } : undefined}
    >
      {children}
    </Component>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  );
}

/** Same entrance as StaggerItem, but for a <tr> inside a <Stagger><table>…
 * — table rows need a real motion.tr, not a motion.div, to stay valid HTML. */
export function StaggerRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.tr className={className} variants={staggerItem}>
      {children}
    </motion.tr>
  );
}

/** Hover-lift shell: subtle rise + shadow + accent-tinted glow border on
 * hover. This is the workhorse used by Card, StatCard, and feature tiles. */
export function HoverLift({
  children,
  className,
  glow = false,
  lift = 4,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  lift?: number;
} & HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={cn(glow && "hover:shadow-[0_0_0_1px_var(--accent),0_12px_32px_-8px_var(--accent)]", className)}
      whileHover={{ y: -lift, transition: { duration: 0.25, ease: EASE } }}
      whileTap={{ scale: 0.99 }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Animate an integer count from 0 → value on mount / scroll-into-view. */
export function CountUp({
  value,
  duration = 1.1,
  className,
  prefix = "",
  suffix = "",
}: {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: duration * 1000, bounce: 0 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) motionVal.set(value);
  }, [inView, value, motionVal]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplay(Math.round(v)));
    return unsub;
  }, [spring]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

/** Decorative floating gradient orb for hero/marketing surfaces. Purely
 * visual — no interactive semantics, safe as a background layer. */
export function FloatingOrb({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("pointer-events-none absolute rounded-full blur-[100px]", className)}
      animate={{
        x: [0, 18, -14, 0],
        y: [0, -14, 10, 0],
        scale: [1, 1.08, 0.95, 1],
      }}
      transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
