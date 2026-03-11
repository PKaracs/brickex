/**
 * Resets a user's creation count for testing
 * Usage: npx tsx scripts/reset-user-creations.ts <email>
 * Example: npx tsx scripts/reset-user-creations.ts test@example.com
 */

import { db } from "@/lib/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

async function resetUserCreations() {
  const email = process.argv[2];

  if (!email) {
    console.log("Usage: npx tsx scripts/reset-user-creations.ts <email>");
    console.log(
      "Example: npx tsx scripts/reset-user-creations.ts test@example.com"
    );
    process.exit(1);
  }

  console.log(`Looking up user: ${email}...`);

  try {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`Found user: ${user.name} (${user.id})`);
    console.log(`Current creations used: ${user.creationsUsed}`);

    await db
      .update(schema.users)
      .set({
        creationsUsed: 0,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, user.id));

    console.log("\n✅ Reset creationsUsed to 0");
    console.log("User can now generate 2 free images again.\n");
  } catch (error) {
    console.error("Failed to reset user:", error);
    process.exit(1);
  }

  process.exit(0);
}

resetUserCreations();
