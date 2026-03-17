ALTER TABLE "users" ALTER COLUMN "creations_limit" SET DEFAULT 100;
UPDATE "users"
SET
  "creations_limit" = 100,
  "updated_at" = NOW()
WHERE
  "creations_limit" < 100
  AND ("subscription_plan" IS NULL OR "subscription_plan" = 'free');
