// Ironline's gendered/vibe theming system.
//
// Every account picks a gender during onboarding (or skips it), which maps to
// a default visual "vibe". People can always override the vibe from Settings
// regardless of what gender they set — the mapping is a starting point, not a
// requirement. All three vibes share the same premium dark-mode structure
// (surfaces, spacing, motion) so nothing ever looks like a re-skinned toy —
// only the signature accent hue and a couple of soft tints change.

export type Role = "ADMIN" | "TRAINER" | "MEMBER";
export type Gender = "MALE" | "FEMALE" | "OTHER" | "UNSPECIFIED";
export type ThemeVibe = "EMBER" | "BADDIE" | "ELECTRIC";

export const THEME_META: Record<
  ThemeVibe,
  { label: string; tagline: string; swatch: [string, string, string]; emoji: string }
> = {
  EMBER: {
    label: "Ember",
    tagline: "Bold coral-red on near-black. Kinetic and sharp.",
    swatch: ["#FF3E63", "#FF1F4C", "#121016"],
    emoji: "🔥",
  },
  BADDIE: {
    label: "Baddie",
    tagline: "Hot pink and rose gold. Glam, playful, still premium.",
    swatch: ["#FF3EA6", "#E0116D", "#17121B"],
    emoji: "💅",
  },
  ELECTRIC: {
    label: "Electric",
    tagline: "Cyan-indigo on cool black. Calm, fast, neutral.",
    swatch: ["#3E8CFF", "#7C5CFF", "#0F1320"],
    emoji: "⚡",
  },
};

const GENDER_DEFAULT_VIBE: Record<Gender, ThemeVibe> = {
  MALE: "EMBER",
  FEMALE: "BADDIE",
  OTHER: "ELECTRIC",
  // Pre-signup / no-account-yet pages (signup, login) fall back to
  // UNSPECIFIED, which used to resolve to ELECTRIC (blue) — a jarring
  // mismatch right after the bold red/orange landing page. EMBER keeps the
  // same accent energy flowing from the landing page into auth.
  UNSPECIFIED: "EMBER",
};

export function resolveVibe(gender: Gender | null | undefined, override: ThemeVibe | null | undefined): ThemeVibe {
  if (override) return override;
  return GENDER_DEFAULT_VIBE[gender ?? "UNSPECIFIED"];
}

/** CSS `data-theme` value used on <html>. */
export function themeAttr(vibe: ThemeVibe): string {
  return vibe.toLowerCase();
}
