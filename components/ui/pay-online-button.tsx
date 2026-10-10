"use client";

import { useState, useTransition } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { startPaymentCheckout } from "@/lib/actions/payments";

export function PayOnlineButton({ paymentId, className }: { paymentId: string; className?: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function pay() {
    setError(null);
    start(async () => {
      const res = await startPaymentCheckout(paymentId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      if (res.result.kind === "redirect") {
        window.location.href = res.result.url;
        return;
      }
      // JazzCash-style hosted checkout: browser must POST, not GET-redirect.
      const form = document.createElement("form");
      form.method = "POST";
      form.action = res.result.actionUrl;
      for (const [key, value] of Object.entries(res.result.fields)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={pay}
        disabled={pending}
        className={
          className ??
          "shine-sweep h-11 px-5 rounded-[var(--radius-md)] bg-accent text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-accent-strong active:scale-[0.98] transition-all disabled:opacity-60"
        }
      >
        {pending ? <Loader2 size={15} className="animate-spin" /> : <CreditCard size={15} />}
        Pay online
      </button>
      {error && <p className="text-xs text-danger mt-2">{error}</p>}
    </div>
  );
}
