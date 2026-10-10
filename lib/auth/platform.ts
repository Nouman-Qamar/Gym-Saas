import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { platformOwners } from "@/lib/db/schema";
import { getPlatformSession } from "./session";

export const getCurrentPlatformOwner = cache(async () => {
  const session = await getPlatformSession();
  if (!session) return null;
  return db.query.platformOwners.findFirst({ where: eq(platformOwners.id, session.ownerId) });
});

export async function requirePlatformOwner() {
  const owner = await getCurrentPlatformOwner();
  if (!owner) redirect("/platform/login");
  return owner;
}
