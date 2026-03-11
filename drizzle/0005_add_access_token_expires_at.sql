-- Add accessTokenExpiresAt to accounts table for better-auth OAuth
ALTER TABLE "accounts" ADD COLUMN "access_token_expires_at" timestamp with time zone;

