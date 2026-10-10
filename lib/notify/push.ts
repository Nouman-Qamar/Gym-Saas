import "server-only";
import webpush from "web-push";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { pushSubscriptions, notificationLog } from "@/lib/db/schema";

let configured = false;
function ensureConfigured() {
  if (configured) return true;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:support@ironline.app";
  if (!pub || !priv) return false;
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
  return true;
}

/** Send a web push notification to every subscription a set of users has
 * registered (each user can have several — one per device/browser). Prunes
 * subscriptions the push service reports as gone (410/404) automatically. */
export async function sendPushToUsers(
  userIds: string[],
  payload: { title: string; body: string; url?: string },
  meta?: { gymId?: string | null }
) {
  if (userIds.length === 0) return { sent: 0, skipped: true };
  if (!ensureConfigured()) {
    console.log(`\n[push:fallback] would push to ${userIds.length} user(s): ${payload.title} — ${payload.body}\n`);
    await db
      .insert(notificationLog)
      .values({ gymId: meta?.gymId ?? null, userId: null, channel: "PUSH", subject: payload.title, status: "skipped_no_provider" })
      .catch(() => {});
    return { sent: 0, skipped: true };
  }

  const subs = await db.query.pushSubscriptions.findMany({ where: inArray(pushSubscriptions.userId, userIds) });
  const body = JSON.stringify(payload);
  let sent = 0;
  const dead: string[] = [];

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          body
        );
        sent += 1;
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) dead.push(sub.id);
        else console.error("[push] send failed:", err);
      }
    })
  );

  if (dead.length) {
    await db.delete(pushSubscriptions).where(inArray(pushSubscriptions.id, dead)).catch(() => {});
  }

  await db
    .insert(notificationLog)
    .values({ gymId: meta?.gymId ?? null, userId: null, channel: "PUSH", subject: payload.title, status: sent > 0 ? "sent" : "failed" })
    .catch(() => {});

  return { sent, skipped: false };
}

export async function removeSubscription(endpoint: string) {
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint)).catch(() => {});
}
