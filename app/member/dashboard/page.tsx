import Link from "next/link";
import { Bell, Flame, Dumbbell, Clock3, ChevronRight, Megaphone, Wallet } from "lucide-react";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Badge } from "@/components/ui/card";
import { Reveal, CountUp } from "@/components/ui/motion";
import { CompleteWorkoutButton } from "@/components/ui/complete-workout-button";
import { PayOnlineButton } from "@/components/ui/pay-online-button";
import { requireUser } from "@/lib/auth/current-user";
import { getMemberDashboard } from "@/lib/queries/member";
import { formatMoney } from "@/lib/queries/shared";
import { activeGateway } from "@/lib/payments/gateway";

export default async function MemberDashboard() {
  const user = await requireUser("MEMBER");
  const { profile, plan, todaysDay, alreadyDoneToday, todayStats, latestAnnouncement, duePayment } = await getMemberDashboard(user.id, user.gymId);
  const gatewayOn = activeGateway() !== "off";

  const membership = profile?.memberships[0];
  const daysLeft = membership ? Math.max(0, Math.ceil((membership.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;
  const totalDays = membership ? Math.ceil((membership.endDate.getTime() - membership.startDate.getTime()) / (1000 * 60 * 60 * 24)) : 1;
  const progressPct = membership ? Math.round(((totalDays - daysLeft) / totalDays) * 100) : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="px-5 pt-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <p className="text-text-secondary text-sm">{greeting}</p>
          <h1 className="font-display text-2xl font-semibold">{user.name.split(" ")[0]} 👋</h1>
        </div>
        <Link href="/member/profile" className="relative h-11 w-11 rounded-full bg-surface flex items-center justify-center">
          <Bell size={18} />
          {latestAnnouncement && <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-accent" />}
        </Link>
      </div>

      {/* Membership hero */}
      {membership && (
        <Reveal delay={0.05} className="rounded-[var(--radius-lg)] bg-surface border border-border-soft p-5 flex items-center gap-4 mb-5 transition-shadow hover:shadow-[0_12px_28px_-14px_rgba(0,0,0,0.55)]">
          <ProgressRing progress={100 - progressPct} size={64} stroke={6}>
            <span className="font-display text-sm font-semibold">{daysLeft}</span>
          </ProgressRing>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-display font-semibold">{membership.plan.name}</span>
              <Badge tone={membership.status === "ACTIVE" ? "mint" : membership.status === "EXPIRING" ? "amber" : "danger"}>
                {membership.status}
              </Badge>
            </div>
            <p className="text-text-muted text-xs">
              {daysLeft} days left · renews {membership.endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </div>
          <ChevronRight size={18} className="text-text-muted" />
        </Reveal>
      )}

      {/* Outstanding payment — only shown when there's something to pay and online payments are on */}
      {duePayment && gatewayOn && (
        <Reveal delay={0.08} className="rounded-[var(--radius-lg)] bg-amber-soft border border-amber/20 p-4 flex items-center gap-3 mb-5">
          <span className="h-10 w-10 rounded-full bg-bg flex items-center justify-center text-amber shrink-0">
            <Wallet size={17} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{formatMoney(duePayment.amountCents)} {duePayment.status === "OVERDUE" ? "overdue" : "due"}</p>
            <p className="text-xs text-text-secondary">Pay online — no front-desk trip needed.</p>
          </div>
          <PayOnlineButton
            paymentId={duePayment.id}
            className="h-10 px-4 rounded-[var(--radius-sm)] bg-amber text-bg font-semibold text-xs flex items-center justify-center gap-1.5 shrink-0 hover:opacity-90 transition-opacity"
          />
        </Reveal>
      )}

      {/* Today's workout — the signature moment */}
      {todaysDay ? (
        <Reveal delay={0.12} className="relative overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-br from-accent to-accent-strong text-white p-6 mb-5 heat-glow grain">
          <p className="text-white/75 text-xs font-medium uppercase tracking-wide mb-2">Today's workout</p>
          <h2 className="font-display text-3xl font-semibold leading-tight mb-1">{todaysDay.dayLabel.replace(/^Day \d+\s*—\s*/, "")}</h2>
          <p className="text-white/80 text-sm mb-5">{todaysDay.items.length} exercises · ~45 minutes</p>
          <CompleteWorkoutButton planDayId={todaysDay.id} done={alreadyDoneToday} />
          <Dumbbell size={120} className="absolute -right-6 -bottom-6 text-white/10 rotate-[20deg]" />
        </Reveal>
      ) : (
        <Reveal delay={0.12} className="rounded-[var(--radius-lg)] bg-surface border border-border-soft p-6 mb-5 text-center">
          <p className="text-sm text-text-secondary">No workout plan yet — ask your trainer to build one for you.</p>
        </Reveal>
      )}

      {/* Today's progress — small pill stats */}
      <p className="text-sm font-medium text-text-secondary mb-3">Today's progress</p>
      <Reveal delay={0.18} className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-[var(--radius-md)] bg-surface border border-border-soft p-4 flex flex-col items-center gap-1.5 transition-transform hover:-translate-y-1">
          <Flame size={18} className="text-amber" />
          <span className="font-display font-semibold"><CountUp value={todayStats.calories} /></span>
          <span className="text-[11px] text-text-muted">kcal</span>
        </div>
        <div className="rounded-[var(--radius-md)] bg-surface border border-border-soft p-4 flex flex-col items-center gap-1.5 transition-transform hover:-translate-y-1">
          <Dumbbell size={18} className="text-mint" />
          <span className="font-display font-semibold"><CountUp value={todayStats.exercises} /></span>
          <span className="text-[11px] text-text-muted">exercises</span>
        </div>
        <div className="rounded-[var(--radius-md)] bg-surface border border-border-soft p-4 flex flex-col items-center gap-1.5 transition-transform hover:-translate-y-1">
          <Clock3 size={18} className="text-violet" />
          <span className="font-display font-semibold"><CountUp value={todayStats.minutes} /></span>
          <span className="text-[11px] text-text-muted">minutes</span>
        </div>
      </Reveal>

      {/* Streak */}
      {!!profile?.streak?.currentStreak && (
        <Reveal delay={0.24} className="rounded-[var(--radius-md)] bg-mint-soft border border-mint/20 p-4 flex items-center gap-3 mb-4">
          <span className="h-10 w-10 rounded-full bg-bg flex items-center justify-center text-lg glow-pulse">🔥</span>
          <div>
            <p className="text-sm font-semibold text-mint"><CountUp value={profile.streak.currentStreak} suffix="-day streak" /></p>
            <p className="text-xs text-text-secondary">
              {profile.streak.currentStreak >= profile.streak.bestStreak ? "Best one yet — don't break it today." : `Best: ${profile.streak.bestStreak} days`}
            </p>
          </div>
        </Reveal>
      )}

      {/* Announcement teaser */}
      {latestAnnouncement && (
        <Reveal delay={0.3}>
          <Link href="/member/profile" className="rounded-[var(--radius-md)] bg-surface border border-border-soft p-4 flex items-center gap-3 transition-transform hover:-translate-y-0.5">
            <span className="h-9 w-9 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
              <Megaphone size={15} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{latestAnnouncement.title}</p>
              <p className="text-xs text-text-muted truncate">{latestAnnouncement.body}</p>
            </div>
          </Link>
        </Reveal>
      )}
    </div>
  );
}
