-- Track individual game earnings with timestamps for time-filtered leaderboards
CREATE TABLE IF NOT EXISTS "game_earnings" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "amount" text NOT NULL,
  "source" text DEFAULT 'flex_game', -- 'flex_game', 'bonus', etc.
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Index for efficient time-filtered queries
CREATE INDEX IF NOT EXISTS "game_earnings_user_created_idx" ON "game_earnings" ("user_id", "created_at");

