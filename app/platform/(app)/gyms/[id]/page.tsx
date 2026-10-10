import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users, UserCog, Wallet, MapPin, Phone } from "lucide-react";
import { getGymDetail } from "@/lib/queries/platform";
import { formatMoney, initials } from "@/lib/queries/shared";
import { Card, Badge } from "@/components/ui/card";
import { Stagger, StaggerItem } from "@/components/ui/motion";

export default async function PlatformGymDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getGymDetail(id);
  if (!detail) notFound();

  const { gym, admins, trainers, members, plans } = detail;
  const activeCount = members.filter((m) => m.memberships.some((ms) => ms.status === "ACTIVE")).length;
  const paidTotal = members.reduce(
    (sum, m) => sum + m.payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amountCents, 0),
    0
  );

  return (
    <main className="px-6 md:px-10 py-8">
      <Link href="/platform/dashboard" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6">
        <ArrowLeft size={15} /> All gyms
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold">{gym.name}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary mt-1.5">
          <span>/{gym.slug}</span>
          {gym.address && (
            <span className="flex items-center gap-1">
              <MapPin size={13} /> {gym.address}
            </span>
          )}
          {gym.phone && (
            <span className="flex items-center gap-1">
              <Phone size={13} /> {gym.phone}
            </span>
          )}
        </div>
      </div>

      <Stagger className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StaggerItem>
          <Card noHover className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-secondary">Members</span>
              <span className="h-8 w-8 rounded-full bg-accent-soft flex items-center justify-center text-accent shrink-0">
                <Users size={16} />
              </span>
            </div>
            <p className="font-display text-3xl font-semibold tracking-tight">
              {members.length} <span className="text-base font-normal text-text-muted">({activeCount} active)</span>
            </p>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card noHover className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-secondary">Staff</span>
              <span className="h-8 w-8 rounded-full bg-violet-soft flex items-center justify-center text-violet shrink-0">
                <UserCog size={16} />
              </span>
            </div>
            <p className="font-display text-3xl font-semibold tracking-tight">{admins.length + trainers.length}</p>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card noHover className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-secondary">Revenue collected</span>
              <span className="h-8 w-8 rounded-full bg-mint-soft flex items-center justify-center text-mint shrink-0">
                <Wallet size={16} />
              </span>
            </div>
            <p className="font-display text-3xl font-semibold tracking-tight">{formatMoney(paidTotal)}</p>
          </Card>
        </StaggerItem>
      </Stagger>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card noHover className="p-5">
          <h3 className="font-display text-lg font-semibold mb-4">Membership plans</h3>
          {plans.length === 0 && <p className="text-sm text-text-muted">No plans set up yet.</p>}
          <div className="space-y-2">
            {plans.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-border-soft last:border-0">
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-text-muted">{p.durationDays} days</p>
                </div>
                <Badge tone="accent">{formatMoney(p.priceCents)}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card noHover className="p-5">
          <h3 className="font-display text-lg font-semibold mb-4">Admins & trainers</h3>
          <div className="space-y-3">
            {[...admins.map((a) => ({ ...a, tag: "Admin" })), ...trainers.map((t) => ({ ...t.user, tag: "Trainer" }))].map((person) => (
              <div key={`${person.tag}-${person.id}`} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-accent to-accent-strong flex items-center justify-center text-xs font-semibold text-white shrink-0">
                  {initials(person.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{person.name}</p>
                  <p className="text-xs text-text-muted truncate">{person.email}</p>
                </div>
                <Badge tone={person.tag === "Admin" ? "violet" : "neutral"}>{person.tag}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card noHover className="p-5 lg:col-span-2">
          <h3 className="font-display text-lg font-semibold mb-4">Members ({members.length})</h3>
          {members.length === 0 ? (
            <p className="text-sm text-text-muted">No members yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-text-muted border-b border-border-soft">
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium">Email</th>
                    <th className="pb-2 font-medium">Plan</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => {
                    const activeMs = m.memberships.find((ms) => ms.status === "ACTIVE") ?? m.memberships[0];
                    return (
                      <tr key={m.userId} className="border-b border-border-soft last:border-0">
                        <td className="py-2.5 font-medium">{m.user.name}</td>
                        <td className="py-2.5 text-text-secondary">{m.user.email}</td>
                        <td className="py-2.5 text-text-secondary">{activeMs?.plan?.name ?? "—"}</td>
                        <td className="py-2.5">
                          {activeMs ? (
                            <Badge tone={activeMs.status === "ACTIVE" ? "mint" : activeMs.status === "EXPIRING" ? "amber" : "danger"}>
                              {activeMs.status}
                            </Badge>
                          ) : (
                            <Badge tone="neutral">No plan</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
