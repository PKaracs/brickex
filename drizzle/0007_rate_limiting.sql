-- Rate Limiting Tables for Auth Protection
-- Protects against bots, credential stuffing, and magic link spam

-- Rate limits table (tracks request counts per key within time windows)
CREATE TABLE IF NOT EXISTS "rate_limits" (
  "id" text PRIMARY KEY NOT NULL,
  "key" text NOT NULL,
  "count" integer NOT NULL DEFAULT 1,
  "window_start" timestamp with time zone NOT NULL DEFAULT now(),
  "expires_at" timestamp with time zone NOT NULL
);

-- Index for fast lookups by key
CREATE INDEX IF NOT EXISTS "rate_limits_key_idx" ON "rate_limits" ("key");

-- Index for cleanup of expired entries  
CREATE INDEX IF NOT EXISTS "rate_limits_expires_at_idx" ON "rate_limits" ("expires_at");

-- Auth challenges table (tracks IPs with repeated failures)
CREATE TABLE IF NOT EXISTS "auth_challenges" (
  "id" text PRIMARY KEY NOT NULL,
  "ip" text NOT NULL UNIQUE,
  "failure_count" integer NOT NULL DEFAULT 1,
  "challenged_until" timestamp with time zone,
  "last_failure_at" timestamp with time zone NOT NULL DEFAULT now(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast IP lookups
CREATE INDEX IF NOT EXISTS "auth_challenges_ip_idx" ON "auth_challenges" ("ip");

