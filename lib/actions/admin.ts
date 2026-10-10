"use server";

import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createId } from "@paralleldrive/cuid2";
import { db } from "@/lib/db";
import {
  users,
  memberProfiles,
  trainerProfiles,
  memberships,
  payments,
  attendance,
  announcements,
  membershipPlans,
  exercises,
  gyms,
} from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/current-user";
import { hashPassword } from "@/lib/auth/password";
import { sendEmail } from "@/lib/notify/email";
import { sendSms } from "@/lib/notify/sms";
import { sendPushToUsers } from "@/lib/notify/push";
import { formatMoney } from "@/lib/queries/shared";
import type { ActionState } from "./auth";

function referralCode(name: string) {
  const initials = name.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "FIT";
  return `${initials}-${createId().slice(0, 5).toUpperCase()}`;
}

const addMemberSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  planId: z.string().min(1),
  trainerId: z.string().optional(),
  goal: z.string().optional(),
});

export async function addMember(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireUser("ADMIN");
  const parsed = addMemberSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { name, email, planId, trainerId, goal } = parsed.data;

  const existing = await db.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) });
  if (existing) return { error: "A user with that email already exists." };

  const plan = await db.query.membershipPlans.findFirst({ where: eq(membershipPlans.id, planId) });
  if (!plan) return { error: "Choose a valid membership plan." };

  const passwordHash = await hashPassword("welcome123"); // shown to the admin below; member should change it after first login

  await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({ gymId: admin.gymId, email: email.toLowerCase(), passwordHash, name, role: "MEMBER" })
      .returning();

    await tx.insert(memberProfiles).values({
      userId: user.id,
      trainerId: trainerId || null,
      goal: goal || null,
      referralCode: referralCode(name),
    });

    const start = new Date();
    const end = new Date(start.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
    const [membership] = await tx
      .insert(memberships)
      .values({ memberId: user.id, planId: plan.id, startDate: start, endDate: end, status: "ACTIVE" })
      .returning();

    await tx.insert(payments).values({
      memberId: user.id,
      membershipId: membership.id,
      amountCents: plan.priceCents,
      status: "PENDING",
      method: "Card",
    });
  });

  revalidatePath("/admin/members");
  revalidatePath("/admin/dashboard");
  return { error: undefined };
}

const addTrainerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  specialty: z.string().optional(),
});

export async function addTrainer(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireUser("ADMIN");
  const parsed = addTrainerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { name, email, specialty } = parsed.data;

  const existing = await db.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) });
  if (existing) return { error: "A user with that email already exists." };

  const passwordHash = await hashPassword("welcome123");
  await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({ gymId: admin.gymId, email: email.toLowerCase(), passwordHash, name, role: "TRAINER" })
      .returning();
    await tx.insert(trainerProfiles).values({ userId: user.id, specialty: specialty || null });
  });

  revalidatePath("/admin/trainers");
  return { error: undefined };
}

export async function markPaymentPaid(paymentId: string) {
  await requireUser("ADMIN");
  await db.update(payments).set({ status: "PAID", date: new Date() }).where(eq(payments.id, paymentId));
  revalidatePath("/admin/payments");
  revalidatePath("/admin/dashboard");
}

export async function sendPaymentReminder(paymentId: string) {
  const admin = await requireUser("ADMIN");
  const payment = await db.query.payments.findFirst({
    where: eq(payments.id, paymentId),
    with: { member: { with: { user: true } } },
  });
  if (!payment || payment.member.user.gymId !== admin.gymId) return;

  const gym = await db.query.gyms.findFirst({ where: eq(gyms.id, admin.gymId) });
  const amount = formatMoney(payment.amountCents);
  const gymName = gym?.name ?? "your gym";

  await sendEmail({
    to: payment.member.user.email,
    subject: `Payment reminder — ${amount} due at ${gymName}`,
    html: `<p>Hi ${payment.member.user.name.split(" ")[0]},</p><p>This is a friendly reminder that ${amount} is ${payment.status === "OVERDUE" ? "overdue" : "due"} for your membership at ${gymName}. You can pay online from your Ironline app, or in person at the front desk.</p>`,
    text: `Reminder: ${amount} is ${payment.status === "OVERDUE" ? "overdue" : "due"} for your membership at ${gymName}.`,
    gymId: admin.gymId,
    userId: payment.member.user.id,
  });

  if (payment.member.user.phone) {
    await sendSms({
      to: payment.member.user.phone,
      body: `${gymName}: ${amount} is ${payment.status === "OVERDUE" ? "overdue" : "due"} for your membership. Pay via the Ironline app or at the front desk.`,
      gymId: admin.gymId,
      userId: payment.member.user.id,
    });
  }

  await sendPushToUsers(
    [payment.member.user.id],
    { title: "Payment reminder", body: `${amount} is ${payment.status === "OVERDUE" ? "overdue" : "due"} at ${gymName}.`, url: "/member/dashboard" },
    { gymId: admin.gymId }
  );

  revalidatePath("/admin/payments");
}

