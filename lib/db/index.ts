import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __ironlinePool: Pool | undefined;
}

// Reuse the pool across hot reloads in dev so we don't exhaust Postgres connections.
const pool =
  global.__ironlinePool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  global.__ironlinePool = pool;
}

export const db = drizzle(pool, { schema });
