"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Home, Dumbbell, CalendarDays, User, QrCode } from "lucide-react";

const tabs = [
  { label: "Home", href: "/member/dashboard", icon: Home },
  { label: "Workouts", href: "/member/workouts", icon: Dumbbell },
  { label: "Check in", href: "/member/checkin", icon: QrCode, center: true },
  { label: "Classes", href: "/member/classes", icon: CalendarDays },
  { label: "Profile", href: "/member/profile", icon: User },
];

export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 left-0 right-0 bg-bg-elevated/95 backdrop-blur border-t border-border-soft px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)]">
      <div className="flex items-center justify-between">
        {tabs.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
          const Icon = tab.icon;
          if (tab.center) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative h-[52px] w-[52px] -mt-6 rounded-full bg-gradient-to-br from-accent to-accent-strong flex items-center justify-center shadow-lg shadow-accent/30 active:scale-90 transition-transform"
              >
                <span className="absolute inset-0 rounded-full bg-accent/60 blur-lg glow-pulse -z-10" />
                <Icon size={22} className="text-white" />
              </Link>
            );
          }
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center gap-1 px-3 py-1.5 text-[11px] font-medium transition-colors",
                active ? "text-accent" : "text-text-muted"
              )}
            >
              <motion.span whileTap={{ scale: 0.85 }} className="relative">
                <Icon size={20} />
                {active && (
                  <motion.span
                    layoutId="mobile-tab-dot"
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  // Wraps the member experience so it reads clearly as a mobile-app surface
  // even when viewed on a wide desktop screen. On an actual phone (installed
  // as a PWA) the outer chrome collapses away and this IS the app.
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg-elevated py-6 md:py-10">
      <div className="w-full max-w-[430px] min-h-[812px] md:min-h-[860px] bg-bg md:rounded-[36px] md:border-[8px] md:border-[#0a0910] flex flex-col overflow-hidden shadow-2xl">
        {children}
      </div>
    </div>
  );
}
