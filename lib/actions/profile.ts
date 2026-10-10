"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireUser, roleHome } from "@/lib/auth/current-user";
import type { ActionState } from "./auth";

const onboardingSchema = z.object({
  gender: z.enum(["MALE", "FEMALE", "OTHER", "UNSPECIFIED"]),
  vibe: z.string().optional(),
});
const VALID_VIBES = ["EMBER", "BADDIE", "ELECTRIC"] as const;

export async function completeOnboarding(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = onboardingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please choose an option to continue." };

  const vibe = VALID_VIBES.includes(parsed.data.vibe as (typeof VALID_VIBES)[number])
    ? (parsed.data.vibe as (typeof VALID_VIBES)[number])
    : null;

  await db
    .update(users)
    .set({ gender: parsed.data.gender, themeOverride: vibe, onboarded: true })
    .where(eq(users.id, user.id));

  redirect(roleHome(user.role as "ADMIN" | "TRAINER" | "MEMBER"));
}

const vibeSchema = z.object({ vibe: z.string() });

export async function updateVibe(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = vibeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid selection." };
  const vibe = VALID_VIBES.includes(parsed.data.vibe as (typeof VALID_VIBES)[number])
    ? (parsed.data.vibe as (typeof VALID_VIBES)[number])
    : null;

  await db.update(users).set({ themeOverride: vibe }).where(eq(users.id, user.id));
  revalidatePath("/", "layout");
  return { error: undefined };
}

const genderSchema = z.object({ gender: z.enum(["MALE", "FEMALE", "OTHER", "UNSPECIFIED"]) });

export async function updateGender(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = genderSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid selection." };

  await db.update(users).set({ gender: parsed.data.gender }).where(eq(users.id, user.id));
  revalidatePath("/", "layout");
  return { error: undefined };
}

const profileSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  phone: z.string().optional(),
});

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await db
    .update(users)
    .set({ name: parsed.data.name, phone: parsed.data.phone || null })
    .where(eq(users.id, user.id));

  revalidatePath("/", "layout");
  return { error: undefined };
}
