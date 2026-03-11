/**
 * Creates a test user for development purposes
 * Usage: npx tsx scripts/create-test-user.ts
 */

import { db } from "@/lib/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

const TEST_EMAIL = `test-${Date.now()}@richflex.dev`;

async function createTestUser() {
  console.log("Creating test user...");

  // Generate a random flex name
  const FLEX_NAMES = [
    "TestFlexer",
    "DevMode",
    "QATester",
    "DebugKing",
    "TestDummy",
  ];
  const randomName = FLEX_NAMES[Math.floor(Math.random() * FLEX_NAMES.length)];
  const randomNumber = Math.floor(Math.random() * 9000) + 1000;
  const name = `${randomName}${randomNumber}`;

  const userId = crypto.randomUUID();

  try {
    // Create user
    await db.insert(schema.users).values({
      id: userId,
      email: TEST_EMAIL,
      name: name,
      emailVerified: true,
      creationsUsed: 0, // Fresh account with 0 creations
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create a session (valid for 7 days)
    const sessionId = crypto.randomUUID();
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.insert(schema.sessions).values({
      id: sessionId,
      userId: userId,
      token: sessionToken,
      expiresAt: expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("\n✅ Test user created successfully!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📧 Email: ${TEST_EMAIL}`);
    console.log(`👤 Name: ${name}`);
    console.log(`🆔 User ID: ${userId}`);
    console.log(`🔑 Session Token: ${sessionToken}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log("To login, set this cookie in your browser:\n");
    console.log(
      `document.cookie = "better-auth.session_token=${sessionToken}; path=/; max-age=${7 * 24 * 60 * 60}"`
    );
    console.log(
      "\nOr open: /app/dashboard directly after setting the cookie.\n"
    );
  } catch (error) {
    console.error("Failed to create test user:", error);
    process.exit(1);
  }

  process.exit(0);
}

createTestUser();
