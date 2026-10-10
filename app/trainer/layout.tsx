import { Sidebar } from "@/components/ui/sidebar";
import { requireUser } from "@/lib/auth/current-user";

export default async function TrainerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("TRAINER");

  return (
    <div className="flex">
      <Sidebar
        role="TRAINER"
        gymName={user.gym?.name ?? "Ironline"}
        roleLabel="Trainer"
        roleName={user.name}
        roleTag={user.trainerProfile?.specialty ?? "Trainer"}
      />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
