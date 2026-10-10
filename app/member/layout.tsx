import { PhoneFrame, MobileTabBar } from "@/components/ui/mobile-shell";
import { requireUser } from "@/lib/auth/current-user";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  await requireUser("MEMBER");

  return (
    <PhoneFrame>
      <div className="flex-1 overflow-y-auto">{children}</div>
      <MobileTabBar />
    </PhoneFrame>
  );
}
