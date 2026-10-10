import "server-only";
import Stripe from "stripe";
import type { CheckoutRequest, CheckoutResult } from "./gateway";

let client: Stripe | null = null;
function stripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set — add it to .env to enable Stripe checkout.");
  if (!client) client = new Stripe(key);
  return client;
}

/** Creates a real Stripe Checkout Session in test or live mode depending on
 * which key is configured. Works end-to-end with Stripe's test card
 * 4242 4242 4242 4242 once STRIPE_SECRET_KEY/STRIPE_WEBHOOK_SECRET are set. */
export async function createStripeCheckout(req: CheckoutRequest): Promise<CheckoutResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: req.customerEmail,
    line_items: [
      {
        price_data: {
          currency: req.currency.toLowerCase(),
          product_data: { name: req.description },
          unit_amount: req.amountCents,
        },
        quantity: 1,
      },
    ],
    metadata: { paymentId: req.paymentId },
    success_url: `${appUrl}/member/dashboard?paid=1`,
    cancel_url: `${appUrl}/member/dashboard?paid=0`,
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL.");
  return { kind: "redirect", url: session.url };
}

export function constructStripeEvent(rawBody: string, signature: string): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set.");
  return stripe().webhooks.constructEvent(rawBody, signature, secret);
}
