-- Add Meta CAPI tracking fields to users table for improved match quality
-- These store browser identifiers captured client-side and used in server-side events

ALTER TABLE "users" ADD COLUMN "meta_fbp" text;
ALTER TABLE "users" ADD COLUMN "meta_fbc" text;
ALTER TABLE "users" ADD COLUMN "last_user_agent" text;

