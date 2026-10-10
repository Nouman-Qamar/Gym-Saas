import "server-only";
import { db } from "@/lib/db";
import { notificationLog } from "@/lib/db/schema";

// Pluggable SMS sender via Twilio's plain REST API (no SDK — one fetch
// call, Basic Auth with Account SID + Auth Token). Twilio works from/to
// Pakistani numbers in E.164 format (+92...) same as anywhere else, and its
// free trial is enough to test this end-to-end. To use a local gateway
// (JazzCash SMS, Telenor, etc.) instead, swap the fetch call below for that
// provider's API — the sendSms() signature and the console fallback stay
// the same either way.
export async function sendSms(opts: {
  to: string; // E.164, e.g. "+923001234567"
  body: string;
  gymId?: string | null;
  userId?: string | null;
}) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  let status: "sent" | "skipped_no_provider" | "failed" = "skipped_no_provider";

  if (sid && token && from) {
    try {
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: opts.to, From: from, Body: opts.body }),
      });
      status = res.ok ? "sent" : "failed";
      if (!res.ok) console.error("[sms] Twilio error:", await res.text());
    } catch (err) {
      status = "failed";
      console.error("[sms] send failed:", err);
    }
  } else {
    console.log(`\n[sms:fallback] would text ${opts.to}\n${opts.body}\n`);
  }

  await db
    .insert(notificationLog)
    .values({
      gymId: opts.gymId ?? null,
      userId: opts.userId ?? null,
      channel: "SMS",
      subject: opts.body.slice(0, 80),
      status,
    })
    .catch(() => {});

  return { status };
}
