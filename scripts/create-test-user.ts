/**
 * Creates a test user and default Brickex workspace for development purposes.
 * Usage: npx tsx scripts/create-test-user.ts
 */

import { db } from "@/lib/db";
import * as schema from "@/db/schema";

const TEST_EMAIL = `test-${Date.now()}@brickex.dev`;

async function createTestUser() {
  const name = `BrickexTester${Math.floor(Math.random() * 9000) + 1000}`;
  const userId = crypto.randomUUID();
  const workspaceId = crypto.randomUUID();
  const sessionToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db.insert(schema.organizations).values({
    id: workspaceId,
    name: `${name} Workspace`,
    slug: `brickex-${Date.now()}`,
  });

  await db.insert(schema.users).values({
    id: userId,
    email: TEST_EMAIL,
    name,
    emailVerified: true,
    defaultOrganizationId: workspaceId,
    creationsUsed: 0,
    creationsLimit: 20,
  });

  await db.insert(schema.members).values({
    organizationId: workspaceId,
    userId,
    role: "owner",
  });

  await db.insert(schema.workspaceSettings).values({
    organizationId: workspaceId,
    companyName: name,
  });

  await db.insert(schema.sessions).values({
    userId,
    token: sessionToken,
    expiresAt,
    activeOrganizationId: workspaceId,
  });

  console.log(`Email: ${TEST_EMAIL}`);
  console.log(`Name: ${name}`);
  console.log(`Workspace ID: ${workspaceId}`);
  console.log(`Session Token: ${sessionToken}`);
  console.log(
    `document.cookie = "better-auth.session_token=${sessionToken}; path=/; max-age=${7 * 24 * 60 * 60}"`,
  );
}

createTestUser().catch((error) => {
  console.error(error);
  process.exit(1);
});
