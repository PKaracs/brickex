import "server-only";

import { z } from "zod";

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_SSL_MODE: z.enum(["disable", "prefer", "require"]).default("require"),
  DATABASE_MAX_CONNECTIONS: z.number().int().min(1).max(50).default(10),
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL"),
  AUTH_TRUSTED_ORIGINS: z.array(z.string().url()).default([]),
  AUTH_FROM_EMAIL: z.string().min(1).default("Brickex <auth@brickex.co>"),
  AUTH_REQUIRE_EMAIL_VERIFICATION: z.boolean().default(false),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  SUPABASE_BUCKET_PROJECT_ASSETS: z.string().min(1).default("brickex-project-assets"),
  SUPABASE_BUCKET_GENERATIONS: z.string().min(1).default("brickex-generations"),
  SUPABASE_BUCKET_EXPORTS: z.string().min(1).default("brickex-exports"),
  SUPABASE_BUCKET_PUBLIC_ASSETS: z.string().min(1).default("objects"),
  SUPABASE_SIGNED_URL_TTL_SECONDS: z.number().int().min(60).max(60 * 60 * 24 * 7).default(60 * 60),
  RESEND_API_KEY: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

function parseInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseBoolean(value: string | undefined, fallback = false): boolean {
  if (value == null || value === "") return fallback;
  return value === "true" || value === "1";
}

function parseOrigins(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

const parsed = serverSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_SSL_MODE: process.env.DATABASE_SSL_MODE,
  DATABASE_MAX_CONNECTIONS: parseInteger(process.env.DATABASE_MAX_CONNECTIONS, 10),
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL:
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000",
  AUTH_TRUSTED_ORIGINS: parseOrigins(process.env.AUTH_TRUSTED_ORIGINS),
  AUTH_FROM_EMAIL: process.env.AUTH_FROM_EMAIL,
  AUTH_REQUIRE_EMAIL_VERIFICATION: parseBoolean(
    process.env.AUTH_REQUIRE_EMAIL_VERIFICATION,
    false,
  ),
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_BUCKET_PROJECT_ASSETS: process.env.SUPABASE_BUCKET_PROJECT_ASSETS,
  SUPABASE_BUCKET_GENERATIONS: process.env.SUPABASE_BUCKET_GENERATIONS,
  SUPABASE_BUCKET_EXPORTS: process.env.SUPABASE_BUCKET_EXPORTS,
  SUPABASE_BUCKET_PUBLIC_ASSETS: process.env.SUPABASE_BUCKET_PUBLIC_ASSETS,
  SUPABASE_SIGNED_URL_TTL_SECONDS: parseInteger(
    process.env.SUPABASE_SIGNED_URL_TTL_SECONDS,
    60 * 60,
  ),
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

export const env = {
  ...parsed,
  authEmailEnabled: Boolean(parsed.RESEND_API_KEY),
  googleOAuthEnabled: Boolean(parsed.GOOGLE_CLIENT_ID && parsed.GOOGLE_CLIENT_SECRET),
};

export const storageBuckets = {
  projectAssets: env.SUPABASE_BUCKET_PROJECT_ASSETS,
  generations: env.SUPABASE_BUCKET_GENERATIONS,
  exports: env.SUPABASE_BUCKET_EXPORTS,
  publicAssets: env.SUPABASE_BUCKET_PUBLIC_ASSETS,
} as const;