export async function manualCheckIn(memberId: string) {
  await requireUser(["ADMIN", "TRAINER"]);
  await db.insert(attendance).values({ memberId, method: "FRONT_DESK" });
  revalidatePath("/admin/attendance");
  revalidatePath("/admin/dashboard");
}

const announcementSchema = z.object({
  title: z.string().min(2),
  body: z.string().min(2),
  pinned: z.string().optional(),
});

export async function createAnnouncement(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser(["ADMIN", "TRAINER"]);
  const parsed = announcementSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Fill in a title and message." };

  await db.insert(announcements).values({
    gymId: user.gymId,
    authorId: user.id,
    title: parsed.data.title,
    body: parsed.data.body,
    pinned: parsed.data.pinned === "on",
  });

  revalidatePath("/admin/announcements");
  revalidatePath("/member/dashboard");

  const gymMembers = await db.query.users.findMany({
    where: and(eq(users.gymId, user.gymId), eq(users.role, "MEMBER")),
    columns: { id: true },
  });
  await sendPushToUsers(
    gymMembers.map((m) => m.id),
    { title: parsed.data.title, body: parsed.data.body, url: "/member/dashboard" },
    { gymId: user.gymId }
  );

  return { error: undefined };
}

export async function deleteAnnouncement(id: string) {
  await requireUser(["ADMIN", "TRAINER"]);
  await db.delete(announcements).where(eq(announcements.id, id));
  revalidatePath("/admin/announcements");
}

export async function updateMembershipStatus(membershipId: string, status: "ACTIVE" | "FROZEN" | "EXPIRED" | "EXPIRING") {
  await requireUser("ADMIN");
  await db.update(memberships).set({ status }).where(eq(memberships.id, membershipId));
  revalidatePath("/admin/members");
  revalidatePath("/admin/dashboard");
}

export async function assignTrainer(memberId: string, trainerId: string) {
  await requireUser("ADMIN");
  await db.update(memberProfiles).set({ trainerId: trainerId || null }).where(eq(memberProfiles.userId, memberId));
  revalidatePath("/admin/members");
}

const exerciseSchema = z.object({
  name: z.string().min(2),
  muscleGroup: z.string().min(2),
  equipment: z.string().optional(),
});

const gymSchema = z.object({
  name: z.string().min(2),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export async function updateGym(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser("ADMIN");
  const parsed = gymSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a gym name." };

  await db
    .update(gyms)
    .set({ name: parsed.data.name, address: parsed.data.address || null, phone: parsed.data.phone || null })
    .where(eq(gyms.id, user.gymId));

  revalidatePath("/", "layout");
  return { error: undefined };
}

const planPriceSchema = z.object({ planId: z.string(), priceCents: z.coerce.number().int().positive() });

export async function updatePlanPrice(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser("ADMIN");
  const parsed = planPriceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid price." };

  await db.update(membershipPlans).set({ priceCents: parsed.data.priceCents }).where(eq(membershipPlans.id, parsed.data.planId));
  revalidatePath("/admin/settings");
  return { error: undefined };
}

export async function addExercise(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser(["ADMIN", "TRAINER"]);
  const parsed = exerciseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Fill in an exercise name and muscle group." };

  await db.insert(exercises).values({
    gymId: user.gymId,
    name: parsed.data.name,
    muscleGroup: parsed.data.muscleGroup,
    equipment: parsed.data.equipment || null,
  });

  revalidatePath("/admin/workouts");
  revalidatePath("/trainer/workouts");
  return { error: undefined };
}
