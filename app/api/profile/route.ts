import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import * as schema from "@/db/schema";
import { requireAuthWithSession } from "@/lib/auth-guard";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio.").max(120, "El nombre es demasiado largo."),
  image: z.string().url("La imagen de perfil debe ser una URL valida.").nullable(),
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
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo actualizar el perfil.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
