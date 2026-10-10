// Ironline — full data model for a multi-tenant gym SaaS, in Drizzle ORM.
// Edit this file, then run `npm run db:generate && npm run db:migrate`.

import { createId } from "@paralleldrive/cuid2";
import {
  pgTable,
  pgEnum,
  text,
  integer,
  boolean,
  timestamp,
  real,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

const id = () => text("id").primaryKey().$defaultFn(() => createId());
const now = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

// ─────────────────────────── Enums ───────────────────────────

export const roleEnum = pgEnum("role", ["ADMIN", "TRAINER", "MEMBER"]);
export const genderEnum = pgEnum("gender", ["MALE", "FEMALE", "OTHER", "UNSPECIFIED"]);
export const themeVibeEnum = pgEnum("theme_vibe", ["EMBER", "BADDIE", "ELECTRIC"]);
export const membershipStatusEnum = pgEnum("membership_status", ["ACTIVE", "EXPIRING", "EXPIRED", "FROZEN"]);
export const paymentStatusEnum = pgEnum("payment_status", ["PAID", "PENDING", "OVERDUE", "REFUNDED"]);
export const attendanceMethodEnum = pgEnum("attendance_method", ["QR", "MANUAL", "FRONT_DESK"]);
export const bookingStatusEnum = pgEnum("booking_status", ["BOOKED", "ATTENDED", "CANCELLED", "NO_SHOW"]);
export const referralStatusEnum = pgEnum("referral_status", ["PENDING", "JOINED", "REWARDED"]);
export const notificationChannelEnum = pgEnum("notification_channel", ["EMAIL", "SMS", "PUSH"]);

// ─────────────────────────── Core / identity ───────────────────────────

export const gyms = pgTable("gyms", {
  id: id(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  address: text("address"),
  phone: text("phone"),
  createdAt: now(),
});

export const users = pgTable(
  "users",
  {
    id: id(),
    gymId: text("gym_id").notNull().references(() => gyms.id, { onDelete: "cascade" }),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    role: roleEnum("role").notNull().default("MEMBER"),
    gender: genderEnum("gender").notNull().default("UNSPECIFIED"),
    themeOverride: themeVibeEnum("theme_override"),
    avatarUrl: text("avatar_url"),
    phone: text("phone"),
    onboarded: boolean("onboarded").notNull().default(false),
    createdAt: now(),
  },
  (t) => [index("users_gym_role_idx").on(t.gymId, t.role)]
);

export const trainerProfiles = pgTable("trainer_profiles", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  specialty: text("specialty"),
  bio: text("bio"),
});

export const memberProfiles = pgTable("member_profiles", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  trainerId: text("trainer_id"),
  joinDate: timestamp("join_date", { withTimezone: true }).notNull().defaultNow(),
  heightCm: real("height_cm"),
  goal: text("goal"),
  referralCode: text("referral_code").notNull().unique(),
  referredById: text("referred_by_id"),
});

// ─────────────────────────── Memberships & billing ───────────────────────────

