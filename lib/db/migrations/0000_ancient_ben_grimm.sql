CREATE TYPE "public"."attendance_method" AS ENUM('QR', 'MANUAL', 'FRONT_DESK');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('BOOKED', 'ATTENDED', 'CANCELLED', 'NO_SHOW');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('MALE', 'FEMALE', 'OTHER', 'UNSPECIFIED');--> statement-breakpoint
CREATE TYPE "public"."membership_status" AS ENUM('ACTIVE', 'EXPIRING', 'EXPIRED', 'FROZEN');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PAID', 'PENDING', 'OVERDUE', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."referral_status" AS ENUM('PENDING', 'JOINED', 'REWARDED');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('ADMIN', 'TRAINER', 'MEMBER');--> statement-breakpoint
CREATE TYPE "public"."theme_vibe" AS ENUM('EMBER', 'BADDIE', 'ELECTRIC');--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" text PRIMARY KEY NOT NULL,
	"gym_id" text NOT NULL,
	"author_id" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" text PRIMARY KEY NOT NULL,
	"member_id" text NOT NULL,
	"check_in_at" timestamp with time zone DEFAULT now() NOT NULL,
	"check_out_at" timestamp with time zone,
	"method" "attendance_method" DEFAULT 'QR' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	CONSTRAINT "badges_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "body_metrics" (
	"id" text PRIMARY KEY NOT NULL,
	"member_id" text NOT NULL,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"weight_kg" real,
	"body_fat_pct" real,
	"photo_url" text
);
--> statement-breakpoint
CREATE TABLE "challenge_entries" (
	"challenge_id" text NOT NULL,
	"member_id" text NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "challenge_entries_challenge_id_member_id_pk" PRIMARY KEY("challenge_id","member_id")
);
--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" text PRIMARY KEY NOT NULL,
	"gym_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"metric" text DEFAULT 'workouts' NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class_bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"class_id" text NOT NULL,
	"member_id" text NOT NULL,
	"status" "booking_status" DEFAULT 'BOOKED' NOT NULL,
	"booked_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" text PRIMARY KEY NOT NULL,
	"gym_id" text NOT NULL,
	"name" text NOT NULL,
	"muscle_group" text NOT NULL,
	"equipment" text,
	"video_url" text
);
--> statement-breakpoint
CREATE TABLE "gym_classes" (
	"id" text PRIMARY KEY NOT NULL,
	"gym_id" text NOT NULL,
	"trainer_id" text,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"duration_minutes" integer DEFAULT 45 NOT NULL,
	"capacity" integer DEFAULT 12 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gyms" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"address" text,
	"phone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gyms_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "member_badges" (
	"member_id" text NOT NULL,
	"badge_id" text NOT NULL,
	"earned_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "member_badges_member_id_badge_id_pk" PRIMARY KEY("member_id","badge_id")
);
--> statement-breakpoint
CREATE TABLE "member_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"trainer_id" text,
	"join_date" timestamp with time zone DEFAULT now() NOT NULL,
	"height_cm" real,
	"goal" text,
	"referral_code" text NOT NULL,
	"referred_by_id" text,
	CONSTRAINT "member_profiles_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "membership_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"gym_id" text NOT NULL,
	"name" text NOT NULL,
	"tier" integer DEFAULT 1 NOT NULL,
	"price_cents" integer NOT NULL,
	"duration_days" integer DEFAULT 30 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" text PRIMARY KEY NOT NULL,
	"member_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"status" "membership_status" DEFAULT 'ACTIVE' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"gym_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"receiver_id" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"member_id" text NOT NULL,
	"membership_id" text,
	"amount_cents" integer NOT NULL,
	"status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"method" text DEFAULT 'Card' NOT NULL,
	"date" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" text PRIMARY KEY NOT NULL,
	"referrer_id" text NOT NULL,
	"referee_email" text NOT NULL,
	"status" "referral_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "streaks" (
	"member_id" text PRIMARY KEY NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"best_streak" integer DEFAULT 0 NOT NULL,
	"last_active_date" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "trainer_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"specialty" text,
	"bio" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"gym_id" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"role" "role" DEFAULT 'MEMBER' NOT NULL,
	"gender" "gender" DEFAULT 'UNSPECIFIED' NOT NULL,
	"theme_override" "theme_vibe",
	"avatar_url" text,
	"phone" text,
	"onboarded" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "workout_exercises" (
	"id" text PRIMARY KEY NOT NULL,
	"day_id" text NOT NULL,
	"exercise_id" text NOT NULL,
	"sets" integer DEFAULT 3 NOT NULL,
	"reps" text DEFAULT '10' NOT NULL,
	"rest_seconds" integer DEFAULT 60 NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "workout_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"member_id" text NOT NULL,
	"plan_day_id" text,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"calories_burned" integer DEFAULT 0 NOT NULL,
	"duration_minutes" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_plan_days" (
	"id" text PRIMARY KEY NOT NULL,
	"plan_id" text NOT NULL,
	"day_label" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"trainer_id" text,
	"member_id" text NOT NULL,
	"title" text NOT NULL,
	"goal" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_member_id_member_profiles_user_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "body_metrics" ADD CONSTRAINT "body_metrics_member_id_member_profiles_user_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_entries" ADD CONSTRAINT "challenge_entries_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_entries" ADD CONSTRAINT "challenge_entries_member_id_member_profiles_user_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_bookings" ADD CONSTRAINT "class_bookings_class_id_gym_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."gym_classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_bookings" ADD CONSTRAINT "class_bookings_member_id_member_profiles_user_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gym_classes" ADD CONSTRAINT "gym_classes_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gym_classes" ADD CONSTRAINT "gym_classes_trainer_id_users_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_badges" ADD CONSTRAINT "member_badges_member_id_member_profiles_user_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_badges" ADD CONSTRAINT "member_badges_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_profiles" ADD CONSTRAINT "member_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_plans" ADD CONSTRAINT "membership_plans_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_member_id_member_profiles_user_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_plan_id_membership_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."membership_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_member_id_member_profiles_user_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_membership_id_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_member_profiles_user_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."member_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streaks" ADD CONSTRAINT "streaks_member_id_member_profiles_user_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trainer_profiles" ADD CONSTRAINT "trainer_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_day_id_workout_plan_days_id_fk" FOREIGN KEY ("day_id") REFERENCES "public"."workout_plan_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_member_id_member_profiles_user_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_plan_day_id_workout_plan_days_id_fk" FOREIGN KEY ("plan_day_id") REFERENCES "public"."workout_plan_days"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plan_days" ADD CONSTRAINT "workout_plan_days_plan_id_workout_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."workout_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_trainer_id_users_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_member_id_member_profiles_user_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "announcements_gym_time_idx" ON "announcements" USING btree ("gym_id","created_at");--> statement-breakpoint
CREATE INDEX "attendance_member_time_idx" ON "attendance" USING btree ("member_id","check_in_at");--> statement-breakpoint
CREATE INDEX "body_metrics_member_date_idx" ON "body_metrics" USING btree ("member_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "class_bookings_class_member_uq" ON "class_bookings" USING btree ("class_id","member_id");--> statement-breakpoint
CREATE INDEX "gym_classes_gym_time_idx" ON "gym_classes" USING btree ("gym_id","starts_at");--> statement-breakpoint
CREATE INDEX "memberships_member_idx" ON "memberships" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "messages_gym_pair_idx" ON "messages" USING btree ("gym_id","sender_id","receiver_id");--> statement-breakpoint
CREATE INDEX "payments_member_idx" ON "payments" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "users_gym_role_idx" ON "users" USING btree ("gym_id","role");--> statement-breakpoint
CREATE INDEX "workout_logs_member_time_idx" ON "workout_logs" USING btree ("member_id","completed_at");--> statement-breakpoint
CREATE INDEX "workout_plans_member_idx" ON "workout_plans" USING btree ("member_id");