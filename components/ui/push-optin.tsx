"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell, BellOff, BellRing, Loader2 } from "lucide-react";
import { savePushSubscription, removePushSubscription } from "@/lib/actions/notifications";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

/** Small, self-contained "enable notifications" toggle. Works the same way
 * on every role's settings/profile page. Silently does nothing on browsers
 * without push support (e.g. iOS Safari outside of an installed PWA) rather
 * than showing a broken control. */
export function PushOptIn() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    setSupported(true);
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
    });
  }, []);

  function enable() {
    start(async () => {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;
      const reg = await navigator.serviceWorker.ready;
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) return;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      await savePushSubscription(sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } });
      setSubscribed(true);
    });
  }

  function disable() {
    start(async () => {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await removePushSubscription(sub.endpoint);
        await sub.unsubscribe();
      }
      setSubscribed(false);
    });
  }

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={subscribed ? disable : enable}
      disabled={pending}
      className={`w-full flex items-center gap-3 rounded-[var(--radius-md)] border p-4 text-left transition-colors disabled:opacity-60 ${
        subscribed ? "border-mint/30 bg-mint-soft" : "border-border-soft bg-bg-elevated hover:border-border"
      }`}
    >
      <span className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${subscribed ? "bg-mint text-bg" : "bg-surface-2 text-text-secondary"}`}>
        {pending ? <Loader2 size={16} className="animate-spin" /> : subscribed ? <BellRing size={16} /> : <Bell size={16} />}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium">{subscribed ? "Push notifications on" : "Enable push notifications"}</span>
        <span className="block text-xs text-text-muted mt-0.5">
          {subscribed ? "You'll get alerts for announcements, bookings, and reminders." : "Get notified even when the app is closed."}
        </span>
      </span>
      {subscribed && <BellOff size={14} className="text-text-muted shrink-0" />}
    </button>
  );
}