export const membershipPlans = pgTable("membership_plans", {
  id: id(),
  gymId: text("gym_id").notNull().references(() => gyms.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  tier: integer("tier").notNull().default(1),
  priceCents: integer("price_cents").notNull(),
  durationDays: integer("duration_days").notNull().default(30),
});

export const memberships = pgTable(
  "memberships",
  {
    id: id(),
    memberId: text("member_id").notNull().references(() => memberProfiles.userId, { onDelete: "cascade" }),
    planId: text("plan_id").notNull().references(() => membershipPlans.id),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
    status: membershipStatusEnum("status").notNull().default("ACTIVE"),
  },
  (t) => [index("memberships_member_idx").on(t.memberId)]
);

export const payments = pgTable(
  "payments",
  {
    id: id(),
    memberId: text("member_id").notNull().references(() => memberProfiles.userId, { onDelete: "cascade" }),
    membershipId: text("membership_id").references(() => memberships.id),
    amountCents: integer("amount_cents").notNull(),
    status: paymentStatusEnum("status").notNull().default("PENDING"),
    method: text("method").notNull().default("Card"),
    date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
    // Online payment gateway tracking — set when a member pays through
    // /member/payments instead of an admin marking cash/manual as paid.
    gateway: text("gateway"), // "stripe" | "jazzcash" | "easypaisa" | null (manual)
    gatewayRef: text("gateway_ref"), // checkout session id / txn ref no, for reconciliation + idempotent webhooks
  },
  (t) => [index("payments_member_idx").on(t.memberId)]
);

// ─────────────────────────── Attendance / check-in ───────────────────────────

export const attendance = pgTable(
  "attendance",
  {
    id: id(),
    memberId: text("member_id").notNull().references(() => memberProfiles.userId, { onDelete: "cascade" }),
    checkInAt: timestamp("check_in_at", { withTimezone: true }).notNull().defaultNow(),
    checkOutAt: timestamp("check_out_at", { withTimezone: true }),
    method: attendanceMethodEnum("method").notNull().default("QR"),
  },
  (t) => [index("attendance_member_time_idx").on(t.memberId, t.checkInAt)]
);

// ─────────────────────────── Workouts ───────────────────────────

export const exercises = pgTable("exercises", {
  id: id(),
  gymId: text("gym_id").notNull().references(() => gyms.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  muscleGroup: text("muscle_group").notNull(),
  equipment: text("equipment"),
  videoUrl: text("video_url"),
});

export const workoutPlans = pgTable(
  "workout_plans",
  {
    id: id(),
    trainerId: text("trainer_id").references(() => users.id),
    memberId: text("member_id").notNull().references(() => memberProfiles.userId, { onDelete: "cascade" }),
    title: text("title").notNull(),
    goal: text("goal"),
    createdAt: now(),
  },
  (t) => [index("workout_plans_member_idx").on(t.memberId)]
);

export const workoutPlanDays = pgTable("workout_plan_days", {
  id: id(),
  planId: text("plan_id").notNull().references(() => workoutPlans.id, { onDelete: "cascade" }),
  dayLabel: text("day_label").notNull(),
  order: integer("order").notNull().default(0),
});

export const workoutExercises = pgTable("workout_exercises", {
  id: id(),
  dayId: text("day_id").notNull().references(() => workoutPlanDays.id, { onDelete: "cascade" }),
  exerciseId: text("exercise_id").notNull().references(() => exercises.id),
  sets: integer("sets").notNull().default(3),
  reps: text("reps").notNull().default("10"),
  restSeconds: integer("rest_seconds").notNull().default(60),
  order: integer("order").notNull().default(0),
  notes: text("notes"),
});

export const workoutLogs = pgTable(
  "workout_logs",
  {
    id: id(),
    memberId: text("member_id").notNull().references(() => memberProfiles.userId, { onDelete: "cascade" }),
    planDayId: text("plan_day_id").references(() => workoutPlanDays.id),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
    caloriesBurned: integer("calories_burned").notNull().default(0),
    durationMinutes: integer("duration_minutes").notNull().default(0),
  },
  (t) => [index("workout_logs_member_time_idx").on(t.memberId, t.completedAt)]
);

// ─────────────────────────── Classes / booking ───────────────────────────

export const gymClasses = pgTable(
  "gym_classes",
  {
    id: id(),
    gymId: text("gym_id").notNull().references(() => gyms.id, { onDelete: "cascade" }),
    trainerId: text("trainer_id").references(() => users.id),
    title: text("title").notNull(),
    type: text("type").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    durationMinutes: integer("duration_minutes").notNull().default(45),
    capacity: integer("capacity").notNull().default(12),
  },
  (t) => [index("gym_classes_gym_time_idx").on(t.gymId, t.startsAt)]
);

export const classBookings = pgTable(
  "class_bookings",
  {
    id: id(),
    classId: text("class_id").notNull().references(() => gymClasses.id, { onDelete: "cascade" }),
    memberId: text("member_id").notNull().references(() => memberProfiles.userId, { onDelete: "cascade" }),
    status: bookingStatusEnum("status").notNull().default("BOOKED"),
    bookedAt: timestamp("booked_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("class_bookings_class_member_uq").on(t.classId, t.memberId)]
);

// ─────────────────────────── Announcements & messaging ───────────────────────────

export const announcements = pgTable(
  "announcements",
  {
    id: id(),
    gymId: text("gym_id").notNull().references(() => gyms.id, { onDelete: "cascade" }),
    authorId: text("author_id").notNull().references(() => users.id),
    title: text("title").notNull(),
    body: text("body").notNull(),
    pinned: boolean("pinned").notNull().default(false),
    createdAt: now(),
  },
  (t) => [index("announcements_gym_time_idx").on(t.gymId, t.createdAt)]
);

export const messages = pgTable(
  "messages",
  {
    id: id(),
    gymId: text("gym_id").notNull().references(() => gyms.id, { onDelete: "cascade" }),
    senderId: text("sender_id").notNull().references(() => users.id),
    receiverId: text("receiver_id").notNull().references(() => users.id),
    body: text("body").notNull(),
    createdAt: now(),
    readAt: timestamp("read_at", { withTimezone: true }),
  },
  (t) => [index("messages_gym_pair_idx").on(t.gymId, t.senderId, t.receiverId)]
);

// ─────────────────────────── Progress / body metrics ───────────────────────────

export const bodyMetrics = pgTable(
  "body_metrics",
  {
    id: id(),
    memberId: text("member_id").notNull().references(() => memberProfiles.userId, { onDelete: "cascade" }),
    date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
    weightKg: real("weight_kg"),
    bodyFatPct: real("body_fat_pct"),
    photoUrl: text("photo_url"),
  },
  (t) => [index("body_metrics_member_date_idx").on(t.memberId, t.date)]
);

// ─────────────────────────── Gamification ───────────────────────────

export const streaks = pgTable("streaks", {
  memberId: text("member_id").primaryKey().references(() => memberProfiles.userId, { onDelete: "cascade" }),
  currentStreak: integer("current_streak").notNull().default(0),
  bestStreak: integer("best_streak").notNull().default(0),
  lastActiveDate: timestamp("last_active_date", { withTimezone: true }),
});

export const badges = pgTable("badges", {
  id: id(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
});

export const memberBadges = pgTable(
  "member_badges",
  {
    memberId: text("member_id").notNull().references(() => memberProfiles.userId, { onDelete: "cascade" }),
    badgeId: text("badge_id").notNull().references(() => badges.id),
    earnedAt: timestamp("earned_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.memberId, t.badgeId] })]
);

export const challenges = pgTable("challenges", {
  id: id(),
  gymId: text("gym_id").notNull().references(() => gyms.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  metric: text("metric").notNull().default("workouts"),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
});

export const challengeEntries = pgTable(
  "challenge_entries",
  {
    challengeId: text("challenge_id").notNull().references(() => challenges.id, { onDelete: "cascade" }),
    memberId: text("member_id").notNull().references(() => memberProfiles.userId, { onDelete: "cascade" }),
    score: integer("score").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.challengeId, t.memberId] })]
);

// ─────────────────────────── Referrals ───────────────────────────

export const referrals = pgTable("referrals", {
  id: id(),
  referrerId: text("referrer_id").notNull().references(() => memberProfiles.userId, { onDelete: "cascade" }),
  refereeEmail: text("referee_email").notNull(),
  status: referralStatusEnum("status").notNull().default("PENDING"),
  createdAt: now(),
});

// ─────────────────────────── Auth extras: password reset, push ───────────────────────────

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: id(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: now(),
  },
  (t) => [index("password_reset_tokens_user_idx").on(t.userId)]
);

export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: id(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull().unique(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    createdAt: now(),
  },
  (t) => [index("push_subscriptions_user_idx").on(t.userId)]
);

// A lightweight log of outbound notifications (email/SMS/push) — mostly so
// the platform-owner panel and admin settings can show "last sent" / status
// without needing a full job queue. Not a delivery guarantee system.
export const notificationLog = pgTable(
  "notification_log",
  {
    id: id(),
    gymId: text("gym_id").references(() => gyms.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    channel: notificationChannelEnum("channel").notNull(),
    subject: text("subject").notNull(),
    status: text("status").notNull().default("sent"), // "sent" | "skipped_no_provider" | "failed"
    createdAt: now(),
  },
  (t) => [index("notification_log_gym_idx").on(t.gymId)]
);

// ─────────────────────────── Platform (multi-gym SaaS owner) ───────────────────────────
// Deliberately separate from `users` — a platform owner isn't scoped to any
// single gym, so it gets its own tiny identity table + session type rather
// than forcing gymId to be nullable across the whole app.

export const platformOwners = pgTable("platform_owners", {
  id: id(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: now(),
});

// ─────────────────────────── Relations (for query API ergonomics) ───────────────────────────

export const gymsRelations = relations(gyms, ({ many }) => ({
  users: many(users),
  plans: many(membershipPlans),
  exercises: many(exercises),
  classes: many(gymClasses),
  announcements: many(announcements),
  challenges: many(challenges),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  gym: one(gyms, { fields: [users.gymId], references: [gyms.id] }),
  memberProfile: one(memberProfiles, { fields: [users.id], references: [memberProfiles.userId] }),
  trainerProfile: one(trainerProfiles, { fields: [users.id], references: [trainerProfiles.userId] }),
  trainerWorkoutPlans: many(workoutPlans),
  trainerClasses: many(gymClasses),
  announcementsWritten: many(announcements),
  sentMessages: many(messages, { relationName: "MessageSender" }),
  receivedMessages: many(messages, { relationName: "MessageReceiver" }),
}));

export const trainerProfilesRelations = relations(trainerProfiles, ({ one }) => ({
  user: one(users, { fields: [trainerProfiles.userId], references: [users.id] }),
}));

export const memberProfilesRelations = relations(memberProfiles, ({ one, many }) => ({
  user: one(users, { fields: [memberProfiles.userId], references: [users.id] }),
  trainer: one(users, { fields: [memberProfiles.trainerId], references: [users.id] }),
  memberships: many(memberships),
  payments: many(payments),
  attendance: many(attendance),
  workoutPlans: many(workoutPlans),
  workoutLogs: many(workoutLogs),
  bookings: many(classBookings),
  bodyMetrics: many(bodyMetrics),
  streak: one(streaks, { fields: [memberProfiles.userId], references: [streaks.memberId] }),
  badges: many(memberBadges),
  challengeEntries: many(challengeEntries),
  referralsMade: many(referrals),
}));

export const membershipPlansRelations = relations(membershipPlans, ({ one, many }) => ({
  gym: one(gyms, { fields: [membershipPlans.gymId], references: [gyms.id] }),
  memberships: many(memberships),
}));

export const membershipsRelations = relations(memberships, ({ one, many }) => ({
  member: one(memberProfiles, { fields: [memberships.memberId], references: [memberProfiles.userId] }),
  plan: one(membershipPlans, { fields: [memberships.planId], references: [membershipPlans.id] }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  member: one(memberProfiles, { fields: [payments.memberId], references: [memberProfiles.userId] }),
  membership: one(memberships, { fields: [payments.membershipId], references: [memberships.id] }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  member: one(memberProfiles, { fields: [attendance.memberId], references: [memberProfiles.userId] }),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  gym: one(gyms, { fields: [exercises.gymId], references: [gyms.id] }),
  items: many(workoutExercises),
}));

export const workoutPlansRelations = relations(workoutPlans, ({ one, many }) => ({
  trainer: one(users, { fields: [workoutPlans.trainerId], references: [users.id] }),
  member: one(memberProfiles, { fields: [workoutPlans.memberId], references: [memberProfiles.userId] }),
  days: many(workoutPlanDays),
}));

export const workoutPlanDaysRelations = relations(workoutPlanDays, ({ one, many }) => ({
  plan: one(workoutPlans, { fields: [workoutPlanDays.planId], references: [workoutPlans.id] }),
  items: many(workoutExercises),
  logs: many(workoutLogs),
}));

export const workoutExercisesRelations = relations(workoutExercises, ({ one }) => ({
  day: one(workoutPlanDays, { fields: [workoutExercises.dayId], references: [workoutPlanDays.id] }),
  exercise: one(exercises, { fields: [workoutExercises.exerciseId], references: [exercises.id] }),
}));

export const workoutLogsRelations = relations(workoutLogs, ({ one }) => ({
  member: one(memberProfiles, { fields: [workoutLogs.memberId], references: [memberProfiles.userId] }),
  planDay: one(workoutPlanDays, { fields: [workoutLogs.planDayId], references: [workoutPlanDays.id] }),
}));

export const gymClassesRelations = relations(gymClasses, ({ many, one }) => ({
  gym: one(gyms, { fields: [gymClasses.gymId], references: [gyms.id] }),
  bookings: many(classBookings),
  trainer: one(users, { fields: [gymClasses.trainerId], references: [users.id] }),
}));

export const classBookingsRelations = relations(classBookings, ({ one }) => ({
  class: one(gymClasses, { fields: [classBookings.classId], references: [gymClasses.id] }),
  member: one(memberProfiles, { fields: [classBookings.memberId], references: [memberProfiles.userId] }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  gym: one(gyms, { fields: [announcements.gymId], references: [gyms.id] }),
  author: one(users, { fields: [announcements.authorId], references: [users.id] }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  gym: one(gyms, { fields: [messages.gymId], references: [gyms.id] }),
  sender: one(users, { fields: [messages.senderId], references: [users.id], relationName: "MessageSender" }),
  receiver: one(users, { fields: [messages.receiverId], references: [users.id], relationName: "MessageReceiver" }),
}));

export const bodyMetricsRelations = relations(bodyMetrics, ({ one }) => ({
  member: one(memberProfiles, { fields: [bodyMetrics.memberId], references: [memberProfiles.userId] }),
}));

export const streaksRelations = relations(streaks, ({ one }) => ({
  member: one(memberProfiles, { fields: [streaks.memberId], references: [memberProfiles.userId] }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  members: many(memberBadges),
}));

export const memberBadgesRelations = relations(memberBadges, ({ one }) => ({
  member: one(memberProfiles, { fields: [memberBadges.memberId], references: [memberProfiles.userId] }),
  badge: one(badges, { fields: [memberBadges.badgeId], references: [badges.id] }),
}));

export const challengesRelations = relations(challenges, ({ one, many }) => ({
  gym: one(gyms, { fields: [challenges.gymId], references: [gyms.id] }),
  entries: many(challengeEntries),
}));

export const challengeEntriesRelations = relations(challengeEntries, ({ one }) => ({
  challenge: one(challenges, { fields: [challengeEntries.challengeId], references: [challenges.id] }),
  member: one(memberProfiles, { fields: [challengeEntries.memberId], references: [memberProfiles.userId] }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(memberProfiles, { fields: [referrals.referrerId], references: [memberProfiles.userId] }),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, { fields: [passwordResetTokens.userId], references: [users.id] }),
}));

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
  user: one(users, { fields: [pushSubscriptions.userId], references: [users.id] }),
}));

export const notificationLogRelations = relations(notificationLog, ({ one }) => ({
  gym: one(gyms, { fields: [notificationLog.gymId], references: [gyms.id] }),
  user: one(users, { fields: [notificationLog.userId], references: [users.id] }),
}));
