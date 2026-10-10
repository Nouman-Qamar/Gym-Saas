"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { workoutPlans, workoutPlanDays, workoutExercises, gymClasses, messages, trainerProfiles } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/current-user";
import type { ActionState } from "./auth";

const planSchema = z.object({
  memberId: z.string().min(1),
  title: z.string().min(2),
  goal: z.string().optional(),
});

export async function createWorkoutPlan(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const trainer = await requireUser("TRAINER");
  const parsed = planSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Choose a member and enter a plan title." };

  const [plan] = await db
    .insert(workoutPlans)
    .values({ trainerId: trainer.id, memberId: parsed.data.memberId, title: parsed.data.title, goal: parsed.data.goal || null })
    .returning();

  revalidatePath("/trainer/workouts");
  redirect(`/trainer/workouts/${plan.id}`);
}

const daySchema = z.object({ planId: z.string(), dayLabel: z.string().min(2) });

export async function addPlanDay(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser("TRAINER");
  const parsed = daySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a day label, e.g. 'Day 1 — Chest'." };

  const existingDays = await db.query.workoutPlanDays.findMany({ where: eq(workoutPlanDays.planId, parsed.data.planId) });

  await db.insert(workoutPlanDays).values({ planId: parsed.data.planId, dayLabel: parsed.data.dayLabel, order: existingDays.length });
  revalidatePath(`/trainer/workouts/${parsed.data.planId}`);
  return { error: undefined };
}

const exerciseSchema = z.object({
  dayId: z.string(),
  planId: z.string(),
  exerciseId: z.string().min(1),
  sets: z.coerce.number().int().min(1).max(20),
  reps: z.string().min(1),
  restSeconds: z.coerce.number().int().min(0).max(600),
});

export async function addPlanExercise(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser("TRAINER");
  const parsed = exerciseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Fill in every field to add an exercise." };

  const existing = await db.query.workoutExercises.findMany({ where: eq(workoutExercises.dayId, parsed.data.dayId) });

  await db.insert(workoutExercises).values({
    dayId: parsed.data.dayId,
    exerciseId: parsed.data.exerciseId,
    sets: parsed.data.sets,
    reps: parsed.data.reps,
    restSeconds: parsed.data.restSeconds,
    order: existing.length,
  });
  revalidatePath(`/trainer/workouts/${parsed.data.planId}`);
  return { error: undefined };
}

export async function removePlanExercise(exerciseRowId: string, planId: string) {
  await requireUser("TRAINER");
  await db.delete(workoutExercises).where(eq(workoutExercises.id, exerciseRowId));
  revalidatePath(`/trainer/workouts/${planId}`);
}

const classSchema = z.object({
  title: z.string().min(2),
  type: z.string().min(2),
  startsAt: z.string().min(1),
  durationMinutes: z.coerce.number().int().min(10).max(180),
  capacity: z.coerce.number().int().min(1).max(200),
});

export async function createClass(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const trainer = await requireUser("TRAINER");
  const parsed = classSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Fill in every field to schedule a class." };

  await db.insert(gymClasses).values({
    gymId: trainer.gymId,
    trainerId: trainer.id,
    title: parsed.data.title,
    type: parsed.data.type,
    startsAt: new Date(parsed.data.startsAt),
    durationMinutes: parsed.data.durationMinutes,
    capacity: parsed.data.capacity,
  });

  revalidatePath("/trainer/schedule");
  revalidatePath("/member/classes");
  return { error: undefined };
}

const trainerProfileSchema = z.object({ specialty: z.string().optional(), bio: z.string().optional() });

export async function updateTrainerProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const trainer = await requireUser("TRAINER");
  const parsed = trainerProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid input." };

  await db
    .update(trainerProfiles)
    .set({ specialty: parsed.data.specialty || null, bio: parsed.data.bio || null })
    .where(eq(trainerProfiles.userId, trainer.id));

  revalidatePath("/", "layout");
  return { error: undefined };
}

const messageSchema = z.object({ receiverId: z.string().min(1), body: z.string().min(1) });

export async function sendMessage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser(["TRAINER", "MEMBER"]);
  const parsed = messageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Write a message first." };

  await db.insert(messages).values({
    gymId: user.gymId,
    senderId: user.id,
    receiverId: parsed.data.receiverId,
    body: parsed.data.body,
  });

  revalidatePath("/trainer/messages");
  revalidatePath("/member/messages");
  return { error: undefined };
}
