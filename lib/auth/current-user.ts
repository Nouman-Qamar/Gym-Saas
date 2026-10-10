import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, memberProfiles, trainerProfiles, gyms } from "@/lib/db/schema";
import { getSession } from "./session";
import type { Role } from "@/lib/theme";

// Cached per-request so every server component/action on the same request
// shares one DB round trip instead of re-fetching the user repeatedly.
export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;

  const row = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
    with: {
      memberProfile: true,
      trainerProfile: true,
    },
  });
  if (!row) return null;

  const gym = await db.query.gyms.findFirst({ where: eq(gyms.id, row.gymId) });

  return { ...row, gym };
});

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/** Use in server components/pages that require a signed-in user with a given role. */
export async function requireUser(role?: Role | Role[]) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.onboarded) redirect("/onboarding");

  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(user.role as Role)) {
      redirect(roleHome(user.role as Role));
    }
  }
  return user;
}

export function roleHome(role: Role) {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "TRAINER") return "/trainer/dashboard";
  return "/member/dashboard";
}

// Re-exported for convenience so callers don't need two imports.
export { memberProfiles, trainerProfiles };
