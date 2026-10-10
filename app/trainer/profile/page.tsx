import { requireUser } from "@/lib/auth/current-user";
import { resolveVibe } from "@/lib/theme";
import { Card } from "@/components/ui/card";
import { ThemePicker } from "@/components/ui/theme-picker";
import { PushOptIn } from "@/components/ui/push-optin";
import { TrainerProfileForm, TrainerSpecialtyForm } from "./forms";

export default async function TrainerProfilePage() {
  const user = await requireUser("TRAINER");
  const vibe = resolveVibe(user.gender, user.themeOverride);

  return (
    <main className="px-6 md:px-10 py-8 max-w-[700px]">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Profile</h1>
        <p className="text-text-secondary text-sm mt-1">How members see you, and how the app feels for you.</p>
      </div>

      <div className="space-y-4">
        <Card>
          <h3 className="font-display text-lg font-semibold mb-4">Your details</h3>
          <TrainerProfileForm name={user.name} phone={user.phone} />
        </Card>

        <Card>
          <h3 className="font-display text-lg font-semibold mb-4">Coaching profile</h3>
          <TrainerSpecialtyForm specialty={user.trainerProfile?.specialty ?? null} bio={user.trainerProfile?.bio ?? null} />
        </Card>

        <Card>
          <h3 className="font-display text-lg font-semibold mb-1">App vibe</h3>
          <p className="text-text-muted text-xs mb-4">Changes instantly.</p>
          <ThemePicker current={vibe} />
        </Card>

        <PushOptIn />
      </div>
    </main>
  );
}
