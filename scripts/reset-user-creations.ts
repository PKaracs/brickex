/**
 * Resets a user's generation count for testing.
 * Usage: npx tsx scripts/reset-user-creations.ts <email>
 */

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import * as schema from "@/db/schema";

async function resetUserCreations() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: npx tsx scripts/reset-user-creations.ts <email>");
    process.exit(1);
  }

  const user = await db.query.users.findFirst({
    where: eq(schema.users.email, email),
    columns: {
      id: true,
      creationsUsed: true,
      name: true,
    },
  });

  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  await db
    .update(schema.users)
    .set({
      creationsUsed: 0,
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, user.id));

  console.log(`Reset creationsUsed to 0 for ${user.name ?? user.id}`);
}

resetUserCreations().catch((error) => {
  console.error(error);
  process.exit(1);
});
