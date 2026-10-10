import "server-only";
import { and, count, desc, eq, gte, sql, sum } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  users,
  memberProfiles,
  memberships,
  payments,
  attendance,
  announcements,
  trainerProfiles,
} from "@/lib/db/schema";

export async function getAdminDashboard(gymId: string) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    activeMembersRow,
    todaysAttendanceRow,
    monthlyRevenueRow,
    expiringRow,
    membershipMixRows,
    revenueTrendRows,
    attendanceByHourRows,
    recentPayments,
    recentMemberships,
    overduePayments,
  ] = await Promise.all([
    db
      .select({ n: count() })
      .from(memberProfiles)
      .innerJoin(users, eq(users.id, memberProfiles.userId))
      .innerJoin(
        memberships,
        and(eq(memberships.memberId, memberProfiles.userId), eq(memberships.status, "ACTIVE"))
      )
      .where(eq(users.gymId, gymId)),

    db
      .select({ n: count() })
      .from(attendance)
      .innerJoin(memberProfiles, eq(memberProfiles.userId, attendance.memberId))
      .innerJoin(users, eq(users.id, memberProfiles.userId))
      .where(and(eq(users.gymId, gymId), gte(attendance.checkInAt, todayStart))),

    db
      .select({ total: sum(payments.amountCents) })
      .from(payments)
      .innerJoin(memberProfiles, eq(memberProfiles.userId, payments.memberId))
      .innerJoin(users, eq(users.id, memberProfiles.userId))
      .where(
        and(
          eq(users.gymId, gymId),
          eq(payments.status, "PAID"),
          gte(payments.date, new Date(new Date().getFullYear(), new Date().getMonth(), 1))
        )
      ),

    db
      .select({ n: count() })
      .from(memberships)
      .innerJoin(memberProfiles, eq(memberProfiles.userId, memberships.memberId))
      .innerJoin(users, eq(users.id, memberProfiles.userId))
      .where(and(eq(users.gymId, gymId), eq(memberships.status, "EXPIRING"))),

    db
      .select({ status: memberships.status, n: count() })
      .from(memberships)
      .innerJoin(memberProfiles, eq(memberProfiles.userId, memberships.memberId))
      .innerJoin(users, eq(users.id, memberProfiles.userId))
      .where(eq(users.gymId, gymId))
      .groupBy(memberships.status),

    db
      .select({
        month: sql<string>`to_char(${payments.date}, 'Mon')`,
        total: sum(payments.amountCents),
      })
      .from(payments)
      .innerJoin(memberProfiles, eq(memberProfiles.userId, payments.memberId))
      .innerJoin(users, eq(users.id, memberProfiles.userId))
      .where(and(eq(users.gymId, gymId), eq(payments.status, "PAID"), gte(payments.date, sixMonthsAgo)))
      .groupBy(sql`to_char(${payments.date}, 'Mon'), date_trunc('month', ${payments.date})`)
      .orderBy(sql`date_trunc('month', ${payments.date})`),

    db
      .select({
        hour: sql<number>`extract(hour from ${attendance.checkInAt})::int`,
        n: count(),
      })
      .from(attendance)
      .innerJoin(memberProfiles, eq(memberProfiles.userId, attendance.memberId))
      .innerJoin(users, eq(users.id, memberProfiles.userId))
      .where(and(eq(users.gymId, gymId), gte(attendance.checkInAt, sql`now() - interval '30 days'`)))
      .groupBy(sql`extract(hour from ${attendance.checkInAt})`)
      .orderBy(sql`extract(hour from ${attendance.checkInAt})`),

    db.query.payments.findMany({
      where: (p, { inArray }) =>
        inArray(
          p.memberId,
          db.select({ id: memberProfiles.userId }).from(memberProfiles).innerJoin(users, eq(users.id, memberProfiles.userId)).where(eq(users.gymId, gymId))
        ),
      orderBy: (p, { desc }) => desc(p.date),
      limit: 5,
      with: { member: { with: { user: true } } },
    }),

    db.query.memberships.findMany({
      where: (m, { inArray }) =>
        inArray(
          m.memberId,
          db.select({ id: memberProfiles.userId }).from(memberProfiles).innerJoin(users, eq(users.id, memberProfiles.userId)).where(eq(users.gymId, gymId))
        ),
      orderBy: (m, { desc }) => desc(m.startDate),
      limit: 5,
      with: { member: { with: { user: true } } },
    }),

    db
      .select({ n: count() })
      .from(payments)
      .innerJoin(memberProfiles, eq(memberProfiles.userId, payments.memberId))
      .innerJoin(users, eq(users.id, memberProfiles.userId))
      .where(and(eq(users.gymId, gymId), eq(payments.status, "OVERDUE"))),
  ]);

  const totalMembersRow = await db
    .select({ n: count() })
    .from(users)
    .where(and(eq(users.gymId, gymId), eq(users.role, "MEMBER")));

  const HOUR_LABELS: Record<number, string> = {
    6: "6a", 8: "8a", 10: "10a", 12: "12p", 14: "2p", 16: "4p", 18: "6p", 20: "8p",
  };

  return {
    activeMembers: activeMembersRow[0]?.n ?? 0,
    totalMembers: totalMembersRow[0]?.n ?? 0,
    todaysAttendance: todaysAttendanceRow[0]?.n ?? 0,
    monthlyRevenueCents: Number(monthlyRevenueRow[0]?.total ?? 0),
    expiringSoon: expiringRow[0]?.n ?? 0,
    overdueCount: overduePayments[0]?.n ?? 0,
    membershipMix: membershipMixRows.map((r) => ({ status: r.status, n: r.n })),
    revenueTrend: revenueTrendRows.map((r) => ({ month: r.month, value: Number(r.total ?? 0) })),
    attendanceByHour: Object.entries(HOUR_LABELS).map(([h]) => {
      const row = attendanceByHourRows.find((r) => r.hour === Number(h));
      return { hour: HOUR_LABELS[Number(h)], value: row?.n ?? 0 };
    }),
    recentPayments,
    recentMemberships,
  };
}

