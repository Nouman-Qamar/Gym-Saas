import "server-only";
import { and, eq, or, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { messages, users } from "@/lib/db/schema";

export async function getThread(userId: string, otherId: string) {
  return db.query.messages.findMany({
    where: or(and(eq(messages.senderId, userId), eq(messages.receiverId, otherId)), and(eq(messages.senderId, otherId), eq(messages.receiverId, userId))),
    orderBy: asc(messages.createdAt),
  });
}

export async function getContact(userId: string) {
  return db.query.users.findFirst({ where: eq(users.id, userId) });
}
