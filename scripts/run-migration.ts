import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function runMigration() {
  console.log("Running Polar subscription migration...");

  try {
    // Add Polar customer ID
    await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "polar_customer_id" text`;
    console.log("✓ Added polar_customer_id column");

    // Add Polar subscription ID
    await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_id" text`;
    console.log("✓ Added subscription_id column");

    // Add creations tracking fields
    await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "creations_used" integer NOT NULL DEFAULT 0`;
    console.log("✓ Added creations_used column");

    await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "creations_reset_at" timestamp with time zone`;
    console.log("✓ Added creations_reset_at column");

    // Drop old Stripe columns (if they exist)
    await sql`ALTER TABLE "users" DROP COLUMN IF EXISTS "stripe_customer_id"`;
    console.log("✓ Dropped stripe_customer_id column");

    await sql`ALTER TABLE "users" DROP COLUMN IF EXISTS "stripe_subscription_id"`;
    console.log("✓ Dropped stripe_subscription_id column");

    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();


