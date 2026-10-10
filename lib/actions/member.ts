"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  workoutLogs,
  streaks,
  memberBadges,
  badges,
  classBookings,
  gymClasses,
  bodyMetrics,
  challenges,
  challengeEntries,
} from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/current-user";
import { sendEmail } from "@/lib/notify/email";
import { sendPushToUsers } from "@/lib/notify/push";
import type { ActionState } from "./auth";

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}
function isYesterday(a: Date, b: Date) {
  const y = new Date(b);
  y.setDate(y.getDate() - 1);
  return a.toDateString() === y.toDateString();
}

async function awardBadge(memberId: string, code: string) {
  const badge = await db.query.badges.findFirst({ where: eq(badges.code, code) });
  if (!badge) return;
  const existing = await db.query.memberBadges.findFirst({
    where: and(eq(memberBadges.memberId, memberId), eq(memberBadges.badgeId, badge.id)),
  });
  if (!existing) await db.insert(memberBadges).values({ memberId, badgeId: badge.id });
}

const logWorkoutSchema = z.object({
  planDayId: z.string().optional(),
  durationMinutes: z.coerce.number().int().min(1).max(300).default(45),
  caloriesBurned: z.coerce.number().int().min(0).max(3000).default(400),
});

export async function logWorkout(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser("MEMBER");
  const parsed = logWorkoutSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Something went wrong logging that workout." };

  await db.insert(workoutLogs).values({
    memberId: user.id,
    planDayId: parsed.data.planDayId || null,
    durationMinutes: parsed.data.durationMinutes,
    caloriesBurned: parsed.data.caloriesBurned,
  });

  // ── streak bookkeeping ──────────────────────────────────────────────
  const now = new Date();
  const existingStreak = await db.query.streaks.findFirst({ where: eq(streaks.memberId, user.id) });
  let nextCurrent = 1;
  if (existingStreak?.lastActiveDate) {
    if (isSameDay(existingStreak.lastActiveDate, now)) nextCurrent = existingStreak.currentStreak;
    else if (isYesterday(existingStreak.lastActiveDate, now)) nextCurrent = existingStreak.currentStreak + 1;
  }
  const nextBest = Math.max(nextCurrent, existingStreak?.bestStreak ?? 0);

  if (existingStreak) {
    await db.update(streaks).set({ currentStreak: nextCurrent, bestStreak: nextBest, lastActiveDate: now }).where(eq(streaks.memberId, user.id));
  } else {
    await db.insert(streaks).values({ memberId: user.id, currentStreak: 1, bestStreak: 1, lastActiveDate: now });
  }

  // ── badges ───────────────────────────────────────────────────────────
  await awardBadge(user.id, "first_workout");
  if (nextCurrent >= 7) await awardBadge(user.id, "streak_7");
  if (nextCurrent >= 30) await awardBadge(user.id, "streak_30");
  if (now.getHours() < 7) await awardBadge(user.id, "early_bird");

  // ── active challenge score bump ─────────────────────────────────────
  const challenge = await db.query.challenges.findFirst({
    where: and(eq(challenges.gymId, user.gymId)),
    orderBy: (c, { desc }) => desc(c.startDate),
  });
  if (challenge && challenge.endDate >= now) {
    const entry = await db.query.challengeEntries.findFirst({
      where: and(eq(challengeEntries.challengeId, challenge.id), eq(challengeEntries.memberId, user.id)),
    });
    if (entry) {
      await db.update(challengeEntries).set({ score: entry.score + 10 }).where(and(eq(challengeEntries.challengeId, challenge.id), eq(challengeEntries.memberId, user.id)));
    } else {
      await db.insert(challengeEntries).values({ challengeId: challenge.id, memberId: user.id, score: 10 });
    }
  }

  revalidatePath("/member/dashboard");
  revalidatePath("/member/workouts");
  revalidatePath("/member/progress");
  revalidatePath("/member/community");
  return { error: undefined };
}

export async function bookClass(classId: string) {
  const user = await requireUser("MEMBER");
  const gymClass = await db.query.gymClasses.findFirst({ where: eq(gymClasses.id, classId), with: { bookings: true } });
  if (!gymClass) return;
  if (gymClass.bookings.filter((b) => b.status === "BOOKED").length >= gymClass.capacity) return;

  const existing = await db.query.classBookings.findFirst({ where: and(eq(classBookings.classId, classId), eq(classBookings.memberId, user.id)) });
  if (existing) {
    await db.update(classBookings).set({ status: "BOOKED" }).where(eq(classBookings.id, existing.id));
  } else {
    await db.insert(classBookings).values({ classId, memberId: user.id, status: "BOOKED" });
  }
  revalidatePath("/member/classes");

  const when = gymClass.startsAt.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  await sendEmail({
    to: user.email,
    subject: `You're booked: ${gymClass.title}`,
    html: `<p>Hi ${user.name.split(" ")[0]},</p><p>You're confirmed for <strong>${gymClass.title}</strong> on ${when}. See you there!</p>`,
    text: `Confirmed: ${gymClass.title} on ${when}.`,
    gymId: user.gymId,
    userId: user.id,
  });
  await sendPushToUsers([user.id], { title: "Class booked", body: `${gymClass.title} — ${when}`, url: "/member/classes" }, { gymId: user.gymId });
}

export async function cancelBooking(classId: string) {
  const user = await requireUser("MEMBER");
  await db
    .update(classBookings)
    .set({ status: "CANCELLED" })
    .where(and(eq(classBookings.classId, classId), eq(classBookings.memberId, user.id)));
  revalidatePath("/member/classes");
}

const bodyMetricSchema = z.object({ weightKg: z.coerce.number().min(20).max(400), bodyFatPct: z.coerce.number().min(0).max(70).optional() });

export async function logBodyMetric(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser("MEMBER");
  const parsed = bodyMetricSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid weight." };

  await db.insert(bodyMetrics).values({ memberId: user.id, weightKg: parsed.data.weightKg, bodyFatPct: parsed.data.bodyFatPct ?? null });
  revalidatePath("/member/progress");
  return { error: undefined };
}
