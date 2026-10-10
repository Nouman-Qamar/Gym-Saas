"use client";

import { useActionState, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { completeOnboarding } from "@/lib/actions/profile";
import { SubmitButton } from "@/components/ui/submit-button";
import { THEME_META, resolveVibe, themeAttr, type Gender, type ThemeVibe } from "@/lib/theme";
import { Check } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

const GENDER_OPTIONS: { value: Gender; label: string; blurb: string }[] = [
  { value: "MALE", label: "Male", blurb: "Ember vibe by default" },
  { value: "FEMALE", label: "Female", blurb: "Baddie vibe by default" },
  { value: "OTHER", label: "Other", blurb: "Electric vibe by default" },
  { value: "UNSPECIFIED", label: "Prefer not to say", blurb: "Electric vibe by default" },
];

export default function OnboardingPage() {
  const [state, formAction] = useActionState(completeOnboarding, undefined);
  const [gender, setGender] = useState<Gender>("UNSPECIFIED");
  const [vibeOverride, setVibeOverride] = useState<ThemeVibe | null>(null);

  const activeVibe = resolveVibe(gender, vibeOverride);

  // Live-preview the whole screen in the vibe that would actually be applied —
  // this is the moment we want to sell "entirely different experience."
  useEffect(() => {
    const html = document.documentElement;
    const previous = html.getAttribute("data-theme");
    html.setAttribute("data-theme", themeAttr(activeVibe));
    return () => {
      if (previous) html.setAttribute("data-theme", previous);
    };
  }, [activeVibe]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
      <h1 className="font-display text-2xl font-semibold mb-1">Make it yours</h1>
      <p className="text-text-secondary text-sm mb-6">
        Ironline looks different for everyone. Pick what fits — you can change it anytime from Settings.
      </p>

      <form action={formAction} className="flex flex-col gap-6">
        <div>
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2.5">I identify as</p>
          <div className="grid grid-cols-2 gap-2">
            {GENDER_OPTIONS.map((opt, i) => (
              <motion.button
                type="button"
                key={opt.value}
                onClick={() => setGender(opt.value)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: EASE }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={`relative text-left rounded-[var(--radius-md)] border p-3 overflow-hidden transition-colors ${
                  gender === opt.value
                    ? "border-accent bg-accent-soft"
                    : "border-border-soft bg-bg-elevated hover:border-border"
                }`}
              >
                {gender === opt.value && (
                  <motion.span
                    layoutId="gender-select-glow"
                    className="absolute inset-0 bg-accent/10"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative flex items-center justify-between">
                  <span className="text-sm font-medium">{opt.label}</span>
                  {gender === opt.value && <Check size={14} className="text-accent" />}
                </span>
                <span className="relative block text-[11px] text-text-muted mt-0.5">{opt.blurb}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2.5">
            Or pick your vibe directly
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(THEME_META) as ThemeVibe[]).map((key, i) => {
              const meta = THEME_META[key];
              const selected = activeVibe === key;
              return (
                <motion.button
                  type="button"
                  key={key}
                  onClick={() => setVibeOverride(key)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.05, ease: EASE }}
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  className={`relative rounded-[var(--radius-md)] border p-3 flex flex-col items-center gap-2 overflow-hidden transition-colors ${
                    selected ? "border-accent bg-accent-soft" : "border-border-soft bg-bg-elevated hover:border-border"
                  }`}
                >
                  {selected && (
                    <motion.span
                      layoutId="vibe-select-glow"
                      className="absolute inset-0 bg-accent/10"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <motion.span
                    className="relative text-lg"
                    animate={selected ? { scale: [1, 1.2, 1] } : undefined}
                    transition={{ duration: 0.4 }}
                  >
                    {meta.emoji}
                  </motion.span>
                  <span className="relative flex gap-1">
                    {meta.swatch.map((c) => (
                      <span key={c} className="h-3 w-3 rounded-full" style={{ background: c }} />
                    ))}
                  </span>
                  <span className="relative text-[11px] font-medium">{meta.label}</span>
                </motion.button>
              );
            })}
          </div>
          {vibeOverride && (
            <button
              type="button"
              onClick={() => setVibeOverride(null)}
              className="text-[11px] text-text-muted hover:text-text-secondary mt-2 underline"
            >
              Reset to default for my selection
            </button>
          )}
        </div>

        <div className="relative rounded-[var(--radius-md)] bg-gradient-to-br from-accent to-accent-strong p-4 text-white overflow-hidden grain">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeVibe}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <p className="text-xs text-white/75 uppercase tracking-wide font-medium mb-1">Preview</p>
              <p className="font-display text-lg font-semibold">{THEME_META[activeVibe].label} mode</p>
              <p className="text-sm text-white/80">{THEME_META[activeVibe].tagline}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <input type="hidden" name="gender" value={gender} />
        <input type="hidden" name="vibe" value={vibeOverride ?? ""} />

        {state?.error && (
          <p className="text-sm text-danger bg-danger-soft border border-danger/20 rounded-[var(--radius-sm)] px-3 py-2">
            {state.error}
          </p>
        )}

        <SubmitButton pendingText="Setting things up…">Continue</SubmitButton>
      </form>
    </motion.div>
  );
}
