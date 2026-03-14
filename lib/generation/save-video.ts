import "server-only";

import { eq } from "drizzle-orm";

import * as schema from "@/db/schema";
import { requireWorkspaceContext } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { storageBuckets } from "@/lib/env";
import {
  buildProjectAssetPath,
  getSignedDownloadUrl,
  ingestExternalFileToStorage,
  toStorageKey,
} from "@/lib/storage";

interface SaveVideoInput {
  videoUrl: string;
  prompt: string;
  projectId?: string | null;
  scenePresetId?: string | null;
  motionPresetId?: string | null;
  duration?: number;
  settings?: Record<string, unknown> | null;
}

interface SaveVideoResult {
  assetId: string;
  signedUrl: string;
}

export async function saveVideoToGallery(
  input: SaveVideoInput,
): Promise<SaveVideoResult> {
  const { organizationId, userId } = await requireWorkspaceContext();

  const projectId = input.projectId ?? "standalone-videos";

  const [run] = await db
    .insert(schema.toolRuns)
    .values({
      organizationId,
      projectId,
      createdByUserId: userId,
      type: "video_generation",
      toolId: "video-generator",
      provider: "xai",
      model: "grok-imagine-video",
      status: "running",
      prompt: input.prompt,
      settings: input.settings ?? null,
      startedAt: new Date(),
    })
    .returning({ id: schema.toolRuns.id });

  const { assetId, path } = buildProjectAssetPath({
    organizationId,
    projectId,
    kind: "generated-videos",
    originalFilename: "video.mp4",
  });

  const bucket = storageBuckets.generations;

  console.log(`[BrickEx:Video] Downloading video from Grok CDN...`);
  const { byteSize, contentType } = await ingestExternalFileToStorage({
    sourceUrl: input.videoUrl,
    bucket,
    path,
    contentType: "video/mp4",
  });
  console.log(`[BrickEx:Video] Uploaded to storage (${Math.round(byteSize / 1024)}KB)`);

  await db.insert(schema.assets).values({
    id: assetId,
    organizationId,
    projectId,
    createdByUserId: userId,
    sourceRunId: run.id,
    bucket,
    path,
    assetKind: "render_video",
    mediaType: "video",
    origin: "generation",
    status: "ready",
    visibility: "private",
    originalFilename: "video.mp4",
    contentType,
    extension: "mp4",
    byteSize,
    readyAt: new Date(),
    metadata: {
      persistedBy: "video-generation",
      scenePresetId: input.scenePresetId ?? null,
      motionPresetId: input.motionPresetId ?? null,
      duration: input.duration ?? null,
    },
  });

  await db.insert(schema.toolRunAssets).values({
    toolRunId: run.id,
    assetId,
    role: "output",
  });

  await db.insert(schema.deliverables).values({
    organizationId,
    projectId,
    assetId,
    toolRunId: run.id,
    type: "animation",
    status: "draft",
    title: "Generated video",
    metadata: {
      scenePresetId: input.scenePresetId ?? null,
      motionPresetId: input.motionPresetId ?? null,
      duration: input.duration ?? null,
    },
  });

  await db
    .update(schema.toolRuns)
    .set({
      status: "succeeded",
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.toolRuns.id, run.id));

  const signedUrl = await getSignedDownloadUrl(toStorageKey(bucket, path));

  console.log(`[BrickEx:Video] Saved to gallery: ${assetId}`);
  return { assetId, signedUrl };
}
