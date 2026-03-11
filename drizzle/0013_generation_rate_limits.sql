-- Generation Rate Limits Table
-- Tracks IP + fingerprint combinations for free generation abuse prevention
-- Persists across deploys (unlike in-memory tracking)

CREATE TABLE IF NOT EXISTS "generation_rate_limits" (
  "id" text PRIMARY KEY NOT NULL,
  "ip_address" text NOT NULL,
  "fingerprint" text,
  "user_agent_hash" text,
  "generation_count" integer NOT NULL DEFAULT 1,
  "first_generation_at" timestamp with time zone NOT NULL DEFAULT now(),
  "last_generation_at" timestamp with time zone NOT NULL DEFAULT now(),
  "window_expires_at" timestamp with time zone NOT NULL,
  "user_id" text REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "generation_rate_limits_ip_fp_idx" 
  ON "generation_rate_limits" ("ip_address", "fingerprint");

CREATE INDEX IF NOT EXISTS "generation_rate_limits_expires_idx" 
  ON "generation_rate_limits" ("window_expires_at");

CREATE INDEX IF NOT EXISTS "generation_rate_limits_user_idx" 
  ON "generation_rate_limits" ("user_id");
