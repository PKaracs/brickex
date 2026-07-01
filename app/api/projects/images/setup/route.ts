import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { requireWorkspaceContext } from "@/lib/auth-guard";
import * as schema from "@/db/schema";
import { projectImagesSetupSchema } from "@/lib/validation/schemas";
import { buildProjectAssetPath, createSignedUploadUrl, toStorageKey } from "@/lib/storage";
import { storageBuckets } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = projectImagesSetupSchema.parse(body);
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

    const uploadUrls = [] as { url: string; storageKey: string }[];

    for (let index = 0; index < input.fileCount; index += 1) {
      const { assetId, path } = buildProjectAssetPath({
        organizationId,
        projectId: project.id,
        kind: "source-images",
        originalFilename: `upload-${index + 1}.bin`,
      });
      const bucket = storageBuckets.projectAssets;

      await db.insert(schema.assets).values({
        id: assetId,
        organizationId,
        projectId: project.id,
        createdByUserId: userId,
        bucket,
        path,
        assetKind: "source_image",
        mediaType: "image",
        origin: "upload",
        status: "pending_upload",
        visibility: "private",
      });

      await db.insert(schema.uploadSessions).values({
        organizationId,
        projectId: project.id,
        assetId,
        requestedByUserId: userId,
        bucket,
        path,
        contentType: "application/octet-stream",
        maxBytes: 50 * 1024 * 1024,
        status: "pending",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 2),
      });

      const upload = await createSignedUploadUrl({ bucket, path });
      uploadUrls.push({
        url: upload.signedUrl,
        storageKey: toStorageKey(bucket, path),
      });
    }

    return NextResponse.json({ uploadUrls });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudieron preparar las subidas";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
