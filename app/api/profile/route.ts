import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import * as schema from "@/db/schema";
import { requireAuthWithSession } from "@/lib/auth-guard";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120, "Name is too long."),
  image: z.string().url("Profile image must be a valid URL.").nullable(),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuthWithSession();
    const body = await request.json();
    const input = updateProfileSchema.parse(body);

    const [user] = await db
      .update(schema.users)
      .set({
        name: input.name,
        image: input.image,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, session.user.id))
      .returning({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        image: schema.users.image,
      });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update profile.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
