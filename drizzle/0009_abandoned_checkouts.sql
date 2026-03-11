-- Abandoned checkout tracking for email recovery campaigns
CREATE TABLE "abandoned_checkouts" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "email" text NOT NULL,
  "product_id" text,
  "checkout_url" text,
  "email1_sent_at" timestamp with time zone,
  "email2_sent_at" timestamp with time zone,
  "email3_sent_at" timestamp with time zone,
  "converted_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Index for finding checkouts to process
CREATE INDEX "abandoned_checkouts_user_id_idx" ON "abandoned_checkouts"("user_id");
CREATE INDEX "abandoned_checkouts_created_at_idx" ON "abandoned_checkouts"("created_at");

