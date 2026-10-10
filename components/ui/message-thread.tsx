"use client";

import { useActionState, useRef, useEffect } from "react";
import { sendMessage } from "@/lib/actions/trainer";
import { Send } from "lucide-react";

type Message = { id: string; senderId: string; body: string; createdAt: Date };

export function MessageThread({ currentUserId, receiverId, messages }: { currentUserId: string; receiverId: string; messages: Message[] }) {
  const [, formAction] = useActionState(sendMessage, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-2.5 p-4">
        {messages.map((m) => {
          const mine = m.senderId === currentUserId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-[var(--radius-md)] px-3.5 py-2.5 text-sm ${
                  mine ? "bg-accent text-white rounded-br-sm" : "bg-surface-2 rounded-bl-sm"
                }`}
              >
                {m.body}
                <p className={`text-[10px] mt-1 ${mine ? "text-white/60" : "text-text-muted"}`}>
                  {m.createdAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && <p className="text-sm text-text-muted text-center mt-8">Say hello 👋</p>}
        <div ref={bottomRef} />
      </div>

      <form
        ref={formRef}
        action={async (fd) => {
          const res = await formAction(fd);
          formRef.current?.reset();
          return res;
        }}
        className="flex items-center gap-2 p-3 border-t border-border-soft"
      >
        <input type="hidden" name="receiverId" value={receiverId} />
        <input
          name="body"
          placeholder="Type a message…"
          required
          autoComplete="off"
          className="flex-1 h-11 rounded-[var(--radius-md)] bg-bg-elevated border border-border px-3.5 text-sm placeholder:text-text-muted focus:outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="h-11 w-11 rounded-[var(--radius-md)] bg-accent text-white flex items-center justify-center hover:bg-accent-strong active:scale-95 transition-all shrink-0"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
