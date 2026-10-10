import "server-only";
import { and, count, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { memberProfiles, users, gymClasses, workoutLogs, workoutPlans } from "@/lib/db/schema";

export async function getTrainerDashboard(trainerId: string) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [todaysClasses, myMembers] = await Promise.all([
    db.query.gymClasses.findMany({
      where: and(eq(gymClasses.trainerId, trainerId), gte(gymClasses.startsAt, todayStart), lte(gymClasses.startsAt, todayEnd)),
      orderBy: (c, { asc }) => asc(c.startsAt),
      with: { bookings: true },
    }),
    db.query.memberProfiles.findMany({
      where: eq(memberProfiles.trainerId, trainerId),
      with: { user: true, workoutLogs: { orderBy: (l, { desc }) => desc(l.completedAt), limit: 1 } },
    }),
  ]);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const needsAttention = myMembers
    .filter((m) => !m.workoutLogs[0] || m.workoutLogs[0].completedAt < sevenDaysAgo)
    .map((m) => ({
      name: m.user.name,
      note: m.workoutLogs[0]
        ? `Hasn't trained since ${m.workoutLogs[0].completedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
        : "Hasn't logged a workout yet",
    }))
    .slice(0, 5);

  const [{ n: plansCount }] = await db.select({ n: count() }).from(workoutPlans).where(eq(workoutPlans.trainerId, trainerId));

  return {
    todaysClasses,
    memberCount: myMembers.length,
    plansCount,
    needsAttention,
  };
}

export async function getTrainerMembers(trainerId: string) {
  return db.query.memberProfiles.findMany({
    where: eq(memberProfiles.trainerId, trainerId),
    with: {
      user: true,
      streak: true,
      workoutLogs: { orderBy: (l, { desc }) => desc(l.completedAt), limit: 1 },
      memberships: { orderBy: (m, { desc }) => desc(m.startDate), limit: 1, with: { plan: true } },
    },
  });
}

export async function getTrainerWorkoutPlans(trainerId: string) {
  return db.query.workoutPlans.findMany({
    where: eq(workoutPlans.trainerId, trainerId),
    orderBy: desc(workoutPlans.createdAt),
    with: { member: { with: { user: true } }, days: { with: { items: { with: { exercise: true } } } } },
  });
}

export async function getWorkoutPlanDetail(trainerId: string, planId: string) {
  const plan = await db.query.workoutPlans.findFirst({
    where: (p, { eq, and }) => and(eq(p.id, planId), eq(p.trainerId, trainerId)),
    with: {
      member: { with: { user: true } },
      days: { with: { items: { with: { exercise: true } } } },
    },
  });
  return plan ?? null;
}

export async function getTrainerMemberProgress(trainerId: string, memberId: string) {
  const member = await db.query.memberProfiles.findFirst({
    where: (m, { eq, and }) => and(eq(m.userId, memberId), eq(m.trainerId, trainerId)),
    with: {
      user: true,
      bodyMetrics: { orderBy: (b, { asc }) => asc(b.date) },
      workoutLogs: { orderBy: (l, { desc }) => desc(l.completedAt), limit: 10 },
      streak: true,
      badges: { with: { badge: true } },
    },
  });
  return member ?? null;
}

export async function getTrainerSchedule(trainerId: string) {
  return db.query.gymClasses.findMany({
    where: eq(gymClasses.trainerId, trainerId),
    orderBy: (c, { asc }) => asc(c.startsAt),
    with: { bookings: { with: { member: { with: { user: true } } } } },
  });
}
