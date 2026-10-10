"use client";

import { useTransition, useState } from "react";
import { Loader2, Check, Bell, BellRing } from "lucide-react";
import { markPaymentPaid, sendPaymentReminder } from "@/lib/actions/admin";

export function MarkPaidButton({ paymentId }: { paymentId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(() => markPaymentPaid(paymentId))}
      disabled={pending}
      className="h-8 px-3 rounded-full bg-mint-soft text-mint hover:opacity-80 text-xs font-medium flex items-center gap-1.5 transition-opacity disabled:opacity-50"
    >
      {pending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
      Mark paid
    </button>
  );
}

export function RemindButton({ paymentId }: { paymentId: string }) {
  const [pending, start] = useTransition();
  const [sent, setSent] = useState(false);
  return (
    <button
      onClick={() =>
        start(async () => {
          await sendPaymentReminder(paymentId);
          setSent(true);
          setTimeout(() => setSent(false), 2500);
        })
      }
      disabled={pending}
      className="h-8 px-3 rounded-full bg-surface-2 text-text-secondary hover:text-text-primary text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-50"
    >
      {pending ? <Loader2 size={12} className="animate-spin" /> : sent ? <BellRing size={12} className="text-accent" /> : <Bell size={12} />}
      {sent ? "Sent" : "Remind"}
    </button>
  );
}
