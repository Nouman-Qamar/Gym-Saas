"use server";

import { z } from "zod";
import { eq, and, isNull, gt } from "drizzle-orm";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import { createId } from "@paralleldrive/cuid2";
import { db } from "@/lib/db";
import { gyms, users, memberProfiles, membershipPlans, memberships, referrals, passwordResetTokens } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, clearSession } from "@/lib/auth/session";
import { roleHome } from "@/lib/auth/current-user";
import { sendEmail } from "@/lib/notify/email";

export type ActionState = { error?: string } | undefined;

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

async function uniqueSlug(base: string) {
  const root = slugify(base) || "gym";
  let candidate = root;
  let i = 1;
  // Small tables, a loop here is totally fine.
  while (await db.query.gyms.findFirst({ where: eq(gyms.slug, candidate) })) {
    i += 1;
    candidate = `${root}-${i}`;
  }
  return candidate;
}

function referralCode(name: string) {
  const initials = name.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "FIT";
  return `${initials}-${createId().slice(0, 5).toUpperCase()}`;
}

const gymSignupSchema = z.object({
  gymName: z.string().min(2, "Gym name is too short"),
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function createGymAndAdmin(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = gymSignupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { gymName, name, email, password } = parsed.data;

  const existing = await db.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) });
  if (existing) return { error: "An account with that email already exists." };

  const slug = await uniqueSlug(gymName);
  const passwordHash = await hashPassword(password);

  const gymId = await db.transaction(async (tx) => {
    const [gym] = await tx.insert(gyms).values({ name: gymName, slug }).returning({ id: gyms.id });

    // Starter plan set every new gym gets out of the box — editable later in Settings.
    await tx.insert(membershipPlans).values([
      { gymId: gym.id, name: "Basic", tier: 1, priceCents: 300000, durationDays: 30 },
      { gymId: gym.id, name: "Premium", tier: 2, priceCents: 500000, durationDays: 30 },
      { gymId: gym.id, name: "VIP", tier: 3, priceCents: 900000, durationDays: 30 },
    ]);

    await tx.insert(users).values({
      gymId: gym.id,
      email: email.toLowerCase(),
      passwordHash,
      name,
      role: "ADMIN",
    });

    return gym.id;
  });

  const user = await db.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) });
  if (!user) return { error: "Something went wrong creating your account." };

  await sendEmail({
    to: user.email,
    subject: `Welcome to Ironline, ${name.split(" ")[0]}!`,
    html: `<p>Hi ${name.split(" ")[0]},</p><p><strong>${gymName}</strong> is live on Ironline. You're set up as the gym admin — log in anytime to manage members, payments, and more.</p>`,
    text: `Hi ${name.split(" ")[0]}, ${gymName} is live on Ironline. You're set up as the gym admin.`,
    gymId,
    userId: user.id,
  });

  await createSession({ userId: user.id, gymId, role: "ADMIN" });
  redirect("/onboarding");
}

const memberSignupSchema = z.object({
  gymCode: z.string().min(2, "Enter your gym's join code"),
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  referralCode: z.string().optional(),
});

export async function joinGymAsMember(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = memberSignupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { gymCode, name, email, password, referralCode: referredCode } = parsed.data;

  const gym = await db.query.gyms.findFirst({ where: eq(gyms.slug, slugify(gymCode)) });
  if (!gym) return { error: "We couldn't find a gym with that code. Double-check it with your gym." };

  const existing = await db.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) });
  if (existing) return { error: "An account with that email already exists." };

  const passwordHash = await hashPassword(password);
  let referredById: string | null = null;
  if (referredCode) {
    const referrer = await db.query.memberProfiles.findFirst({
      where: eq(memberProfiles.referralCode, referredCode.toUpperCase().trim()),
    });
    if (referrer) referredById = referrer.userId;
  }

  const userId = await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({ gymId: gym.id, email: email.toLowerCase(), passwordHash, name, role: "MEMBER" })
      .returning({ id: users.id });

    await tx.insert(memberProfiles).values({
      userId: user.id,
      referralCode: referralCode(name),
      referredById,
    });

    // Everyone starts on the Basic plan for 30 days — upgrade happens from Admin > Payments.
    const basicPlan = await tx.query.membershipPlans.findFirst({
      where: eq(membershipPlans.gymId, gym.id),
      orderBy: (p, { asc }) => asc(p.tier),
    });
    if (basicPlan) {
      const start = new Date();
      const end = new Date(start.getTime() + basicPlan.durationDays * 24 * 60 * 60 * 1000);
      await tx.insert(memberships).values({
        memberId: user.id,
        planId: basicPlan.id,
        startDate: start,
        endDate: end,
        status: "ACTIVE",
      });
    }

    return user.id;
  });

  if (referredById) {
    await db.insert(referrals).values({ referrerId: referredById, refereeEmail: email.toLowerCase(), status: "JOINED" });
  }

  await sendEmail({
    to: email.toLowerCase(),
    subject: `Welcome to ${gym.name}!`,
    html: `<p>Hi ${name.split(" ")[0]},</p><p>You're in — your ${gym.name} membership is active. Open Ironline anytime to book classes, log workouts, and track your progress.</p>`,
    text: `Hi ${name.split(" ")[0]}, you're in — your ${gym.name} membership is active.`,
    gymId: gym.id,
    userId,
  });

  await createSession({ userId, gymId: gym.id, role: "MEMBER" });
  redirect("/onboarding");
}

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { email, password } = parsed.data;

  const user = await db.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Incorrect email or password." };
  }

  await createSession({ userId: user.id, gymId: user.gymId, role: user.role });
  redirect(user.onboarded ? roleHome(user.role) : "/onboarding");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}

// ─────────────────────────── Forgot / reset password ───────────────────────────

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

const forgotPasswordSchema = z.object({ email: z.string().email("Enter a valid email") });

export type ForgotPasswordState = { error?: string; sent?: boolean } | undefined;

export async function requestPasswordReset(_prev: ForgotPasswordState, formData: FormData): Promise<ForgotPasswordState> {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const email = parsed.data.email.toLowerCase();

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });

  // Always report success either way — don't leak whether an email is registered.
  if (user) {
    const token = randomBytes(32).toString("hex");
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password/${token}`;
    await sendEmail({
      to: user.email,
      subject: "Reset your Ironline password",
      html: `<p>Hi ${user.name.split(" ")[0]},</p><p>Click below to set a new password. This link expires in 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Didn't request this? You can ignore this email.</p>`,
      text: `Reset your password: ${resetUrl} (expires in 1 hour)`,
      gymId: user.gymId,
      userId: user.id,
    });
  }

  return { sent: true };
}

const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type ResetPasswordState = { error?: string } | undefined;

export async function resetPassword(_prev: ResetPasswordState, formData: FormData): Promise<ResetPasswordState> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { token, password } = parsed.data;

  const record = await db.query.passwordResetTokens.findFirst({
    where: and(eq(passwordResetTokens.token, token), isNull(passwordResetTokens.usedAt), gt(passwordResetTokens.expiresAt, new Date())),
  });
  if (!record) return { error: "This reset link is invalid or has expired. Request a new one." };

  const passwordHash = await hashPassword(password);
  await db.transaction(async (tx) => {
    await tx.update(users).set({ passwordHash }).where(eq(users.id, record.userId));
    await tx.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, record.id));
  });

  redirect("/login?reset=success");
}
