import Link from "next/link";
import { Building2, Users, Wallet, ArrowUpRight } from "lucide-react";
import { getAllGymsSummary, getPlatformTotals } from "@/lib/queries/platform";
import { formatMoney } from "@/lib/queries/shared";
import { Card, Badge } from "@/components/ui/card";
import { Stagger, StaggerItem, CountUp } from "@/components/ui/motion";

export default async function PlatformDashboard() {
  const [gyms, totals] = await Promise.all([getAllGymsSummary(), getPlatformTotals()]);

  return (
    <main className="px-6 md:px-10 py-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold">All gyms</h1>
        <p className="text-text-secondary text-sm mt-1">Every gym on Ironline, at a glance — members, staff, and revenue.</p>
      </div>

      <Stagger className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StaggerItem>
          <Card noHover className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-secondary">Gyms on platform</span>
              <span className="h-8 w-8 rounded-full bg-violet-soft flex items-center justify-center text-violet shrink-0">
                <Building2 size={16} />
              </span>
            </div>
            <CountUp value={totals.gymCount} className="font-display text-3xl font-semibold tracking-tight" />
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card noHover className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-secondary">Total members</span>
              <span className="h-8 w-8 rounded-full bg-accent-soft flex items-center justify-center text-accent shrink-0">
                <Users size={16} />
              </span>
            </div>
            <CountUp value={totals.totalMembers} className="font-display text-3xl font-semibold tracking-tight" />
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card noHover className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-secondary">Total revenue collected</span>
              <span className="h-8 w-8 rounded-full bg-mint-soft flex items-center justify-center text-mint shrink-0">
                <Wallet size={16} />
              </span>
            </div>
            <p className="font-display text-3xl font-semibold tracking-tight">{formatMoney(totals.totalRevenueCents)}</p>
          </Card>
        </StaggerItem>
      </Stagger>

      {gyms.length === 0 ? (
        <Card noHover className="p-10 text-center">
          <p className="text-text-secondary text-sm">No gyms have signed up yet.</p>
        </Card>
      ) : (
        <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gyms.map((gym) => (
            // Deliberately a plain <Link> (not <Link><Card/></Link>) — Card
            // is itself a motion.div with its own hover/tap gesture
            // handling, and nesting a Next.js Link inside a framer-motion
            // gesture element swallows the click before navigation fires.
            // StaggerItem (also motion.div, but with no gesture props of
            // its own) wraps the Link instead, matching the pattern used
            // for the trainer workout-plan cards.
            <StaggerItem key={gym.id}>
              <Link
                href={`/platform/gyms/${gym.id}`}
                className="group block cursor-pointer rounded-[var(--radius-md)] bg-surface border border-border-soft p-5 transition-shadow hover:border-[color:var(--border)] hover:shadow-[0_12px_28px_-14px_rgba(0,0,0,0.55)]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="min-w-0">
                    <p className="font-display text-lg font-semibold truncate">{gym.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">/{gym.slug}</p>
                  </div>
                  <span className="h-8 w-8 rounded-full bg-surface-2 flex items-center justify-center text-text-secondary shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <ArrowUpRight size={16} />
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="font-display text-xl font-semibold">{gym.memberCount}</p>
                    <p className="text-[11px] text-text-muted mt-0.5">Members</p>
                  </div>
                  <div>
                    <p className="font-display text-xl font-semibold">{gym.trainerCount}</p>
                    <p className="text-[11px] text-text-muted mt-0.5">Trainers</p>
                  </div>
                  <div>
                    <p className="font-display text-xl font-semibold">{gym.activeMembers}</p>
                    <p className="text-[11px] text-text-muted mt-0.5">Active</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-soft">
                  <span className="text-xs text-text-muted">Revenue collected</span>
                  <Badge tone="mint">{formatMoney(gym.totalRevenueCents)}</Badge>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </main>
  );
}
