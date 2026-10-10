"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/current-user";
import { activeGateway, gatewayIsConfigured, type CheckoutResult } from "@/lib/payments/gateway";
import { createStripeCheckout } from "@/lib/payments/stripe";
import { createJazzCashCheckout } from "@/lib/payments/jazzcash";
import { createEasyPaisaCheckout } from "@/lib/payments/easypaisa";

export type StartCheckoutResult = { ok: true; result: CheckoutResult } | { ok: false; error: string };

export async function startPaymentCheckout(paymentId: string): Promise<StartCheckoutResult> {
  const user = await requireUser("MEMBER");
  const payment = await db.query.payments.findFirst({ where: eq(payments.id, paymentId) });
  if (!payment || payment.memberId !== user.id) return { ok: false, error: "Payment not found." };
  if (payment.status === "PAID") return { ok: false, error: "This payment is already settled." };

  const gateway = activeGateway();
  if (gateway === "off") return { ok: false, error: "Online payments aren't enabled for this gym yet — pay at the front desk." };
  if (!gatewayIsConfigured(gateway)) return { ok: false, error: `${gateway} isn't fully configured yet. Ask the gym admin to finish setup.` };

  const req = {
    paymentId: payment.id,
    amountCents: payment.amountCents,
    currency: "PKR" as const,
    description: "Gym membership payment",
    customerEmail: user.email,
    customerName: user.name,
  };

  try {
    const result =
      gateway === "stripe" ? await createStripeCheckout(req) : gateway === "jazzcash" ? await createJazzCashCheckout(req) : await createEasyPaisaCheckout(req);

    await db.update(payments).set({ gateway }).where(eq(payments.id, paymentId));
    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Couldn't start checkout." };
  }
}
