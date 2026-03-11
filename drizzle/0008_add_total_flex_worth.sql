-- Add totalFlexWorth column to users table (cached total for performance)
ALTER TABLE "users" ADD COLUMN "total_flex_worth" text DEFAULT '0';

-- Backfill existing users by summing their projectOutputs.flexWorth
UPDATE "users" u
SET "total_flex_worth" = COALESCE(
  (
    SELECT SUM(CAST(po.flex_worth AS BIGINT))::text
    FROM "project_outputs" po
    INNER JOIN "projects" p ON po.project_id = p.id
    WHERE p.user_id = u.id
  ),
  '0'
);






