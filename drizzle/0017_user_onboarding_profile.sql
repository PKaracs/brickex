-- In-app onboarding profile (welcome flow preferences)
CREATE TABLE "user_onboarding_profile" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "goal" text,
  "content_types" json,
  "creator_type" text,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Index for fast lookup by user_id
CREATE INDEX "user_onboarding_profile_user_id_idx" ON "user_onboarding_profile"("user_id");

