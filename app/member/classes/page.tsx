import { requireUser } from "@/lib/auth/current-user";
import { getGymClasses } from "@/lib/queries/member";
import { BookButton } from "./book-button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { ChevronLeft, Clock, Users } from "lucide-react";
import Link from "next/link";

export default async function MemberClassesPage() {
  const user = await requireUser("MEMBER");
  const classes = await getGymClasses(user.gymId, user.id);

  return (
    <div className="px-5 pt-6 pb-8">
      <Link href="/member/dashboard" className="text-sm text-text-muted flex items-center gap-1 mb-4">
        <ChevronLeft size={15} /> Home
      </Link>
      <Reveal>
        <h1 className="font-display text-2xl font-semibold mb-1">Classes</h1>
        <p className="text-text-secondary text-sm mb-6">Book a spot — space is limited.</p>
      </Reveal>

      <Stagger className="space-y-3">
        {classes.map((c) => {
          const booked = c.bookings.filter((b) => b.status === "BOOKED").length;
          const isFull = booked >= c.capacity;
          return (
            <StaggerItem key={c.id} className="rounded-[var(--radius-lg)] bg-surface border border-border-soft p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="font-display font-semibold text-sm">{c.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">{c.type}</p>
                </div>
                <BookButton classId={c.id} isBooked={c.isBooked} isFull={isFull && !c.isBooked} />
              </div>
              <div className="flex items-center gap-4 text-xs text-text-secondary">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {c.startsAt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} ·{" "}
                  {c.startsAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={12} /> {booked}/{c.capacity}
                </span>
                {c.trainer && <span>{c.trainer.name}</span>}
              </div>
            </StaggerItem>
          );
        })}
        {classes.length === 0 && <p className="text-sm text-text-muted">No upcoming classes right now.</p>}
      </Stagger>
    </div>
  );
}
