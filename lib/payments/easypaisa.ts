import "server-only";
import type { CheckoutRequest, CheckoutResult } from "./gateway";

// EasyPaisa (telenor/easypaisa.com.pk) adapter — intentionally a stub.
// Their merchant API (Open API / Instant Payment) requires a signed
// merchant agreement and endpoint URLs issued per-merchant, which aren't
// safe to hard-code here without real, current credentials to verify
// against. Wire it up the same way as jazzcash.ts once you have your
// EasyPaisa merchant integration pack: implement createEasyPaisaCheckout()
// below, add EASYPAISA_* keys to .env, and set PAYMENT_GATEWAY="easypaisa".
export async function createEasyPaisaCheckout(_req: CheckoutRequest): Promise<CheckoutResult> {
  throw new Error(
    "EasyPaisa isn't wired up yet — this adapter is a placeholder. Contact EasyPaisa for merchant API docs/credentials, then implement createEasyPaisaCheckout() in lib/payments/easypaisa.ts (same shape as the JazzCash adapter)."
  );
}
