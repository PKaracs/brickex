-- Migration: Add subscription_product_id to differentiate between plan tiers
-- This allows us to distinguish between weekly ($6.99/50) and monthly ($29/250) plans

ALTER TABLE "users" ADD COLUMN "subscription_product_id" text;

