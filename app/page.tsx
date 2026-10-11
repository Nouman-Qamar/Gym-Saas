"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  Dumbbell,
  Layers,
  Users2,
  LayoutDashboard,
  Smartphone,
  CreditCard,
  Bell,
  Building2,
  Sun,
  Moon,
  ArrowRight,
  Check,
  Star,
  PlayCircle,
  TrendingUp,
  Flame,
  Clock3,
  Zap,
} from "lucide-react";
import { THEME_META } from "@/lib/theme";
import { Reveal, Stagger, StaggerItem, CountUp } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Ironline";
const EASE = [0.16, 1, 0.3, 1] as const;

type LandingTheme = "light" | "dark";

const FEATURES = [
  {
    icon: Layers,
    title: "Multi-tenant core",
    body: "Every gym gets its own admin, trainers, members, and data — fully isolated, one codebase.",
  },
  {
    icon: Users2,
    title: "Role-based dashboards",
    body: "Admin, trainer, and member each open to a workspace built for exactly their job.",
  },
  {
    icon: LayoutDashboard,
    title: "Admin console",
    body: "Members, payments, attendance, trainers, workouts, announcements, and analytics in one place.",
  },
  {
    icon: Dumbbell,
    title: "Trainer workspace",
    body: "Build and assign workout plans, run the class schedule, track progress, message members.",
  },
  {
    icon: Smartphone,
    title: "Member app",
    body: "Workouts, class booking, QR check-in, streaks, badges, and referrals — an app members open.",
  },
  {
    icon: CreditCard,
    title: "Real payments",
    body: "Stripe and JazzCash checkout, or a manual mark-as-paid fallback when you need it.",
  },
  {
    icon: Bell,
    title: "Email, SMS & push",
    body: "Welcome messages, payment reminders, and booking confirmations, sent for real.",
  },
  {
    icon: Building2,
    title: "Platform-owner console",
    body: "See and bill every gym on Ironline from one SaaS-level dashboard.",
  },
] as const;

const ROLES = [
  {
    title: "Admin",
    bullets: ["Members, payments & attendance", "Workout library & announcements", "Revenue & attendance analytics"],
  },
  {
    title: "Trainer",
    bullets: ["Member roster & progress", "Workout plan builder", "Class schedule & messaging"],
  },
  {
    title: "Member",
    bullets: ["Workouts, QR check-in & booking", "Streaks, badges & referrals", "Direct messaging with trainers"],
  },
] as const;

const PRICING = [
  {
    tier: "Starter",
    price: "Rs. 3,500",
    blurb: "For a single gym just getting digital",
    bullets: ["Admin, trainer & member dashboards", "Up to 150 active members", "Manual payment tracking", "Email notifications"],
    cta: "Choose Starter",
    highlight: false,
  },
  {
    tier: "Growth",
    price: "Rs. 7,999",
    blurb: "For a gym ready to take real payments",
    bullets: [
      "Everything in Starter",
      "Unlimited members",
      "Stripe / JazzCash online payments",
      "SMS + push notifications",
      "Installable PWA for every member",
    ],
    cta: "Choose Growth",
    highlight: true,
  },
  {
    tier: "Scale",
    price: "Custom",
    blurb: "For a group running several locations",
    bullets: ["Everything in Growth", "Multiple gym locations", "Platform-owner console & billing", "Priority support"],
    cta: "Talk to us",
    highlight: false,
  },
] as const;

function HeroWord({
  children,
  delay,
  className,
}: {
  children: React.ReactNode;
  delay: number;
  className?: string;
}) {
  return (
    <motion.span
      className={cn("inline-block", className)}
      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.span>
  );
}

