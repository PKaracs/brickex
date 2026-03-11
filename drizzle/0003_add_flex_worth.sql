-- Add flex worth columns to project_outputs table
ALTER TABLE "project_outputs" ADD COLUMN IF NOT EXISTS "flex_worth" text;
ALTER TABLE "project_outputs" ADD COLUMN IF NOT EXISTS "flex_breakdown" json;

