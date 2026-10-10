import "server-only";
import { and, count, desc, eq, gte, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  memberProfiles,
  workoutPlans,
  workoutLogs,
  gymClasses,
  classBookings,
  announcements,
  bodyMetrics,
  challenges,
  challengeEntries,
  users,
  payments,
} from "@/lib/db/schema";

export async function getMemberProfile(userId: string) {
  return db.query.memberProfiles.findFirst({
    where: eq(memberProfiles.userId, userId),
    with: {
      user: true,
      memberships: { orderBy: (m, { desc }) => desc(m.startDate), limit: 1, with: { plan: true } },
      streak: true,
      trainer: true,
    },
  });
}

export async function getActivePlan(userId: string) {
  return db.query.workoutPlans.findFirst({
    where: eq(workoutPlans.memberId, userId),
    orderBy: desc(workoutPlans.createdAt),
    with: { days: { with: { items: { with: { exercise: true } } } }, trainer: true },
  });
}

export async function getMemberDashboard(userId: string, gymId: string) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [profile, plan, todaysLogs, latestAnnouncement, duePayment] = await Promise.all([
    getMemberProfile(userId),
    getActivePlan(userId),
    db.query.workoutLogs.findMany({ where: and(eq(workoutLogs.memberId, userId), gte(workoutLogs.completedAt, todayStart)) }),
    db.query.announcements.findFirst({ where: eq(announcements.gymId, gymId), orderBy: [desc(announcements.pinned), desc(announcements.createdAt)] }),
    db.query.payments.findFirst({
      where: and(eq(payments.memberId, userId), inArray(payments.status, ["PENDING", "OVERDUE"])),
      orderBy: desc(payments.date),
    }),
  ]);

  const [{ n: totalLogs }] = await db.select({ n: count() }).from(workoutLogs).where(eq(workoutLogs.memberId, userId));
  const todaysDay = plan && plan.days.length > 0 ? plan.days[totalLogs % plan.days.length] : null;
  const alreadyDoneToday = todaysDay ? todaysLogs.some((l) => l.planDayId === todaysDay.id) : false;

  const todayStats = {
    calories: todaysLogs.reduce((s, l) => s + l.caloriesBurned, 0),
    exercises: todaysDay?.items.length ?? 0,
    minutes: todaysLogs.reduce((s, l) => s + l.durationMinutes, 0),
  };

  return { profile, plan, todaysDay, alreadyDoneToday, todayStats, latestAnnouncement, duePayment };
}

export async function getMemberWorkoutLogs(userId: string, limit = 30) {
  return db.query.workoutLogs.findMany({ where: eq(workoutLogs.memberId, userId), orderBy: desc(workoutLogs.completedAt), limit });
}

export async function getGymClasses(gymId: string, userId: string) {
  const classes = await db.query.gymClasses.findMany({
    where: and(eq(gymClasses.gymId, gymId), gte(gymClasses.startsAt, new Date())),
    orderBy: (c, { asc }) => asc(c.startsAt),
    with: { bookings: true, trainer: true },
  });
  const myBookings = await db.query.classBookings.findMany({ where: eq(classBookings.memberId, userId) });
  const bookedIds = new Set(myBookings.filter((b) => b.status === "BOOKED").map((b) => b.classId));
  return classes.map((c) => ({ ...c, isBooked: bookedIds.has(c.id) }));
}

export async function getMemberProgress(userId: string) {
  const [metrics, badges, streak] = await Promise.all([
    db.query.bodyMetrics.findMany({ where: eq(bodyMetrics.memberId, userId), orderBy: (b, { asc }) => asc(b.date) }),
    db.query.memberBadges.findMany({ where: (mb, { eq }) => eq(mb.memberId, userId), with: { badge: true } }),
    db.query.streaks.findFirst({ where: (s, { eq }) => eq(s.memberId, userId) }),
  ]);
  return { metrics, badges, streak };
}

export async function getActiveChallenge(gymId: string, userId: string) {
  const challenge = await db.query.challenges.findFirst({
    where: and(eq(challenges.gymId, gymId), gte(challenges.endDate, new Date())),
    orderBy: (c, { desc }) => desc(c.startDate),
  });
  if (!challenge) return null;

  const entries = await db.query.challengeEntries.findMany({
    where: eq(challengeEntries.challengeId, challenge.id),
    orderBy: (e, { desc }) => desc(e.score),
    with: { member: { with: { user: true } } },
  });

  const myRank = entries.findIndex((e) => e.memberId === userId) + 1;
  return { challenge, entries, myRank: myRank || null };
}

export async function getMemberTrainer(trainerId: string | null) {
  if (!trainerId) return null;
  return db.query.users.findFirst({ where: eq(users.id, trainerId) });
}
