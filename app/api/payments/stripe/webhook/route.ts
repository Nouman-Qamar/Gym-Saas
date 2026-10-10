import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { constructStripeEvent } from "@/lib/payments/stripe";
import { finalizeOnlinePayment } from "@/lib/payments/finalize";

// Stripe webhook — configure this URL (https://yourdomain.com/api/payments/stripe/webhook)
// in the Stripe dashboard under Developers > Webhooks, listening for
// `checkout.session.completed`, and copy the signing secret into
// STRIPE_WEBHOOK_SECRET. Route Handlers get the raw request body via
// request.text(), which is required for Stripe's signature check.
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = constructStripeEvent(rawBody, signature);
  } catch (err) {
    console.error("[stripe webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const paymentId = session.metadata?.paymentId;
    if (paymentId) {
      await finalizeOnlinePayment(paymentId, session.id);
    }
  }

  return NextResponse.json({ received: true });
}
