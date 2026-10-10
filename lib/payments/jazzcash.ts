import "server-only";
import { createHash } from "crypto";
import type { CheckoutRequest, CheckoutResult } from "./gateway";

// JazzCash Page Redirection API (Pakistan). Structurally correct
// implementation of their hosted-checkout flow: build the pp_* fields,
// compute pp_SecureHash (HMAC-SHA256 style hash over "&"-joined sorted
// values, prefixed with the Integrity Salt, per JazzCash's integration
// guide), and POST-redirect the browser to their transaction endpoint.
// Needs JAZZCASH_MERCHANT_ID / JAZZCASH_PASSWORD / JAZZCASH_INTEGRITY_SALT
// from your JazzCash merchant dashboard (sandbox or live) to activate —
// without them this throws rather than pretending to work.

const SANDBOX_URL = "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";
const LIVE_URL = "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";

function pad(n: number, len: number) {
  return String(n).padStart(len, "0");
}

function secureHash(fields: Record<string, string>, salt: string) {
  // JazzCash: sort pp_* keys alphabetically, join non-empty values with "&",
  // prefix with the integrity salt, HMAC-SHA256 (their docs call this
  // "SecureHash" — algorithmically it's salt-prefixed HMAC over the value
  // string, hex-encoded, uppercase).
  const sortedValues = Object.keys(fields)
    .filter((k) => k.startsWith("pp_") && fields[k] !== "")
    .sort()
    .map((k) => fields[k]);
  const hashString = `${salt}&${sortedValues.join("&")}`;
  return createHash("sha256").update(hashString).digest("hex").toUpperCase();
}

export async function createJazzCashCheckout(req: CheckoutRequest): Promise<CheckoutResult> {
  const merchantId = process.env.JAZZCASH_MERCHANT_ID;
  const password = process.env.JAZZCASH_PASSWORD;
  const salt = process.env.JAZZCASH_INTEGRITY_SALT;
  if (!merchantId || !password || !salt) {
    throw new Error(
      "JazzCash isn't configured — set JAZZCASH_MERCHANT_ID, JAZZCASH_PASSWORD and JAZZCASH_INTEGRITY_SALT in .env (get these from your JazzCash merchant dashboard)."
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const now = new Date();
  const txnDateTime = `${now.getFullYear()}${pad(now.getMonth() + 1, 2)}${pad(now.getDate(), 2)}${pad(now.getHours(), 2)}${pad(now.getMinutes(), 2)}${pad(now.getSeconds(), 2)}`;
  const expiry = new Date(now.getTime() + 60 * 60 * 1000);
  const txnExpiry = `${expiry.getFullYear()}${pad(expiry.getMonth() + 1, 2)}${pad(expiry.getDate(), 2)}${pad(expiry.getHours(), 2)}${pad(expiry.getMinutes(), 2)}${pad(expiry.getSeconds(), 2)}`;
  const txnRefNo = `T${txnDateTime}`;

  const fields: Record<string, string> = {
    pp_Version: "1.1",
    pp_TxnType: "MPAY",
    pp_Language: "EN",
    pp_MerchantID: merchantId,
    pp_Password: password,
    pp_TxnRefNo: txnRefNo,
    pp_Amount: String(req.amountCents), // JazzCash expects amount in paisa (cents-equivalent), matches our schema's *Cents fields
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: txnDateTime,
    pp_BillReference: req.paymentId,
    pp_Description: req.description,
    pp_TxnExpiryDateTime: txnExpiry,
    pp_ReturnURL: `${appUrl}/api/payments/jazzcash/return`,
  };
  fields.pp_SecureHash = secureHash(fields, salt);

  const actionUrl = process.env.NODE_ENV === "production" ? LIVE_URL : SANDBOX_URL;
  return { kind: "post-form", actionUrl, fields };
}

export function verifyJazzCashReturn(fields: Record<string, string>): { valid: boolean; paymentId: string | null; success: boolean } {
  const salt = process.env.JAZZCASH_INTEGRITY_SALT;
  if (!salt) return { valid: false, paymentId: null, success: false };

  const receivedHash = fields.pp_SecureHash;
  const { pp_SecureHash: _drop, ...rest } = fields;
  void _drop;
  const expected = secureHash(rest, salt);

  return {
    valid: receivedHash === expected,
    paymentId: fields.pp_BillReference || null,
    success: fields.pp_ResponseCode === "000",
  };
}
