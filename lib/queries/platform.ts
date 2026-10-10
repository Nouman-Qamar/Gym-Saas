import "server-only";
import { and, count, eq, sum } from "drizzle-orm";
import { db } from "@/lib/db";
import { gyms, users, memberProfiles, memberships, payments } from "@/lib/db/schema";

export async function getAllGymsSummary() {
  const allGyms = await db.query.gyms.findMany({ orderBy: (g, { desc }) => desc(g.createdAt) });

  return Promise.all(
    allGyms.map(async (gym) => {
      const [[{ n: memberCount }], [{ n: trainerCount }], [{ n: activeMembers }], [{ total }]] = await Promise.all([
        db.select({ n: count() }).from(users).where(and(eq(users.gymId, gym.id), eq(users.role, "MEMBER"))),
        db.select({ n: count() }).from(users).where(and(eq(users.gymId, gym.id), eq(users.role, "TRAINER"))),
        db
          .select({ n: count() })
          .from(memberProfiles)
          .innerJoin(users, eq(users.id, memberProfiles.userId))
          .innerJoin(memberships, and(eq(memberships.memberId, memberProfiles.userId), eq(memberships.status, "ACTIVE")))
          .where(eq(users.gymId, gym.id)),
        db
          .select({ total: sum(payments.amountCents) })
          .from(payments)
          .innerJoin(memberProfiles, eq(memberProfiles.userId, payments.memberId))
          .innerJoin(users, eq(users.id, memberProfiles.userId))
          .where(and(eq(users.gymId, gym.id), eq(payments.status, "PAID"))),
      ]);

      return {
        ...gym,
        memberCount,
        trainerCount,
        activeMembers,
        totalRevenueCents: Number(total ?? 0),
      };
    })
  );
}

export async function getPlatformTotals() {
  const summaries = await getAllGymsSummary();
  return {
    gymCount: summaries.length,
    totalMembers: summaries.reduce((s, g) => s + g.memberCount, 0),
    totalRevenueCents: summaries.reduce((s, g) => s + g.totalRevenueCents, 0),
  };
}

export async function getGymDetail(gymId: string) {
  const gym = await db.query.gyms.findFirst({ where: eq(gyms.id, gymId) });
  if (!gym) return null;

  const [admins, trainers, members, plans] = await Promise.all([
    db.query.users.findMany({ where: and(eq(users.gymId, gymId), eq(users.role, "ADMIN")) }),
    db.query.trainerProfiles.findMany({ with: { user: true } }).then((rows) => rows.filter((r) => r.user.gymId === gymId)),
    db.query.memberProfiles
      .findMany({ with: { user: true, memberships: { with: { plan: true } }, payments: true } })
      .then((rows) => rows.filter((r) => r.user.gymId === gymId)),
    db.query.membershipPlans.findMany({ where: (p, { eq }) => eq(p.gymId, gymId) }),
  ]);

  return { gym, admins, trainers, members, plans };
}