export default function Landing() {
  const [theme, setTheme] = useState<LandingTheme>("dark");
  const isLight = theme === "light";

  // Scroll-driven "power meter" — fills across the top of the page as you
  // scroll, like a workout-intensity gauge. Smoothed with a spring so it
  // feels charged rather than robotic.
  const { scrollYProgress } = useScroll();
  const powerBarScale = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 });

  return (
    <main
      data-landing-theme={theme}
      className="min-h-screen overflow-x-hidden transition-colors duration-300"
      style={{ background: "var(--landing-bg)", color: "var(--landing-text)", fontFamily: "var(--landing-font-body)" }}
    >
      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      {/* Scroll power meter — a thin glowing bar that charges up left-to-right
          as you scroll down the page, like a workout intensity gauge. */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] z-30 origin-left"
        style={{
          scaleX: powerBarScale,
          background: "linear-gradient(90deg, var(--landing-grad-from), var(--landing-accent), var(--landing-grad-to))",
          boxShadow: "0 0 10px var(--landing-accent), 0 0 2px var(--landing-accent)",
        }}
      />
      <header className="sticky top-0 z-20 border-b" style={{ borderColor: "var(--landing-card-border)", background: "var(--landing-bg)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="relative h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: "var(--landing-accent)" }}>
              <Dumbbell size={18} style={{ color: "var(--landing-on-accent)" }} />
              <motion.span
                className="absolute -top-1.5 -right-1.5 flex items-center justify-center h-4 w-4 rounded-full"
                style={{ background: "var(--landing-bg)" }}
                animate={{ opacity: [0.5, 1, 0.5], scale: [0.85, 1.1, 0.85] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <Zap size={10} style={{ color: "var(--landing-accent)" }} fill="currentColor" strokeWidth={0} />
              </motion.span>
            </span>
            <span className="text-lg font-semibold" style={{ fontFamily: "var(--landing-font-head)" }}>
              {APP_NAME}
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-7 text-sm font-medium">
            <a href="#features" className="hover:opacity-70 transition-opacity">
              Features
            </a>
            <a href="#roles" className="hover:opacity-70 transition-opacity">
              Roles
            </a>
            <a href="#pricing" className="hover:opacity-70 transition-opacity">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTheme(isLight ? "dark" : "light")}
              aria-label={`Switch to ${isLight ? "dark" : "light"} theme`}
              className="inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold"
              style={{ background: "var(--landing-card)", borderColor: "var(--landing-card-border)", color: "var(--landing-text)" }}
            >
              {isLight ? <Sun size={14} /> : <Moon size={14} />}
              {isLight ? "Light" : "Dark"}
            </button>
            <Link
              href="/signup/gym"
              className="rounded-[var(--landing-radius-btn)] px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ background: "var(--landing-accent)", color: "var(--landing-on-accent)" }}
            >
              Start free trial
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative px-6 pt-16 pb-20 max-w-6xl mx-auto">
        <div
          className="pointer-events-none absolute -top-10 right-0 h-40 w-40 rounded-full blur-3xl opacity-60"
          style={{ background: "linear-gradient(135deg, var(--landing-grad-from), var(--landing-grad-to))" }}
        />
        <div className="flex flex-wrap gap-14 items-center">
          <div className="flex-1 min-w-[320px] max-w-xl flex flex-col gap-5">
            <motion.span
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="inline-flex self-start items-center rounded-full border px-4 py-2 text-xs font-bold"
              style={{ background: "var(--landing-card)", borderColor: "var(--landing-card-border)", color: "var(--landing-accent)" }}
            >
              A GYM APP PEOPLE ACTUALLY OPEN
            </motion.span>
            <h1 className="text-4xl sm:text-5xl leading-[1.08] font-semibold" style={{ fontFamily: "var(--landing-font-head)" }}>
              <HeroWord delay={0.05}>Run your gym.</HeroWord> <HeroWord delay={0.18}>Keep the fun in it.</HeroWord>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
              className="text-base sm:text-lg max-w-md"
              style={{ color: "var(--landing-muted)" }}
            >
              Admin console, trainer workspace, and a member app with streaks, badges, and real payments — multi-tenant,
              installable, and ready on day one.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.42, ease: EASE }}
              className="flex flex-wrap gap-3 mt-2"
            >
              <Link
                href="/signup/gym"
                className="inline-flex items-center gap-2 rounded-[var(--landing-radius-btn)] px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
                style={{ background: "var(--landing-accent)", color: "var(--landing-on-accent)" }}
              >
                Start free trial <ArrowRight size={15} />
              </Link>
              <Link
                href="/signup/member"
                className="inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold hover:opacity-75 transition-opacity"
                style={{ color: "var(--landing-text)" }}
              >
                <PlayCircle size={18} style={{ color: "var(--landing-accent)" }} /> See it as a member
              </Link>
              <Link href="/login" className="inline-flex items-center px-4 py-3 text-sm font-semibold" style={{ color: "var(--landing-muted)" }}>
                Log in
              </Link>
            </motion.div>

            {/* Social-proof row — stacked avatars + rating, inspired by the
                Dribbble "Gym Website Concept" hero (layout only, no copied assets). */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.46, ease: EASE }}
              className="flex items-center gap-3"
            >
              <div className="flex -space-x-2.5">
                {["AK", "SM", "RJ", "TF"].map((initials) => (
                  <span
                    key={initials}
                    className="h-8 w-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
                    style={{
                      borderColor: "var(--landing-bg)",
                      background: "var(--landing-accent-soft)",
                      color: "var(--landing-accent)",
                    }}
                  >
                    {initials}
                  </span>
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-0.5" style={{ color: "var(--landing-accent)" }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <span className="text-[11px]" style={{ color: "var(--landing-muted)" }}>
                  Trusted by gym owners opening on Ironline
                </span>
              </div>
            </motion.div>

            {/* Trust + capability strip — pill tags, inspired by the
                Dribbble "Gym Website Concept" hero (layout only). */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.48, ease: EASE }}
              className="flex flex-wrap gap-2.5"
            >
              {[
                "Multi-tenant core",
                "Role dashboards",
                "Real payments",
                "Push & SMS",
                "Installable PWA",
                "Analytics",
              ].map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-[var(--landing-radius-btn)] border px-3.5 py-1.5 text-[11px] font-semibold"
                  style={{ borderColor: "var(--landing-card-border)", color: "var(--landing-muted)", background: "var(--landing-card)" }}
                >
                  {tag}
                </span>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="text-xs"
              style={{ color: "var(--landing-muted)" }}
            >
              Curious first? Log in with{" "}
              <span className="font-medium" style={{ color: "var(--landing-text)" }}>
                admin@demo.gym
              </span>
              ,{" "}
              <span className="font-medium" style={{ color: "var(--landing-text)" }}>
                trainer@demo.gym
              </span>
              , or{" "}
              <span className="font-medium" style={{ color: "var(--landing-text)" }}>
                member@demo.gym
              </span>{" "}
              — password{" "}
              <span className="font-medium" style={{ color: "var(--landing-text)" }}>
                demopass123
              </span>
            </motion.p>

            <Stagger className="grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-[var(--landing-card-border)]">
              {[
                { n: 3, suffix: "", label: "Roles, one app" },
                { n: 24, suffix: "+", label: "Screens built in" },
                { n: Object.keys(THEME_META).length, suffix: "", label: "Vibes to choose from" },
              ].map((s) => (
                <StaggerItem key={s.label} className="flex flex-col items-center">
                  <span className="text-2xl sm:text-3xl font-semibold" style={{ fontFamily: "var(--landing-font-head)" }}>
                    <CountUp value={s.n} suffix={s.suffix} />
                  </span>
                  <span className="text-[11px] mt-1 text-center" style={{ color: "var(--landing-muted)" }}>
                    {s.label}
                  </span>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          {/* Decorative stacked preview — illustrative, not real product data.
              A big low-opacity dumbbell mark fills the space behind the cards
              so this reads as "gym" at a glance, and each card now carries a
              role-relevant icon + content instead of plain placeholder bars. */}
          <div className="relative flex-1 min-w-[320px] h-[420px] hidden md:block">
            <Dumbbell
              className="absolute -top-6 right-0 pointer-events-none"
              size={320}
              strokeWidth={1}
              style={{ color: "var(--landing-accent)", opacity: 0.08, transform: "rotate(-18deg)" }}
            />
            <div
              className="absolute top-0 left-0 w-64 h-40 rounded-[var(--landing-radius-card)] border p-5 shadow-xl"
              style={{ background: "var(--landing-card)", borderColor: "var(--landing-card-border)" }}
            >
              <div className="flex items-center gap-1.5 mb-3">
                <TrendingUp size={12} style={{ color: "var(--landing-accent)" }} />
                <p className="text-[10px] font-bold" style={{ color: "var(--landing-muted)" }}>
                  ADMIN · Revenue
                </p>
              </div>
              <div className="flex items-end gap-2 h-11">
                {[40, 65, 50, 85, 70].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md"
                    style={{ height: `${h}%`, background: i === 3 ? "var(--landing-accent)" : "var(--landing-accent-soft)" }}
                  />
                ))}
              </div>
              <p className="mt-3 text-[11px] font-semibold" style={{ color: "var(--landing-accent)" }}>
                +18% this month
              </p>
            </div>
            <div
              className="absolute top-[100px] left-[150px] w-64 h-40 rounded-[var(--landing-radius-card)] border p-5 shadow-xl"
              style={{ background: "var(--landing-card)", borderColor: "var(--landing-card-border)" }}
            >
              <div className="flex items-center gap-1.5 mb-3">
                <Dumbbell size={12} style={{ color: "var(--landing-accent)" }} />
                <p className="text-[10px] font-bold" style={{ color: "var(--landing-muted)" }}>
                  TRAINER · Today
                </p>
              </div>
              <div className="flex flex-col gap-2.5">
                {["6:00 AM — Strength", "5:00 PM — HIIT circuit", "7:00 PM — Yoga flow"].map((cls) => (
                  <div key={cls} className="flex items-center gap-1.5">
                    <Clock3 size={10} style={{ color: "var(--landing-muted)" }} />
                    <span className="text-[10.5px]" style={{ color: "var(--landing-text)" }}>
                      {cls}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="absolute top-[210px] left-0 w-64 h-40 rounded-[var(--landing-radius-card)] border p-5 shadow-xl"
              style={{ background: "var(--landing-card)", borderColor: "var(--landing-card-border)" }}
            >
              <div className="flex items-center gap-1.5 mb-3">
                <Flame size={12} style={{ color: "var(--landing-accent)" }} />
                <p className="text-[10px] font-bold" style={{ color: "var(--landing-muted)" }}>
                  MEMBER · Streak
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="h-11 w-11 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, var(--landing-grad-from), var(--landing-grad-to))" }}
                >
                  <Flame size={18} style={{ color: "var(--landing-on-grad)" }} />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold" style={{ fontFamily: "var(--landing-font-head)" }}>
                    7-day streak
                  </p>
                  <p className="text-[10.5px]" style={{ color: "var(--landing-muted)" }}>
                    Checked in every day this week
                  </p>
                </div>
              </div>
            </div>
            <p className="absolute bottom-0 left-0 text-[10px]" style={{ color: "var(--landing-muted)" }}>
              Illustrative preview — not real product data
            </p>
          </div>
        </div>

        {/* Trust strip */}
        <div className="flex flex-wrap gap-3 mt-16">
          {["Multi-tenant from day one", "3 built-in roles", "Installable PWA", "Real online payments"].map((t) => (
            <span
              key={t}
              className="rounded-full border px-4 py-2 text-xs font-bold"
              style={{ background: "var(--landing-card)", borderColor: "var(--landing-card-border)" }}
            >
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="px-6 py-16 max-w-6xl mx-auto">
        <Reveal viewport className="max-w-xl mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-3" style={{ fontFamily: "var(--landing-font-head)" }}>
            Everything a gym actually runs on
          </h2>
          <p className="text-base" style={{ color: "var(--landing-muted)" }}>
            Not a prototype feature list — the admin, trainer, and member surfaces a real gym needs, minus the three-apps
            juggling act.
          </p>
        </Reveal>
        <Stagger viewport className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <StaggerItem key={f.title}>
              <div
                className="h-full rounded-[var(--landing-radius-card)] border p-6"
                style={{ background: "var(--landing-card)", borderColor: "var(--landing-card-border)" }}
              >
                <span
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl mb-4"
                  style={{ background: "var(--landing-accent-soft)", color: "var(--landing-accent)" }}
                >
                  <f.icon size={20} />
                </span>
                <p className="font-semibold text-[15px] mb-2">{f.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--landing-muted)" }}>
                  {f.body}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ── Roles ────────────────────────────────────────────────────────── */}
      <section id="roles" className="px-6 py-16 max-w-6xl mx-auto">
        <Reveal viewport className="max-w-xl mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-3" style={{ fontFamily: "var(--landing-font-head)" }}>
            Built around three roles, not one giant screen
          </h2>
          <p className="text-base" style={{ color: "var(--landing-muted)" }}>
            Permissions enforced at the routing layer and inside every action — not just hidden buttons.
          </p>
        </Reveal>
        <Stagger viewport className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {ROLES.map((r) => (
            <StaggerItem key={r.title}>
              <div
                className="h-full rounded-[var(--landing-radius-card)] border-t-[3px] border p-6"
                style={{ background: "var(--landing-card)", borderColor: "var(--landing-card-border)", borderTopColor: "var(--landing-accent)" }}
              >
                <p className="text-xs font-bold tracking-wide mb-4" style={{ color: "var(--landing-accent)" }}>
                  {r.title.toUpperCase()}
                </p>
                <ul className="flex flex-col gap-2.5">
                  {r.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm" style={{ color: "var(--landing-muted)" }}>
                      <Check size={15} className="shrink-0 mt-0.5" style={{ color: "var(--landing-accent)" }} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ── Theming banner ───────────────────────────────────────────────── */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <Reveal
          viewport
          className="rounded-[28px] p-10 sm:p-12 flex flex-wrap gap-8 items-center justify-between"
          style={{
            background: "linear-gradient(120deg, var(--landing-grad-from), var(--landing-grad-via), var(--landing-grad-to))",
            color: "var(--landing-on-grad)",
          }}
        >
          <div className="flex-1 min-w-[280px] max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-3" style={{ color: "var(--landing-on-grad)" }}>
              Theming that's actually personal
            </h2>
            <p className="text-sm sm:text-base opacity-90">
              Onboarding asks how you'd like the app to feel, and anyone can switch anytime from Settings — this landing
              page is just a first taste, toggled with the switch up top.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {(Object.keys(THEME_META) as (keyof typeof THEME_META)[]).map((key) => (
              <span key={key} className="rounded-full px-4 py-2 text-sm font-bold bg-white/20">
                {THEME_META[key].emoji} {THEME_META[key].label}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="px-6 py-16 max-w-6xl mx-auto">
        <Reveal viewport className="max-w-xl mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-3" style={{ fontFamily: "var(--landing-font-head)" }}>
            Simple, honest pricing
          </h2>
          <p className="text-base" style={{ color: "var(--landing-muted)" }}>
            Monthly plans, billed in PKR — no setup fee, cancel anytime.
          </p>
        </Reveal>
        <Stagger viewport className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {PRICING.map((p) => (
            <StaggerItem key={p.tier}>
              <div
                className="relative h-full rounded-[var(--landing-radius-card)] p-6 flex flex-col gap-5 border-2"
                style={{ background: "var(--landing-card)", borderColor: p.highlight ? "var(--landing-accent)" : "var(--landing-card-border)" }}
              >
                {p.highlight && (
                  <span
                    className="absolute -top-3.5 left-7 rounded-full px-3.5 py-1.5 text-[11px] font-bold"
                    style={{ background: "var(--landing-accent)", color: "var(--landing-on-accent)" }}
                  >
                    MOST GYMS START HERE
                  </span>
                )}
                <div className={p.highlight ? "mt-2" : ""}>
                  <p className="text-sm font-bold mb-1.5">{p.tier}</p>
                  <p className="text-3xl font-semibold" style={{ fontFamily: "var(--landing-font-head)" }}>
                    {p.price}
                    {p.price !== "Custom" && (
                      <span className="text-sm font-normal" style={{ color: "var(--landing-muted)", fontFamily: "var(--landing-font-body)" }}>
                        {" "}
                        /mo
                      </span>
                    )}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--landing-muted)" }}>
                    {p.blurb}
                  </p>
                </div>
                <ul className="flex flex-col gap-2 flex-1">
                  {p.bullets.map((b) => (
                    <li key={b} className="text-[13px]" style={{ color: "var(--landing-muted)" }}>
                      {b}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup/gym"
                  className={cn(
                    "inline-flex items-center justify-center rounded-[var(--landing-radius-btn)] px-5 py-3 text-sm font-semibold",
                    !p.highlight && "border-2"
                  )}
                  style={
                    p.highlight
                      ? { background: "var(--landing-accent)", color: "var(--landing-on-accent)" }
                      : { borderColor: "var(--landing-text)", color: "var(--landing-text)" }
                  }
                >
                  {p.cta}
                </Link>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <Reveal
          viewport
          className="rounded-[28px] p-10 sm:p-14 flex flex-wrap gap-6 items-center justify-between"
          style={{ background: "linear-gradient(120deg, var(--landing-grad-from), var(--landing-grad-via))" }}
        >
          <h2 className="text-2xl sm:text-3xl font-semibold max-w-lg" style={{ color: "var(--landing-on-grad)" }}>
            Stop running your gym out of three different apps.
          </h2>
          <Link
            href="/signup/gym"
            className="inline-flex items-center gap-2 rounded-[var(--landing-radius-btn)] px-7 py-3.5 text-sm font-semibold"
            style={{ background: "var(--landing-on-grad)", color: "var(--landing-grad-from)" }}
          >
            Start free trial <ArrowRight size={15} />
          </Link>
        </Reveal>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="px-6 py-10 max-w-6xl mx-auto border-t" style={{ borderColor: "var(--landing-card-border)" }}>
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-base font-semibold" style={{ fontFamily: "var(--landing-font-head)" }}>
              {APP_NAME}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--landing-muted)" }}>
              Built for gyms that are done juggling spreadsheets.
            </p>
          </div>
          <nav className="flex gap-6 text-sm font-medium">
            <a href="#features" style={{ color: "var(--landing-muted)" }}>
              Features
            </a>
            <a href="#roles" style={{ color: "var(--landing-muted)" }}>
              Roles
            </a>
            <a href="#pricing" style={{ color: "var(--landing-muted)" }}>
              Pricing
            </a>
            <Link href="/login" style={{ color: "var(--landing-muted)" }}>
              Log in
            </Link>
          </nav>
        </div>
        <p className="text-xs mt-8" style={{ color: "var(--landing-muted)" }}>
          © 2026 {APP_NAME}. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
