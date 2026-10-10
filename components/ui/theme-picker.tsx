"use client";

import { useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { THEME_META, themeAttr, type ThemeVibe } from "@/lib/theme";
import { updateVibe } from "@/lib/actions/profile";

export function ThemePicker({ current }: { current: ThemeVibe }) {
  const [pending, start] = useTransition();

  function choose(vibe: ThemeVibe) {
    document.documentElement.setAttribute("data-theme", themeAttr(vibe));
    const fd = new FormData();
    fd.set("vibe", vibe);
    start(async () => {
      await updateVibe(undefined, fd);
    });
  }

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {(Object.keys(THEME_META) as ThemeVibe[]).map((key) => {
        const meta = THEME_META[key];
        const selected = current === key;
        return (
          <button
            key={key}
            type="button"
            disabled={pending}
            onClick={() => choose(key)}
            className={`rounded-[var(--radius-md)] border p-3 flex flex-col items-center gap-2 transition-all disabled:opacity-60 ${
              selected ? "border-accent bg-accent-soft" : "border-border-soft bg-bg-elevated hover:border-border"
            }`}
          >
            <span className="text-lg">{meta.emoji}</span>
            <span className="flex gap-1">
              {meta.swatch.map((c) => (
                <span key={c} className="h-3 w-3 rounded-full" style={{ background: c }} />
              ))}
            </span>
            <span className="text-[11px] font-medium flex items-center gap-1">
              {meta.label}
              {selected && (pending ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} className="text-accent" />)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
