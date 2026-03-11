-- Add Meta tracking fields for better match quality and deduplication
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_ip_address" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "meta_purchase_event_id" text;

