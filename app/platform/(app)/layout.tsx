import { requirePlatformOwner } from "@/lib/auth/platform";
import { PlatformNav } from "./platform-nav";

export default async function PlatformAppLayout({ children }: { children: React.ReactNode }) {
  const owner = await requirePlatformOwner();

  return (
    <div className="min-h-screen">
      <PlatformNav ownerName={owner.name} />
      <div className="max-w-[1400px] mx-auto">{children}</div>
    </div>
  );
}
