import Link from "next/link";
import { eq } from "drizzle-orm";
import { CheckCircle2, XCircle } from "lucide-react";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { users, attendance } from "@/lib/db/schema";
import { initials } from "@/lib/queries/shared";

// Meant to be opened by a staff device (front desk phone/tablet, logged in
// as an Admin or Trainer) after scanning a member's personal QR code from
// their app. Any phone's stock camera app can scan + open this link — no
// custom in-app scanner needed.
export default async function StaffScanCheckinPage({ params }: { params: Promise<{ memberId: string }> }) {
  const staff = await requireUser(["ADMIN", "TRAINER"]);
  const { memberId } = await params;
  const backHref = staff.role === "ADMIN" ? "/admin/attendance" : "/trainer/dashboard";

  const member = await db.query.users.findFirst({ where: eq(users.id, memberId) });

  if (!member || member.gymId !== staff.gymId || member.role !== "MEMBER") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <XCircle size={48} className="text-danger" />
        <p className="font-display text-xl font-semibold">Not a valid check-in code</p>
        <Link href={backHref} className="text-accent text-sm font-medium hover:underline">
          Back
        </Link>
      </main>
    );
  }

  await db.insert(attendance).values({ memberId: member.id, method: "QR" });

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="h-16 w-16 rounded-full bg-mint-soft text-mint flex items-center justify-center text-xl font-bold">
        {initials(member.name)}
      </span>
      <CheckCircle2 size={32} className="text-mint" />
      <p className="font-display text-xl font-semibold">{member.name} checked in</p>
      <p className="text-text-muted text-sm">{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
      <Link
        href={backHref}
        className="mt-4 h-11 px-6 rounded-[var(--radius-md)] bg-accent text-white font-semibold text-sm flex items-center justify-center hover:bg-accent-strong"
      >
        Back
      </Link>
    </main>
  );
}
