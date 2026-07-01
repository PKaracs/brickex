import { extname } from "path";

import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import * as schema from "@/db/schema";
import { requireWorkspaceContext } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { getStorageObjectInfo, parseStorageKey } from "@/lib/storage";
import { projectImagesConfirmSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = projectImagesConfirmSchema.parse(body);
    const { organizationId, userId } = await requireWorkspaceContext();

    const project = await db.query.projects.findFirst({
      where: (projects, { and, eq, isNull }) =>
        and(
          eq(projects.id, input.projectId),
          eq(projects.organizationId, organizationId),
          isNull(projects.archivedAt),
        ),
      columns: {
        id: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }

    const confirmedKeys: string[] = [];

    for (const file of input.files) {
      const { bucket, path } = parseStorageKey(file.storageKey);
      const uploadSession = await db.query.uploadSessions.findFirst({
        where: and(
          eq(schema.uploadSessions.organizationId, organizationId),
          eq(schema.uploadSessions.projectId, project.id),
          eq(schema.uploadSessions.requestedByUserId, userId),
          eq(schema.uploadSessions.bucket, bucket),
          eq(schema.uploadSessions.path, path),
        ),
        columns: {
          id: true,
          assetId: true,
          status: true,
        },
      });

      if (!uploadSession) {
        return NextResponse.json(
          { error: `No se encontro la sesion de subida para ${file.storageKey}` },
          { status: 404 },
        );
      }

      await getStorageObjectInfo(file.storageKey);

      await db
        .update(schema.assets)
        .set({
          originalFilename: file.name,
          contentType: file.type,
          extension: extname(file.name || "").replace(/^\./, "") || null,
          byteSize: file.size,
          status: "ready",
          readyAt: new Date(),
          metadata: {
            uploadedVia: "signed-upload-url",
          },
          updatedAt: new Date(),
        })
        .where(eq(schema.assets.id, uploadSession.assetId));

      await db
        .update(schema.uploadSessions)
        .set({
          status: "confirmed",
          uploadedAt: new Date(),
          confirmedAt: new Date(),
        })
        .where(eq(schema.uploadSessions.id, uploadSession.id));

      confirmedKeys.push(file.storageKey);
    }

    await db
      .update(schema.projects)
      .set({
        sourceType: "upload",
        updatedByUserId: userId,
        updatedAt: new Date(),
      })
      .where(eq(schema.projects.id, project.id));

    return NextResponse.json({ storageKeys: confirmedKeys });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudieron confirmar las subidas";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
