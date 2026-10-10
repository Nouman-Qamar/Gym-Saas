import { Sidebar } from "@/components/ui/sidebar";
import { requireUser } from "@/lib/auth/current-user";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("ADMIN");

  return (
    <div className="flex">
      <Sidebar
        role="ADMIN"
        gymName={user.gym?.name ?? "Ironline"}
        roleLabel="Admin console"
        roleName={user.name}
        roleTag={`Owner · ${user.gym?.name ?? ""}`}
      />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