export async function getMembers(gymId: string) {
  return db.query.users.findMany({
    where: (u, { eq, and }) => and(eq(u.gymId, gymId), eq(u.role, "MEMBER")),
    orderBy: (u, { desc }) => desc(u.createdAt),
    with: {
      memberProfile: {
        with: {
          memberships: { orderBy: (m, { desc }) => desc(m.startDate), limit: 1, with: { plan: true } },
          streak: true,
        },
      },
    },
  });
}

export async function getMemberDetail(gymId: string, userId: string) {
  const user = await db.query.users.findFirst({
    where: (u, { eq, and }) => and(eq(u.id, userId), eq(u.gymId, gymId)),
    with: {
      memberProfile: {
        with: {
          memberships: { orderBy: (m, { desc }) => desc(m.startDate), with: { plan: true } },
          payments: { orderBy: (p, { desc }) => desc(p.date) },
          attendance: { orderBy: (a, { desc }) => desc(a.checkInAt), limit: 20 },
          streak: true,
          bodyMetrics: { orderBy: (b, { desc }) => desc(b.date) },
          badges: { with: { badge: true } },
        },
      },
    },
  });
  if (!user?.memberProfile) return null;

  let trainer = null;
  if (user.memberProfile.trainerId) {
    trainer = await db.query.users.findFirst({ where: eq(users.id, user.memberProfile.trainerId) });
  }
  return { ...user, trainer };
}

export async function getPayments(gymId: string) {
  return db.query.payments.findMany({
    where: (p, { inArray }) =>
      inArray(
        p.memberId,
        db.select({ id: memberProfiles.userId }).from(memberProfiles).innerJoin(users, eq(users.id, memberProfiles.userId)).where(eq(users.gymId, gymId))
      ),
    orderBy: (p, { desc }) => desc(p.date),
    with: { member: { with: { user: true } } },
    limit: 100,
  });
}

export async function getAttendanceToday(gymId: string) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return db.query.attendance.findMany({
    where: (a, { inArray, gte, and }) =>
      and(
        gte(a.checkInAt, todayStart),
        inArray(
          a.memberId,
          db.select({ id: memberProfiles.userId }).from(memberProfiles).innerJoin(users, eq(users.id, memberProfiles.userId)).where(eq(users.gymId, gymId))
        )
      ),
    orderBy: (a, { desc }) => desc(a.checkInAt),
    with: { member: { with: { user: true } } },
  });
}

export async function getTrainers(gymId: string) {
  const rows = await db.query.users.findMany({
    where: (u, { eq, and }) => and(eq(u.gymId, gymId), eq(u.role, "TRAINER")),
    with: { trainerProfile: true },
  });
  const withCounts = await Promise.all(
    rows.map(async (t) => {
      const [{ n }] = await db.select({ n: count() }).from(memberProfiles).where(eq(memberProfiles.trainerId, t.id));
      return { ...t, memberCount: n };
    })
  );
  return withCounts;
}

export async function getAnnouncements(gymId: string) {
  return db.query.announcements.findMany({
    where: eq(announcements.gymId, gymId),
    orderBy: [desc(announcements.pinned), desc(announcements.createdAt)],
    with: { author: true },
  });
}

export async function getExercises(gymId: string) {
  return db.query.exercises.findMany({ where: (e, { eq }) => eq(e.gymId, gymId), orderBy: (e, { asc }) => asc(e.muscleGroup) });
}

export async function getAllWorkoutPlans(gymId: string) {
  return db.query.workoutPlans.findMany({
    where: (p, { inArray }) =>
      inArray(
        p.memberId,
        db.select({ id: memberProfiles.userId }).from(memberProfiles).innerJoin(users, eq(users.id, memberProfiles.userId)).where(eq(users.gymId, gymId))
      ),
    orderBy: (p, { desc }) => desc(p.createdAt),
    with: { member: { with: { user: true } }, trainer: true, days: { with: { items: true } } },
  });
}

export async function getMembershipPlans(gymId: string) {
  return db.query.membershipPlans.findMany({ where: (p, { eq }) => eq(p.gymId, gymId), orderBy: (p, { asc }) => asc(p.tier) });
}

export async function getReportsData(gymId: string) {
  const plans = await getMembershipPlans(gymId);
  const revenueByPlan = await Promise.all(
    plans.map(async (plan) => {
      const [{ total }] = await db
        .select({ total: sum(payments.amountCents) })
        .from(payments)
        .innerJoin(memberships, eq(memberships.id, payments.membershipId))
        .where(and(eq(memberships.planId, plan.id), eq(payments.status, "PAID")));
      return { name: plan.name, value: Number(total ?? 0) };
    })
  );

  const trainers = await getTrainers(gymId);
  const membersByTrainer = trainers.map((t) => ({ name: t.name.split(" ")[0], value: t.memberCount }));

  return { revenueByPlan, membersByTrainer };
}
