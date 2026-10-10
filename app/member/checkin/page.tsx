import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireUser } from "@/lib/auth/current-user";
import { Reveal } from "@/components/ui/motion";
import { QrDisplay } from "./qr-display";

export default async function MemberCheckinPage() {
  const user = await requireUser("MEMBER");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const checkInUrl = `${appUrl}/checkin/${user.id}`;

  return (
    <div className="px-5 pt-6 pb-8 flex flex-col items-center text-center">
      <Link href="/member/dashboard" className="self-start text-sm text-text-muted flex items-center gap-1 mb-6">
        <ChevronLeft size={15} /> Home
      </Link>

      <Reveal>
        <h1 className="font-display text-2xl font-semibold mb-1">Your check-in code</h1>
        <p className="text-text-secondary text-sm mb-8 max-w-xs">
          Show this to the front desk when you arrive — they'll scan it and you're in. No queue, no card.
        </p>
      </Reveal>

      <QrDisplay value={checkInUrl} />

      <Reveal delay={0.2}>
        <p className="text-xs text-text-muted mt-8 max-w-xs">
          Tip: install {process.env.NEXT_PUBLIC_APP_NAME || "Ironline"} to your home screen so this is always one tap away.
        </p>
      </Reveal>
    </div>
  );
}
