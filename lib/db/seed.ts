// Demo data so the product is explorable the second it's running.
// Run with: npm run db:seed
import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "./index";
import {
  gyms,
  users,
  memberProfiles,
  trainerProfiles,
  membershipPlans,
  memberships,
  payments,
  attendance,
  exercises,
  workoutPlans,
  workoutPlanDays,
  workoutExercises,
  workoutLogs,
  gymClasses,
  classBookings,
  announcements,
  bodyMetrics,
  streaks,
  badges,
  memberBadges,
  challenges,
  challengeEntries,
  messages,
  referrals,
  platformOwners,
} from "./schema";
import { hashPassword } from "../auth/password";
import { createId } from "@paralleldrive/cuid2";

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY);
const daysFromNow = (n: number) => new Date(Date.now() + n * DAY);
// Peak-ish gym hours — matches the fixed buckets the admin dashboard's
// "attendance by hour" chart displays, so seeded check-ins actually show up.
const PEAK_HOURS = [6, 8, 10, 12, 14, 16, 18, 20];
function atHour(daysOffset: number, hour: number) {
  const d = daysAgo(daysOffset);
  d.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
  return d;
}
function monthsAgo(n: number, dayOfMonth?: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  if (dayOfMonth) d.setDate(Math.min(dayOfMonth, 27));
  return d;
}
const referralCode = (name: string) =>
  `${name.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "FIT"}-${createId().slice(0, 5).toUpperCase()}`;

