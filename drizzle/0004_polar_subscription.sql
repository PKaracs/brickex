-- Migration: Replace Stripe with Polar subscription fields
-- Add Polar customer ID
ALTER TABLE "users" ADD COLUMN "polar_customer_id" text;

-- Add Polar subscription ID (rename from stripe_subscription_id)
ALTER TABLE "users" ADD COLUMN "subscription_id" text;

-- Add creations tracking fields
ALTER TABLE "users" ADD COLUMN "creations_used" integer NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "creations_reset_at" timestamp with time zone;

-- Drop old Stripe columns (if they exist)
ALTER TABLE "users" DROP COLUMN IF EXISTS "stripe_customer_id";
ALTER TABLE "users" DROP COLUMN IF EXISTS "stripe_subscription_id";

