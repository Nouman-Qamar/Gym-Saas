import { NextResponse } from "next/server";
import { verifyJazzCashReturn } from "@/lib/payments/jazzcash";
import { finalizeOnlinePayment } from "@/lib/payments/finalize";

// JazzCash POSTs the customer's browser back to this URL (pp_ReturnURL)
// after checkout, form-encoded. We verify pp_SecureHash ourselves (never
// trust the browser leg alone for a real deployment — JazzCash also offers
// a server-to-server callback for that; this return leg is what updates
// the UI the customer actually sees).
export async function POST(request: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const form = await request.formData();
  const fields: Record<string, string> = {};
  for (const [key, value] of form.entries()) fields[key] = String(value);

  const { valid, paymentId, success } = verifyJazzCashReturn(fields);

  if (valid && success && paymentId) {
    await finalizeOnlinePayment(paymentId, fields.pp_TxnRefNo || "jazzcash");
    return NextResponse.redirect(`${appUrl}/member/dashboard?paid=1`);
  }

  return NextResponse.redirect(`${appUrl}/member/dashboard?paid=0`);
}
