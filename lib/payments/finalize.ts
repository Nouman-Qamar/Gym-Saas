import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { payments, memberships, membershipPlans } from "@/lib/db/schema";
import { sendEmail } from "@/lib/notify/email";
import { sendPushToUsers } from "@/lib/notify/push";
import { formatMoney } from "@/lib/queries/shared";

/** Shared by every gateway's webhook/return route: mark the payment PAID,
 * and if it's tied to a membership, renew that membership from today (or
 * from its current expiry, whichever is later, so early renewals don't
 * lose paid-for days). Idempotent — safe to call twice for the same
 * paymentId (a webhook retry, or the browser return firing alongside the
 * webhook), since it just re-sets the same PAID state. */
export async function finalizeOnlinePayment(paymentId: string, gatewayRef: string) {
  const payment = await db.query.payments.findFirst({
    where: eq(payments.id, paymentId),
    with: { member: { with: { user: true } } },
  });
  if (!payment) return { ok: false as const };
  if (payment.status === "PAID") return { ok: true as const, alreadyPaid: true };

  await db.update(payments).set({ status: "PAID", date: new Date(), gatewayRef }).where(eq(payments.id, paymentId));

  if (payment.membershipId) {
    const membership = await db.query.memberships.findFirst({ where: eq(memberships.id, payment.membershipId) });
    if (membership) {
      const plan = await db.query.membershipPlans.findFirst({ where: eq(membershipPlans.id, membership.planId) });
      const durationDays = plan?.durationDays ?? 30;
      const base = membership.endDate > new Date() ? membership.endDate : new Date();
      const newEnd = new Date(base.getTime() + durationDays * 24 * 60 * 60 * 1000);
      await db.update(memberships).set({ endDate: newEnd, status: "ACTIVE" }).where(eq(memberships.id, membership.id));
    }
  }

  const amount = formatMoney(payment.amountCents);
  await sendEmail({
    to: payment.member.user.email,
    subject: `Payment received — ${amount}`,
    html: `<p>Hi ${payment.member.user.name.split(" ")[0]},</p><p>We've received your payment of <strong>${amount}</strong>. Thanks for staying with us!</p>`,
    text: `Payment received: ${amount}. Thank you!`,
    gymId: payment.member.user.gymId,
    userId: payment.member.user.id,
  });
  await sendPushToUsers(
    [payment.member.user.id],
    { title: "Payment received", body: `${amount} — thank you!`, url: "/member/dashboard" },
    { gymId: payment.member.user.gymId }
  );

  return { ok: true as const, alreadyPaid: false };
}
