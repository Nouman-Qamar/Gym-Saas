"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Dumbbell,
  LogOut,
  LayoutGrid,
  Users,
  CreditCard,
  CalendarCheck,
  UserCog,
  Megaphone,
  BarChart3,
  Settings,
  CalendarDays,
  TrendingUp,
  MessageCircle,
  User,
} from "lucide-react";
import { logout } from "@/lib/actions/auth";

// Nav items are fixed per role and defined HERE (client-side) rather than
// passed down as props from the server layouts — a server component can't
// hand a React icon component to a client component across the RSC
// boundary, so this keeps the boundary crossing to plain serializable data.
const ADMIN_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutGrid },
  { label: "Members", href: "/admin/members", icon: Users },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Attendance", href: "/admin/attendance", icon: CalendarCheck },
  { label: "Trainers", href: "/admin/trainers", icon: UserCog },
  { label: "Workouts", href: "/admin/workouts", icon: Dumbbell },
  { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const TRAINER_ITEMS = [
  { label: "Dashboard", href: "/trainer/dashboard", icon: LayoutGrid },
  { label: "My members", href: "/trainer/members", icon: Users },
  { label: "Workout plans", href: "/trainer/workouts", icon: Dumbbell },
  { label: "Schedule", href: "/trainer/schedule", icon: CalendarDays },
  { label: "Progress", href: "/trainer/progress", icon: TrendingUp },
  { label: "Messages", href: "/trainer/messages", icon: MessageCircle },
  { label: "Profile", href: "/trainer/profile", icon: User },
];

export function Sidebar({
  role,
  gymName,
  roleLabel,
  roleName,
  roleTag,
}: {
  role: "ADMIN" | "TRAINER";
  gymName: string;
  roleLabel: string;
  roleName: string;
  roleTag: string;
}) {
  const pathname = usePathname();
  const items = role === "ADMIN" ? ADMIN_ITEMS : TRAINER_ITEMS;

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-bg-elevated border-r border-border-soft">
      <div className="flex items-center gap-2.5 px-6 h-20">
        <div className="relative h-9 w-9 rounded-[var(--radius-sm)] bg-accent flex items-center justify-center shrink-0">
          <span className="absolute inset-0 rounded-[var(--radius-sm)] bg-accent blur-md opacity-50 glow-pulse" />
          <Dumbbell size={18} className="relative text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-display font-semibold leading-tight truncate">{gymName}</p>
          <p className="text-[11px] text-text-muted leading-tight">{roleLabel}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 px-3.5 h-11 rounded-[var(--radius-sm)] text-sm font-medium transition-colors",
                active
                  ? "text-text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface/60"
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active-bg"
                  className="absolute inset-0 rounded-[var(--radius-sm)] bg-surface"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              {active && (
                <motion.span
                  layoutId="sidebar-active-pill"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-accent"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon size={17} className="relative shrink-0 transition-transform duration-200 group-hover:scale-110" />
              <span className="relative flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border-soft">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-accent to-accent-strong flex items-center justify-center text-sm font-semibold shrink-0 text-white">
            {roleName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{roleName}</p>
            <p className="text-[11px] text-text-muted truncate">{roleTag}</p>
          </div>
          <form action={logout}>
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
    </aside>
  );
}
