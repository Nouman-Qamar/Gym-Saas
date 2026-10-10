// Provider-agnostic "pay online" abstraction. A member paying through the
// app calls createCheckout() for whichever gateway is configured; the
// gateway's own return/webhook route calls markPaymentPaidByRef() to close
// the loop. Swapping providers is a one-line env change — no page changes.
import "server-only";

export type CheckoutRequest = {
  paymentId: string;
  amountCents: number;
  currency: "PKR" | "USD";
  description: string;
  customerEmail: string;
  customerName: string;
};

export type CheckoutResult =
  | { kind: "redirect"; url: string }
  | { kind: "post-form"; actionUrl: string; fields: Record<string, string> };

export type Gateway = "stripe" | "jazzcash" | "easypaisa" | "off";

export function activeGateway(): Gateway {
  const g = (process.env.PAYMENT_GATEWAY || "off").toLowerCase();
  if (g === "stripe" || g === "jazzcash" || g === "easypaisa") return g;
  return "off";
}

export function gatewayIsConfigured(gateway: Gateway): boolean {
  if (gateway === "stripe") return !!process.env.STRIPE_SECRET_KEY;
  if (gateway === "jazzcash") return !!(process.env.JAZZCASH_MERCHANT_ID && process.env.JAZZCASH_PASSWORD && process.env.JAZZCASH_INTEGRITY_SALT);
  if (gateway === "easypaisa") return false; // adapter stub — see easypaisa.ts
  return false;
}
