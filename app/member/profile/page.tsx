import Link from "next/link";
import { TrendingUp, Trophy, MessageCircle, Settings, ChevronRight, LogOut } from "lucide-react";
import { requireUser } from "@/lib/auth/current-user";
import { getMemberProfile } from "@/lib/queries/member";
import { resolveVibe } from "@/lib/theme";
import { logout } from "@/lib/actions/auth";
import { ThemePicker } from "@/components/ui/theme-picker";
import { PushOptIn } from "@/components/ui/push-optin";
import { initials } from "@/lib/queries/shared";
import { MemberProfileForm, GenderForm } from "./forms";

const LINKS = [
  { href: "/member/progress", label: "Progress & badges", icon: TrendingUp },
  { href: "/member/community", label: "Community & challenges", icon: Trophy },
  { href: "/member/messages", label: "Messages", icon: MessageCircle },
];

export default async function MemberProfilePage() {
  const user = await requireUser("MEMBER");
  const profile = await getMemberProfile(user.id);
  const vibe = resolveVibe(user.gender, user.themeOverride);

  return (
    <div className="px-5 pt-6 pb-8">
      <div className="flex items-center gap-3 mb-7">
        <span className="h-14 w-14 rounded-full bg-accent-soft text-accent flex items-center justify-center font-display text-lg font-semibold">
          {initials(user.name)}
        </span>
        <div>
          <h1 className="font-display text-xl font-semibold">{user.name}</h1>
          <p className="text-text-muted text-xs">{user.email}</p>
        </div>
      </div>

      <div className="space-y-1.5 mb-6">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex items-center gap-3 rounded-[var(--radius-md)] bg-surface border border-border-soft px-4 py-3.5 hover:border-accent/40 transition-colors"
          >
            <l.icon size={17} className="text-text-secondary" />
            <span className="flex-1 text-sm font-medium">{l.label}</span>
            <ChevronRight size={15} className="text-text-muted" />
          </Link>
        ))}
      </div>

      <div className="rounded-[var(--radius-lg)] bg-surface border border-border-soft p-4 mb-4">
        <h3 className="font-display font-semibold text-sm mb-3">Your details</h3>
        <MemberProfileForm name={user.name} phone={user.phone} />
      </div>

      <div className="rounded-[var(--radius-lg)] bg-surface border border-border-soft p-4 mb-4">
        <h3 className="font-display font-semibold text-sm mb-1">I identify as</h3>
        <p className="text-text-muted text-xs mb-3">This sets your default vibe below.</p>
        <GenderForm current={user.gender} />
      </div>

      <div className="rounded-[var(--radius-lg)] bg-surface border border-border-soft p-4 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Settings size={14} className="text-text-secondary" />
          <h3 className="font-display font-semibold text-sm">App vibe</h3>
        </div>
        <p className="text-text-muted text-xs mb-3">Override your default anytime.</p>
        <ThemePicker current={vibe} />
      </div>

      <div className="mb-6">
        <PushOptIn />
      </div>

      {profile?.trainer && (
        <p className="text-xs text-text-muted text-center mb-6">
          Coached by <span className="text-text-secondary font-medium">{profile.trainer.name}</span>
        </p>
      )}

      <form action={logout}>
        <button
          type="submit"
          className="w-full h-11 rounded-[var(--radius-md)] bg-danger-soft text-danger font-medium text-sm flex items-center justify-center gap-2"
        >
          <LogOut size={15} /> Log out
        </button>
      </form>
    </div>
  );
}