async function main() {
  console.log("Seeding demo data…");
  const passwordHash = await hashPassword("demopass123");

  const [gym] = await db
    .insert(gyms)
    .values({ name: "Ironline Demo Gym", slug: "demo-gym", address: "12 Boulevard Road, Lahore", phone: "+92 300 1234567" })
    .returning();

  const [basic, premium, vip] = await db
    .insert(membershipPlans)
    .values([
      { gymId: gym.id, name: "Basic", tier: 1, priceCents: 300000, durationDays: 30 },
      { gymId: gym.id, name: "Premium", tier: 2, priceCents: 500000, durationDays: 30 },
      { gymId: gym.id, name: "VIP", tier: 3, priceCents: 900000, durationDays: 30 },
    ])
    .returning();

  // ── Staff ──────────────────────────────────────────────────────────────
  const [admin] = await db
    .insert(users)
    .values({
      gymId: gym.id,
      email: "admin@demo.gym",
      passwordHash,
      name: "Ayesha Malik",
      role: "ADMIN",
      gender: "FEMALE",
      onboarded: true,
    })
    .returning();

  const [trainer] = await db
    .insert(users)
    .values({
      gymId: gym.id,
      email: "trainer@demo.gym",
      passwordHash,
      name: "Ahmed Sheikh",
      role: "TRAINER",
      gender: "MALE",
      onboarded: true,
    })
    .returning();
  await db.insert(trainerProfiles).values({
    userId: trainer.id,
    specialty: "Strength & Conditioning",
    bio: "10 years coaching powerlifting and athletic performance.",
  });

  const [trainer2] = await db
    .insert(users)
    .values({
      gymId: gym.id,
      email: "sana.trainer@demo.gym",
      passwordHash,
      name: "Sana Bilal",
      role: "TRAINER",
      gender: "FEMALE",
      onboarded: true,
    })
    .returning();
  await db.insert(trainerProfiles).values({
    userId: trainer2.id,
    specialty: "HIIT & Fat Loss",
    bio: "Group fitness coach and certified nutrition specialist.",
  });

  // ── Members ────────────────────────────────────────────────────────────
  const memberSeed: {
    name: string;
    email: string;
    gender: "MALE" | "FEMALE" | "OTHER";
    trainerId: string;
    plan: typeof basic;
    status: "ACTIVE" | "EXPIRING" | "EXPIRED" | "FROZEN";
    goal: string;
  }[] = [
    { name: "Rafay Malik", email: "member@demo.gym", gender: "MALE", trainerId: trainer.id, plan: premium, status: "ACTIVE", goal: "Build muscle" },
    { name: "Sara Iqbal", email: "sara@demo.gym", gender: "FEMALE", trainerId: trainer2.id, plan: vip, status: "ACTIVE", goal: "Tone & sculpt" },
    { name: "Bilal Ahmed", email: "bilal@demo.gym", gender: "MALE", trainerId: trainer.id, plan: basic, status: "ACTIVE", goal: "Athletic performance" },
    { name: "Hina Yousaf", email: "hina@demo.gym", gender: "FEMALE", trainerId: trainer2.id, plan: premium, status: "EXPIRING", goal: "Fat loss" },
    { name: "Zain Abbas", email: "zain@demo.gym", gender: "MALE", trainerId: trainer.id, plan: basic, status: "ACTIVE", goal: "Strength" },
    { name: "Ali Raza", email: "ali@demo.gym", gender: "MALE", trainerId: trainer.id, plan: basic, status: "ACTIVE", goal: "General fitness" },
    { name: "Usman Tariq", email: "usman@demo.gym", gender: "MALE", trainerId: trainer2.id, plan: premium, status: "EXPIRED", goal: "Weight loss" },
    { name: "Mahnoor Khan", email: "mahnoor@demo.gym", gender: "FEMALE", trainerId: trainer2.id, plan: vip, status: "ACTIVE", goal: "Bikini prep" },
  ];

  const memberRows: { userId: string; name: string; goal: string; trainerId: string }[] = [];

  for (const m of memberSeed) {
    const [user] = await db
      .insert(users)
      .values({ gymId: gym.id, email: m.email, passwordHash, name: m.name, role: "MEMBER", gender: m.gender, onboarded: true })
      .returning();

    await db.insert(memberProfiles).values({
      userId: user.id,
      trainerId: m.trainerId,
      goal: m.goal,
      heightCm: 160 + Math.random() * 30,
      referralCode: referralCode(m.name),
    });

    const start = daysAgo(20);
    const end =
      m.status === "EXPIRED" ? daysAgo(2) : m.status === "EXPIRING" ? daysFromNow(3) : daysFromNow(25);

    const [membership] = await db
      .insert(memberships)
      .values({ memberId: user.id, planId: m.plan.id, startDate: start, endDate: end, status: m.status })
      .returning();

    // A few months of renewal payments so the revenue trend chart has a
    // real shape and "this month" isn't empty — most recent renewal lands
    // in the current month for everyone except the deliberately overdue member.
    const monthsBack = m.status === "EXPIRED" ? 5 : 4 + Math.floor(Math.random() * 2);
    for (let mo = monthsBack; mo >= 0; mo--) {
      const isLatest = mo === 0;
      await db.insert(payments).values({
        memberId: user.id,
        membershipId: isLatest ? membership.id : null,
        amountCents: m.plan.priceCents,
        status: isLatest && m.status === "EXPIRED" ? "OVERDUE" : "PAID",
        method: Math.random() > 0.5 ? "Card" : "Cash",
        date: monthsAgo(mo, 3 + Math.floor(Math.random() * 20)),
      });
    }

    // Attendance over the last 2 weeks, skipping some days at random, at
    // gym-peak hours so the "attendance by hour" chart has real bars.
    for (let d = 0; d < 14; d++) {
      if (Math.random() > 0.45) {
        const hour = PEAK_HOURS[Math.floor(Math.random() * PEAK_HOURS.length)];
        await db.insert(attendance).values({ memberId: user.id, checkInAt: atHour(d, hour), method: Math.random() > 0.3 ? "QR" : "MANUAL" });
      }
    }

    await db.insert(streaks).values({
      memberId: user.id,
      currentStreak: Math.floor(Math.random() * 10) + 1,
      bestStreak: Math.floor(Math.random() * 20) + 5,
      lastActiveDate: daysAgo(0),
    });

    memberRows.push({ userId: user.id, name: m.name, goal: m.goal, trainerId: m.trainerId });
  }

  const rafay = memberRows[0];

  // Give Rafay the signature 18-day streak the original design showed off.
  await db
    .update(streaks)
    .set({ currentStreak: 18, bestStreak: 21, lastActiveDate: new Date() })
    .where(eq(streaks.memberId, rafay.userId));

  // ── Exercise library ──────────────────────────────────────────────────
  const exerciseList = [
    ["Bench Press", "Chest", "Barbell"],
    ["Incline Dumbbell Press", "Chest", "Dumbbell"],
    ["Tricep Pushdown", "Triceps", "Cable"],
    ["Overhead Tricep Extension", "Triceps", "Dumbbell"],
    ["Barbell Squat", "Legs", "Barbell"],
    ["Leg Press", "Legs", "Machine"],
    ["Romanian Deadlift", "Hamstrings", "Barbell"],
    ["Deadlift", "Back", "Barbell"],
    ["Lat Pulldown", "Back", "Cable"],
    ["Barbell Row", "Back", "Barbell"],
    ["Overhead Press", "Shoulders", "Barbell"],
    ["Lateral Raise", "Shoulders", "Dumbbell"],
    ["Bicep Curl", "Biceps", "Dumbbell"],
    ["Plank", "Core", "Bodyweight"],
    ["Russian Twist", "Core", "Bodyweight"],
    ["Treadmill Run", "Cardio", null],
    ["Rowing Machine", "Cardio", "Machine"],
  ] as const;

  const exerciseRows = await db
    .insert(exercises)
    .values(exerciseList.map(([name, muscleGroup, equipment]) => ({ gymId: gym.id, name, muscleGroup, equipment })))
    .returning();
  const ex = (name: string) => exerciseRows.find((e) => e.name === name)!.id;

  // ── Workout plan for Rafay ────────────────────────────────────────────
  const [plan] = await db
    .insert(workoutPlans)
    .values({ trainerId: trainer.id, memberId: rafay.userId, title: "Push / Pull / Legs — Hypertrophy", goal: "Build muscle" })
    .returning();

  const [day1] = await db.insert(workoutPlanDays).values({ planId: plan.id, dayLabel: "Day 1 — Chest & Triceps", order: 0 }).returning();
  const [day2] = await db.insert(workoutPlanDays).values({ planId: plan.id, dayLabel: "Day 2 — Back & Biceps", order: 1 }).returning();
  const [day3] = await db.insert(workoutPlanDays).values({ planId: plan.id, dayLabel: "Day 3 — Legs & Core", order: 2 }).returning();

  await db.insert(workoutExercises).values([
    { dayId: day1.id, exerciseId: ex("Bench Press"), sets: 4, reps: "8-10", order: 0 },
    { dayId: day1.id, exerciseId: ex("Incline Dumbbell Press"), sets: 3, reps: "10-12", order: 1 },
    { dayId: day1.id, exerciseId: ex("Tricep Pushdown"), sets: 3, reps: "12-15", order: 2 },
    { dayId: day1.id, exerciseId: ex("Overhead Tricep Extension"), sets: 3, reps: "12", order: 3 },

    { dayId: day2.id, exerciseId: ex("Deadlift"), sets: 4, reps: "6-8", order: 0 },
    { dayId: day2.id, exerciseId: ex("Lat Pulldown"), sets: 3, reps: "10-12", order: 1 },
    { dayId: day2.id, exerciseId: ex("Barbell Row"), sets: 3, reps: "10", order: 2 },
    { dayId: day2.id, exerciseId: ex("Bicep Curl"), sets: 3, reps: "12", order: 3 },

    { dayId: day3.id, exerciseId: ex("Barbell Squat"), sets: 4, reps: "8", order: 0 },
    { dayId: day3.id, exerciseId: ex("Leg Press"), sets: 3, reps: "12", order: 1 },
    { dayId: day3.id, exerciseId: ex("Romanian Deadlift"), sets: 3, reps: "10", order: 2 },
    { dayId: day3.id, exerciseId: ex("Plank"), sets: 3, reps: "60s", order: 3 },
  ]);

  // 18 consecutive days of logs to back the streak visually + power charts.
  for (let d = 0; d < 18; d++) {
    await db.insert(workoutLogs).values({
      memberId: rafay.userId,
      planDayId: [day1.id, day2.id, day3.id][d % 3],
      completedAt: daysAgo(d),
      caloriesBurned: 350 + Math.floor(Math.random() * 150),
      durationMinutes: 35 + Math.floor(Math.random() * 20),
    });
  }

  // ── Body metrics (progress chart) ─────────────────────────────────────
  let weight = 84;
  for (let w = 10; w >= 0; w--) {
    weight -= Math.random() * 0.5;
    await db.insert(bodyMetrics).values({ memberId: rafay.userId, date: daysAgo(w * 7), weightKg: Math.round(weight * 10) / 10, bodyFatPct: 18 - (10 - w) * 0.3 });
  }

  // ── Classes ────────────────────────────────────────────────────────────
  const classRows = await db
    .insert(gymClasses)
    .values([
      { gymId: gym.id, trainerId: trainer2.id, title: "Group HIIT", type: "HIIT · High intensity", startsAt: daysFromNow(1), durationMinutes: 45, capacity: 16 },
      { gymId: gym.id, trainerId: trainer2.id, title: "Sunrise Yoga Flow", type: "Yoga · Recovery", startsAt: daysFromNow(2), durationMinutes: 50, capacity: 20 },
      { gymId: gym.id, trainerId: trainer.id, title: "Powerlifting Fundamentals", type: "Strength · Coached", startsAt: daysFromNow(3), durationMinutes: 60, capacity: 10 },
      { gymId: gym.id, trainerId: trainer2.id, title: "Spin Class", type: "Cardio · Studio", startsAt: daysFromNow(4), durationMinutes: 40, capacity: 18 },
    ])
    .returning();

  await db.insert(classBookings).values([
    { classId: classRows[0].id, memberId: rafay.userId, status: "BOOKED" },
    { classId: classRows[0].id, memberId: memberRows[1].userId, status: "BOOKED" },
    { classId: classRows[1].id, memberId: memberRows[3].userId, status: "BOOKED" },
    { classId: classRows[3].id, memberId: memberRows[2].userId, status: "BOOKED" },
  ]);

  // ── Announcements ─────────────────────────────────────────────────────
  await db.insert(announcements).values([
    {
      gymId: gym.id,
      authorId: admin.id,
      title: "New squat rack section now open! 🎉",
      body: "We've doubled our free-weight area — come check out the new platforms and bumper plates.",
      pinned: true,
    },
    {
      gymId: gym.id,
      authorId: admin.id,
      title: "Public holiday hours",
      body: "We'll be open 8am–2pm this Sunday for the public holiday. Normal hours resume Monday.",
    },
    {
      gymId: gym.id,
      authorId: trainer2.id,
      title: "September push-up challenge is live",
      body: "Log your daily push-ups in the Community tab and climb the leaderboard for a free PT session.",
    },
  ]);

  // ── Badges + gamification ─────────────────────────────────────────────
  const badgeRows = await db
    .insert(badges)
    .values([
      { code: "first_workout", name: "First Rep", description: "Logged your first workout", icon: "🏁" },
      { code: "streak_7", name: "Week Warrior", description: "7-day workout streak", icon: "🔥" },
      { code: "streak_30", name: "Unstoppable", description: "30-day workout streak", icon: "🚀" },
      { code: "early_bird", name: "Early Bird", description: "Checked in before 7am", icon: "🌅" },
      { code: "class_regular", name: "Class Regular", description: "Booked 5 classes", icon: "🤸" },
      { code: "referral_star", name: "Referral Star", description: "Referred a friend who joined", icon: "⭐" },
    ])
    .returning();
  const badge = (code: string) => badgeRows.find((b) => b.code === code)!.id;

  await db.insert(memberBadges).values([
    { memberId: rafay.userId, badgeId: badge("first_workout") },
    { memberId: rafay.userId, badgeId: badge("streak_7") },
    { memberId: rafay.userId, badgeId: badge("early_bird") },
    { memberId: memberRows[1].userId, badgeId: badge("first_workout") },
    { memberId: memberRows[1].userId, badgeId: badge("class_regular") },
  ]);

  // ── Challenge / leaderboard ────────────────────────────────────────────
  const [challenge] = await db
    .insert(challenges)
    .values({
      gymId: gym.id,
      title: "September Push-Up Challenge",
      description: "Most total push-ups logged this month wins a free PT session.",
      metric: "workouts",
      startDate: daysAgo(1),
      endDate: daysFromNow(29),
    })
    .returning();

  await db.insert(challengeEntries).values(
    memberRows.map((m, i) => ({ challengeId: challenge.id, memberId: m.userId, score: Math.floor(Math.random() * 400) + (i === 0 ? 300 : 0) }))
  );

  // ── Messages ───────────────────────────────────────────────────────────
  await db.insert(messages).values([
    { gymId: gym.id, senderId: trainer.id, receiverId: rafay.userId, body: "Great session today — bump your bench weight next time 💪" },
    { gymId: gym.id, senderId: rafay.userId, receiverId: trainer.id, body: "Sounds good, see you Thursday!" },
  ]);

  // ── Referral ───────────────────────────────────────────────────────────
  await db.insert(referrals).values([{ referrerId: rafay.userId, refereeEmail: "friend@example.com", status: "PENDING" }]);

  // ── Platform owner (multi-gym SaaS console) ───────────────────────────
  // Separate identity track from gym users — not tied to any single gym's
  // `users` row, see lib/auth/session.ts. Only one demo gym exists yet, but
  // the console is built to list every gym on the platform as more sign up.
  await db.insert(platformOwners).values({
    email: "owner@ironline.app",
    passwordHash,
    name: "Ironline HQ",
  });

  console.log("✅ Seed complete.");
  console.log("   Admin:   admin@demo.gym      / demopass123");
  console.log("   Trainer: trainer@demo.gym    / demopass123");
  console.log("   Member:  member@demo.gym     / demopass123");
  console.log("   Platform owner (all-gyms console, at /platform/login):");
  console.log("            owner@ironline.app  / demopass123");
  console.log(`   Join code for new member signups: ${gym.slug}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
