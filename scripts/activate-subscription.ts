import "dotenv/config";
import postgres from "postgres";

// Change this to your email
const USER_EMAIL = "pocsi@gmail.com";

async function main() {
  const sql = postgres(process.env.DATABASE_URL!);

  // Activate subscription for user
  await sql`
    UPDATE users 
    SET 
      subscription_status = 'active',
      subscription_id = 'manual_test',
      creations_used = 0,
      creations_reset_at = NOW()
    WHERE email = ${USER_EMAIL}
  `;

  console.log(`✅ Activated subscription for ${USER_EMAIL}`);

  // Verify
  const users =
    await sql`SELECT email, subscription_status, creations_used FROM users WHERE email = ${USER_EMAIL}`;
  console.table(users);

  await sql.end();
}

main();
