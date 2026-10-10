"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Building2, LayoutGrid, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { platformLogout } from "@/lib/actions/platform";

export function PlatformNav({ ownerName }: { ownerName: string }) {
  const pathname = usePathname();
  const onDashboard = pathname === "/platform/dashboard";

  return (
    <header className="sticky top-0 z-30 bg-bg-elevated/90 backdrop-blur border-b border-border-soft">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <Link href="/platform/dashboard" className="flex items-center gap-2.5">
          <span className="relative h-8 w-8 rounded-[var(--radius-sm)] bg-gradient-to-br from-violet to-accent-strong flex items-center justify-center shrink-0">
            <Building2 size={16} className="text-white" />
          </span>
          <span className="font-display font-semibold">Ironline Platform</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/platform/dashboard"
            className={cn(
              "relative flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-[var(--radius-sm)] transition-colors",
              onDashboard ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
            )}
          >
            {onDashboard && (
              <motion.span
                layoutId="platform-nav-active"
                className="absolute inset-0 rounded-[var(--radius-sm)] bg-surface"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <LayoutGrid size={15} className="relative" />
            <span className="relative">All gyms</span>
          </Link>

          <div className="h-6 w-px bg-border-soft" />

          <span className="text-sm text-text-secondary hidden sm:inline">{ownerName}</span>
          <form action={platformLogout}>
            <button
              type="submit"
              className="text-text-muted hover:text-danger hover:scale-110 transition-all"
              title="Log out"
            >
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
