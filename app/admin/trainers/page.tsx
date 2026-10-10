import { requireUser } from "@/lib/auth/current-user";
import { getTrainers } from "@/lib/queries/admin";
import { initials } from "@/lib/queries/shared";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { AddTrainerPanel } from "./add-trainer-panel";
import { Users } from "lucide-react";

export default async function TrainersPage() {
  const user = await requireUser("ADMIN");
  const trainers = await getTrainers(user.gymId);

  return (
    <main className="px-6 md:px-10 py-8 max-w-[1400px]">
      <Reveal className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Trainers</h1>
        <p className="text-text-secondary text-sm mt-1">{trainers.length} on staff</p>
      </Reveal>

      <AddTrainerPanel />

      <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {trainers.map((t) => (
          <StaggerItem key={t.id} className="rounded-[var(--radius-lg)] bg-surface border border-border-soft p-5 transition-shadow hover:shadow-[0_12px_28px_-14px_rgba(0,0,0,0.55)]">
            <div className="flex items-center gap-3 mb-3">
              <span className="h-11 w-11 rounded-full bg-accent-soft text-accent flex items-center justify-center text-sm font-semibold shrink-0">
                {initials(t.name)}
              </span>
              <div className="min-w-0">
                <p className="font-medium truncate">{t.name}</p>
                <p className="text-xs text-text-muted truncate">{t.trainerProfile?.specialty ?? "General trainer"}</p>
              </div>
            </div>
            <p className="text-xs text-text-secondary flex items-center gap-1.5">
              <Users size={13} /> {t.memberCount} assigned member{t.memberCount === 1 ? "" : "s"}
            </p>
          </StaggerItem>
        ))}
        {trainers.length === 0 && <p className="text-sm text-text-muted">No trainers yet — add your first one above.</p>}
      </Stagger>
    </main>
  );
}
