import Link from "next/link";
import { Dumbbell } from "lucide-react";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Ironline";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center px-5 py-12">
      {/* Ambient gradient blobs — the same "premium, playful" language as the landing page */}
      <div className="pointer-events-none absolute -top-32 -left-24 h-72 w-72 rounded-full bg-accent/25 blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-accent-2/20 blur-[100px]" />

      <div className="relative w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <span className="h-10 w-10 rounded-2xl bg-gradient-to-br from-accent to-accent-strong flex items-center justify-center shadow-lg shadow-accent/30">
            <Dumbbell size={19} className="text-white" />
          </span>
          <span className="font-display text-xl font-semibold">{APP_NAME}</span>
        </Link>

        <div className="rounded-[var(--radius-lg)] bg-surface border border-border-soft p-7 sm:p-8 shadow-2xl shadow-black/20">
          {children}
        </div>
      </div>
    </main>
  );
}
