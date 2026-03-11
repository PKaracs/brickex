-- Email unsubscribe tracking for compliance
CREATE TABLE "email_unsubscribes" (
  "id" text PRIMARY KEY NOT NULL,
  "email" text NOT NULL UNIQUE,
  "user_id" text REFERENCES "users"("id") ON DELETE SET NULL,
  "reason" text,
  "unsubscribed_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Index for quick lookups
CREATE INDEX "email_unsubscribes_email_idx" ON "email_unsubscribes"("email");

