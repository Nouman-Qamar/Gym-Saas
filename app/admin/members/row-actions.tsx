"use client";

import { useTransition } from "react";
import { QrCode, Loader2 } from "lucide-react";
import { manualCheckIn, assignTrainer } from "@/lib/actions/admin";

export function CheckInButton({ memberId }: { memberId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(() => manualCheckIn(memberId))}
      disabled={pending}
      className="h-8 px-3 rounded-full bg-surface-2 hover:bg-accent-soft hover:text-accent text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
      title="Manual front-desk check-in"
    >
      {pending ? <Loader2 size={12} className="animate-spin" /> : <QrCode size={12} />}
      Check in
    </button>
  );
}

export function TrainerSelect({
  memberId,
  currentTrainerId,
  trainers,
}: {
  memberId: string;
  currentTrainerId: string | null;
  trainers: { id: string; name: string }[];
}) {
  const [pending, start] = useTransition();
  return (
    <select
      defaultValue={currentTrainerId ?? ""}
      disabled={pending}
      onChange={(e) => start(() => assignTrainer(memberId, e.target.value))}
      className="h-8 rounded-[var(--radius-sm)] bg-surface-2 border border-border-soft text-xs px-2 focus:outline-none focus:border-accent"
    >
      <option value="">No trainer</option>
      {trainers.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </select>
  );
}
