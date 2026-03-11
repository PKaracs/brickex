-- Add A/B test variant field to users table
-- Used for pricing page A/B test (Variant A: control, Variant B: pricing page first)
ALTER TABLE users ADD COLUMN ab_variant TEXT;

-- Index for efficient variant-based queries and analytics
CREATE INDEX idx_users_ab_variant ON users(ab_variant);

