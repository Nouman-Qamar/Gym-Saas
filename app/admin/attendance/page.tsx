import { requireUser } from "@/lib/auth/current-user";
import { getAttendanceToday, getMembers } from "@/lib/queries/admin";
import { initials } from "@/lib/queries/shared";
import { Badge } from "@/components/ui/card";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { CheckInButton } from "../members/row-actions";

export default async function AttendancePage() {
  const user = await requireUser("ADMIN");
  const [rows, members] = await Promise.all([getAttendanceToday(user.gymId), getMembers(user.gymId)]);

  const checkedInIds = new Set(rows.map((r) => r.memberId));
  const notCheckedIn = members.filter((m) => !checkedInIds.has(m.id));

  return (
    <main className="px-6 md:px-10 py-8 max-w-[1400px]">
      <Reveal className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Attendance</h1>
        <p className="text-text-secondary text-sm mt-1">{rows.length} check-ins today</p>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Reveal delay={0.06} className="rounded-[var(--radius-lg)] bg-surface border border-border-soft p-5">
          <h3 className="font-display text-lg font-semibold mb-4">Checked in today</h3>
          <Stagger className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {rows.map((r) => (
              <StaggerItem key={r.id} className="flex items-center gap-3">
                <span className="h-9 w-9 rounded-full bg-mint-soft text-mint flex items-center justify-center text-xs font-semibold shrink-0">
                  {initials(r.member.user.name)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.member.user.name}</p>
                  <p className="text-xs text-text-muted">
                    {r.checkInAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
                <Badge tone={r.method === "QR" ? "accent" : "neutral"}>{r.method === "QR" ? "QR" : r.method === "FRONT_DESK" ? "Desk" : "Manual"}</Badge>
              </StaggerItem>
            ))}
            {rows.length === 0 && <p className="text-sm text-text-muted">No check-ins yet today.</p>}
          </Stagger>
        </Reveal>

        <Reveal delay={0.12} className="rounded-[var(--radius-lg)] bg-surface border border-border-soft p-5">
          <h3 className="font-display text-lg font-semibold mb-1">Not yet checked in</h3>
          <p className="text-text-muted text-xs mb-4">Front-desk override for members without their phone</p>
          <Stagger className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {notCheckedIn.map((m) => (
              <StaggerItem key={m.id} className="flex items-center gap-3">
                <span className="h-9 w-9 rounded-full bg-surface-2 flex items-center justify-center text-xs font-semibold shrink-0">
                  {initials(m.name)}
                </span>
                <p className="flex-1 text-sm font-medium truncate">{m.name}</p>
                <CheckInButton memberId={m.id} />
              </StaggerItem>
            ))}
            {notCheckedIn.length === 0 && <p className="text-sm text-text-muted">Everyone's in! 🎉</p>}
          </Stagger>
        </Reveal>
      </div>
    </main>
  );
}
