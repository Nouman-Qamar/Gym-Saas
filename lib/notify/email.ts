import "server-only";
import { Resend } from "resend";
import { db } from "@/lib/db";
import { notificationLog } from "@/lib/db/schema";

// Pluggable email sender. Real delivery needs RESEND_API_KEY (resend.com has
// a free tier — sign up, verify a sending domain or use their shared test
// domain, and drop the key in .env). Without a key, emails are logged to the
// console instead of thrown away, so every code path that calls this keeps
// working in local/demo use — the moment a key is added, real emails start
// sending with zero code changes.
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  gymId?: string | null;
  userId?: string | null;
}) {
  const from = process.env.EMAIL_FROM || "Ironline <onboarding@resend.dev>";
  const apiKey = process.env.RESEND_API_KEY;

  let status: "sent" | "skipped_no_provider" | "failed" = "skipped_no_provider";

  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      });
      status = error ? "failed" : "sent";
      if (error) console.error("[email] Resend error:", error);
    } catch (err) {
      status = "failed";
      console.error("[email] send failed:", err);
    }
  } else {
    // Dev/demo fallback — makes the feature visibly "real" without a key.
    console.log(`\n[email:fallback] would send to ${opts.to}\nSubject: ${opts.subject}\n${opts.text ?? opts.html}\n`);
  }

  await db
    .insert(notificationLog)
    .values({
      gymId: opts.gymId ?? null,
      userId: opts.userId ?? null,
      channel: "EMAIL",
      subject: opts.subject,
      status,
    })
    .catch(() => {}); // logging must never break the calling flow

  return { status };
}
