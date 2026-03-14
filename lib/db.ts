import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";
import { env } from "@/lib/env";

function createDb(sqlClient: ReturnType<typeof postgres>) {
  return drizzle(sqlClient, { schema });
}

type DbClient = ReturnType<typeof createDb>;

const globalForDb = globalThis as typeof globalThis & {
  __brickexSql__?: ReturnType<typeof postgres>;
  __brickexDb__?: DbClient;
};

function createPostgresClient() {
  return postgres(env.DATABASE_URL, {
    max: env.DATABASE_MAX_CONNECTIONS,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl:
      env.DATABASE_SSL_MODE === "disable"
        ? false
        : env.DATABASE_SSL_MODE === "prefer"
          ? "prefer"
          : "require",
    onnotice: () => {
      // Suppress noisy NOTICE output from Postgres extensions and migrations.
    },
  });
}

export const client = globalForDb.__brickexSql__ ?? createPostgresClient();
export const db = globalForDb.__brickexDb__ ?? createDb(client);

if (env.NODE_ENV !== "production") {
  globalForDb.__brickexSql__ = client;
  globalForDb.__brickexDb__ = db;
}

export type Database = typeof db;
