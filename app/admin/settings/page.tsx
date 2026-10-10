import { requireUser } from "@/lib/auth/current-user";
import { getMembershipPlans } from "@/lib/queries/admin";
import { resolveVibe } from "@/lib/theme";
import { Card, Badge } from "@/components/ui/card";
import { ThemePicker } from "@/components/ui/theme-picker";
import { PushOptIn } from "@/components/ui/push-optin";
import { activeGateway, gatewayIsConfigured } from "@/lib/payments/gateway";
import { GymSettingsForm, ProfileForm, PlanPriceRow } from "./forms";

export default async function AdminSettingsPage() {
  const user = await requireUser("ADMIN");
  const plans = await getMembershipPlans(user.gymId);
  const vibe = resolveVibe(user.gender, user.themeOverride);
  const gateway = activeGateway();
  const gatewayConfigured = gatewayIsConfigured(gateway);

  return (
    <main className="px-6 md:px-10 py-8 max-w-[900px]">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Settings</h1>
        <p className="text-text-secondary text-sm mt-1">Gym details, membership plans, and your own profile.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-display text-lg font-semibold mb-4">Gym details</h3>
          <GymSettingsForm name={user.gym?.name ?? ""} address={user.gym?.address ?? null} phone={user.gym?.phone ?? null} />
          <p className="text-xs text-text-muted mt-4">
            Join code for new member signups: <span className="font-medium text-text-secondary">{user.gym?.slug}</span>
          </p>
        </Card>

        <Card>
          <h3 className="font-display text-lg font-semibold mb-4">Membership plans</h3>
          {plans.map((p) => (
            <PlanPriceRow key={p.id} id={p.id} name={p.name} priceCents={p.priceCents} />
          ))}
        </Card>

        <Card>
          <h3 className="font-display text-lg font-semibold mb-4">Your profile</h3>
          <ProfileForm name={user.name} phone={user.phone} />
        </Card>

        <Card>
          <h3 className="font-display text-lg font-semibold mb-1">App vibe</h3>
          <p className="text-text-muted text-xs mb-4">Changes your view instantly — everyone picks their own.</p>
          <ThemePicker current={vibe} />
        </Card>

        <Card>
          <h3 className="font-display text-lg font-semibold mb-4">Notifications</h3>
          <PushOptIn />
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-display text-lg font-semibold">Online payments</h3>
            <Badge tone={gateway === "off" ? "neutral" : gatewayConfigured ? "mint" : "amber"}>
              {gateway === "off" ? "Off" : gatewayConfigured ? "Connected" : "Needs setup"}
            </Badge>
          </div>
          <p className="text-text-muted text-xs leading-relaxed">
            {gateway === "off" && "Members pay at the front desk only. Set PAYMENT_GATEWAY in your .env to \"stripe\" or \"jazzcash\" to let members pay from the app."}
            {gateway !== "off" && !gatewayConfigured && `${gateway === "stripe" ? "Stripe" : "JazzCash"} is selected but missing its API keys — add them to .env to activate.`}
            {gateway !== "off" && gatewayConfigured && `Members can pay outstanding balances online via ${gateway === "stripe" ? "Stripe" : "JazzCash"} — payments post back automatically.`}
          </p>
        </Card>
      </div>
    </main>
  );
}
