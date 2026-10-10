"use client";

import { useTransition } from "react";
import { Loader2, Check, Plus } from "lucide-react";
import { bookClass, cancelBooking } from "@/lib/actions/member";

export function BookButton({ classId, isBooked, isFull }: { classId: string; isBooked: boolean; isFull: boolean }) {
  const [pending, start] = useTransition();

  if (isBooked) {
    return (
      <button
        onClick={() => start(() => cancelBooking(classId))}
        disabled={pending}
        className="h-9 px-3.5 rounded-full bg-mint-soft text-mint text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
      >
        {pending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
        Booked
      </button>
    );
  }

  return (
    <button
      onClick={() => start(() => bookClass(classId))}
      disabled={pending || isFull}
      className="h-9 px-3.5 rounded-full bg-accent text-white text-xs font-medium flex items-center gap-1.5 hover:bg-accent-strong disabled:opacity-40 transition-colors"
    >
      {pending ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
      {isFull ? "Full" : "Book"}
    </button>
  );
}
