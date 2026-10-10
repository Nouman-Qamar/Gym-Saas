"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { platformOwners } from "@/lib/db/schema";
import { verifyPassword } from "@/lib/auth/password";
import { createPlatformSession, clearPlatformSession } from "@/lib/auth/session";

export type ActionState = { error?: string } | undefined;

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export async function platformLogin(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { email, password } = parsed.data;

  const owner = await db.query.platformOwners.findFirst({ where: eq(platformOwners.email, email.toLowerCase()) });
  if (!owner || !(await verifyPassword(password, owner.passwordHash))) {
    return { error: "Incorrect email or password." };
  }

  await createPlatformSession({ ownerId: owner.id });
  redirect("/platform/dashboard");
}

export async function platformLogout() {
  await clearPlatformSession();
  redirect("/platform/login");
}
