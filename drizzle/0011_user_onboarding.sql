-- User onboarding email flow tracking
CREATE TABLE "user_onboarding" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "email" text NOT NULL,
  "current_stage" integer NOT NULL DEFAULT 0,
  "email0_sent_at" timestamp with time zone,
  "email1_sent_at" timestamp with time zone,
  "email2_sent_at" timestamp with time zone,
  "email3_sent_at" timestamp with time zone,
  "email4_sent_at" timestamp with time zone,
  "paused_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Indexes for cron queries
CREATE INDEX "user_onboarding_user_id_idx" ON "user_onboarding"("user_id");
CREATE INDEX "user_onboarding_current_stage_idx" ON "user_onboarding"("current_stage");
CREATE INDEX "user_onboarding_created_at_idx" ON "user_onboarding"("created_at");

