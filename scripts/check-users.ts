import "dotenv/config";
import postgres from "postgres";

async function main() {
  const sql = postgres(process.env.DATABASE_URL!);
  const users =
    await sql`SELECT email, subscription_status, subscription_id, creations_used, polar_customer_id FROM users LIMIT 5`;
  console.table(users);
  await sql.end();
}

main();


