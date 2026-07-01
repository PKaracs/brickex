import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";

import * as schema from "@/db/schema";
import { db } from "@/lib/db";
import { getSignedDownloadUrl, toStorageKey } from "@/lib/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ asset_id: string }> },
) {
  const { asset_id } = await params;

  const asset = await db
    .select({
      bucket: schema.assets.bucket,
      path: schema.assets.path,
      mediaType: schema.assets.mediaType,
    })
    .from(schema.assets)
    .innerJoin(schema.projects, eq(schema.assets.projectId, schema.projects.id))
    .where(
      and(
        eq(schema.assets.id, asset_id),
        eq(schema.assets.status, "ready"),
        isNull(schema.assets.deletedAt),
        isNull(schema.projects.archivedAt),
      ),
    )
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!asset || (asset.mediaType !== "image" && asset.mediaType !== "video")) {
    return NextResponse.json({ error: "Recurso no encontrado" }, { status: 404 });
  }

  const signedUrl = await getSignedDownloadUrl(toStorageKey(asset.bucket, asset.path));
  return NextResponse.redirect(signedUrl, 302);
}
