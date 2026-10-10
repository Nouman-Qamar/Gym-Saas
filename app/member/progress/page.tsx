import Link from "next/link";
import { ChevronLeft, Flame, Share2 } from "lucide-react";
import { requireUser } from "@/lib/auth/current-user";
import { getMemberProgress, getMemberProfile } from "@/lib/queries/member";
import { WeightChart } from "@/components/ui/weight-chart";
import { LogWeightForm } from "./log-weight-form";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

export default async function MemberProgressPage() {
  const user = await requireUser("MEMBER");
  const [{ metrics, badges, streak }, profile] = await Promise.all([getMemberProgress(user.id), getMemberProfile(user.id)]);

  return (
    <div className="px-5 pt-6 pb-8">
      <Link href="/member/dashboard" className="text-sm text-text-muted flex items-center gap-1 mb-4">
        <ChevronLeft size={15} /> Home
      </Link>
      <Reveal>
        <h1 className="font-display text-2xl font-semibold mb-1">Progress</h1>
        <p className="text-text-secondary text-sm mb-6">Your body, streak, and badges over time.</p>
      </Reveal>

      {!!streak?.currentStreak && (
        <Reveal delay={0.05} className="rounded-[var(--radius-md)] bg-mint-soft border border-mint/20 p-4 flex items-center gap-3 mb-5">
          <span className="h-10 w-10 rounded-full bg-bg flex items-center justify-center text-lg">🔥</span>
          <div>
            <p className="text-sm font-semibold text-mint">{streak.currentStreak}-day streak</p>
            <p className="text-xs text-text-secondary">Best: {streak.bestStreak} days</p>
          </div>
        </Reveal>
      )}

      <Reveal delay={0.1} className="rounded-[var(--radius-lg)] bg-surface border border-border-soft p-4 mb-3">
        <h3 className="font-display font-semibold text-sm mb-3">Weight trend</h3>
        <WeightChart
          data={metrics
            .filter((m) => m.weightKg != null)
            .map((m) => ({ date: m.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }), weightKg: m.weightKg! }))}
        />
      </Reveal>
      <div className="mb-6">
        <LogWeightForm />
      </div>

      <p className="text-sm font-medium text-text-secondary mb-3">Badges</p>
      <Stagger className="grid grid-cols-3 gap-3 mb-6">
        {badges.map((b) => (
          <StaggerItem key={b.badgeId} className="rounded-[var(--radius-md)] bg-surface border border-border-soft p-3 flex flex-col items-center gap-1.5 text-center">
            <span className="text-2xl">{b.badge.icon}</span>
            <span className="text-[11px] font-medium">{b.badge.name}</span>
          </StaggerItem>
        ))}
        {badges.length === 0 && <p className="col-span-3 text-sm text-text-muted">No badges yet — log a workout to earn your first.</p>}
      </Stagger>

      {profile?.referralCode && (
        <Reveal delay={0.15} className="rounded-[var(--radius-lg)] bg-gradient-to-br from-accent to-accent-strong text-white p-5">
          <div className="flex items-center gap-2 mb-1">
            <Share2 size={15} />
            <p className="font-display font-semibold text-sm">Refer a friend</p>
          </div>
          <p className="text-white/80 text-xs mb-3">Share your code — you both get rewarded when they join.</p>
          <div className="bg-white/15 rounded-[var(--radius-sm)] px-3 py-2 font-mono text-sm tracking-wide">{profile.referralCode}</div>
        </Reveal>
      )}
    </div>
  );
}
