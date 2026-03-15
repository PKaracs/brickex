import "server-only";

import { and, eq, isNull, or, sql } from "drizzle-orm";

import * as schema from "@/db/schema";
import { requireWorkspaceContext } from "@/lib/auth-guard";
import { getCreditCostForToolId } from "@/lib/constants/tools";
import { db } from "@/lib/db";
import { storageBuckets } from "@/lib/env";
import {
  buildProjectAssetPath,
  getSignedDownloadUrl,
  toStorageKey,
  uploadBufferToStorage,
} from "@/lib/storage";

interface StartProjectImageRunInput {
  projectId: string;
  type: typeof schema.toolRunTypeEnum.enumValues[number];
  toolId: string;
  model?: string | null;
  prompt?: string | null;
  settings?: Record<string, unknown> | null;
  inputAssetId?: string | null;
}

interface StartedProjectImageRun {
  runId: string;
  projectId: string;
  organizationId: string;
  userId: string;
  currentHeroAssetId: string | null;
}

interface FinishProjectImageRunSuccessInput {
  run: StartedProjectImageRun;
  dataUrl: string;
  assetKind?: typeof schema.assetKindEnum.enumValues[number];
  deliverableType?: typeof schema.deliverableTypeEnum.enumValues[number];
  deliverableTitle?: string;
  deliverableMetadata?: Record<string, unknown> | null;
  sourceAssetId?: string | null;
  pathKind?: string;
}

interface FinishProjectImageRunFailureInput {
  run: StartedProjectImageRun;
  errorMessage: string;
}

interface EnsureProjectSourceImageAssetInput {
  projectId: string;
  dataUrl: string;
  originalFilename?: string;
  pathKind?: string;
}

function parseDataUrl(dataUrl: string) {
  if (!dataUrl.startsWith("data:")) {
    throw new Error("Invalid image payload returned by model");
  }

  const separatorIndex = dataUrl.indexOf(";base64,");
  if (separatorIndex === -1) {
    throw new Error("Invalid image payload returned by model");
  }

  const contentType = dataUrl.slice(5, separatorIndex) || "image/png";
  const base64 = dataUrl.slice(separatorIndex + ";base64,".length);
  const buffer = Buffer.from(base64, "base64");
  const extension = contentType.split("/")[1]?.replace(/[^a-z0-9]+/gi, "") || "png";

  return {
    contentType,
    extension,
    buffer,
  };
}

export async function ensureProjectSourceImageAsset(
  input: EnsureProjectSourceImageAssetInput,
): Promise<{ assetId: string }> {
  const { organizationId, userId } = await requireWorkspaceContext();

  const project = await db.query.projects.findFirst({
    where: and(
      eq(schema.projects.id, input.projectId),
      eq(schema.projects.organizationId, organizationId),
      isNull(schema.projects.archivedAt),
    ),
    columns: {
      id: true,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const existingSource = await db.query.assets.findFirst({
    where: and(
      eq(schema.assets.organizationId, organizationId),
      eq(schema.assets.projectId, project.id),
      or(
        eq(schema.assets.assetKind, "source_image"),
        eq(schema.assets.assetKind, "reference_image"),
      ),
      eq(schema.assets.mediaType, "image"),
      eq(schema.assets.status, "ready"),
      isNull(schema.assets.deletedAt),
    ),
    columns: {
      id: true,
    },
    orderBy: (assets, { desc }) => [desc(assets.createdAt)],
  });

  if (existingSource) {
    return { assetId: existingSource.id };
  }

  const { contentType, extension, buffer } = parseDataUrl(input.dataUrl);
  const originalFilename =
    input.originalFilename ?? `project-source.${extension}`;
  const { assetId, path } = buildProjectAssetPath({
    organizationId,
    projectId: project.id,
    kind: input.pathKind ?? "source-images",
    originalFilename,
  });

  const bucket = storageBuckets.projectAssets;

  await uploadBufferToStorage({
    bucket,
    path,
    buffer,
    contentType,
  });

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
    status: "ready",
    visibility: "private",
    originalFilename,
    contentType,
    extension,
    byteSize: buffer.byteLength,
    readyAt: new Date(),
    metadata: {
      persistedBy: "project-source-image",
    },
  });

  return { assetId };
}

export async function startProjectImageRun(
  input: StartProjectImageRunInput,
): Promise<StartedProjectImageRun> {
  const { organizationId, userId } = await requireWorkspaceContext();

  const project = await db.query.projects.findFirst({
    where: and(
      eq(schema.projects.id, input.projectId),
      eq(schema.projects.organizationId, organizationId),
      isNull(schema.projects.archivedAt),
    ),
    columns: {
      id: true,
      heroAssetId: true,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const brickCost = getCreditCostForToolId(input.toolId);

  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, userId),
    columns: { creationsUsed: true, creationsLimit: true },
  });
  if (!user) throw new Error("User not found");

  const remaining = user.creationsLimit - user.creationsUsed;
  if (remaining < brickCost) {
    throw new Error(
      `Not enough bricks. This costs ${brickCost} bricks but you have ${remaining} remaining.`,
    );
  }

  await db
    .update(schema.users)
    .set({
      creationsUsed: sql`LEAST(${schema.users.creationsUsed} + ${brickCost}, ${schema.users.creationsLimit})`,
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, userId));

  const [run] = await db
    .insert(schema.toolRuns)
    .values({
      organizationId,
      projectId: project.id,
      createdByUserId: userId,
      type: input.type,
      toolId: input.toolId,
      provider: "google",
      model: input.model ?? null,
      status: "running",
      prompt: input.prompt ?? null,
      settings: input.settings ?? null,
      creditsConsumed: brickCost,
      startedAt: new Date(),
    })
    .returning({ id: schema.toolRuns.id });

  await db
    .update(schema.projects)
    .set({
      latestRunId: run.id,
      status: "processing",
      updatedByUserId: userId,
      updatedAt: new Date(),
    })
    .where(eq(schema.projects.id, project.id));

  const inputAssetId = input.inputAssetId ?? project.heroAssetId ?? null;

  if (inputAssetId) {
    await db.insert(schema.toolRunAssets).values({
      toolRunId: run.id,
      assetId: inputAssetId,
      role: "input",
    });
  }

  return {
    runId: run.id,
    projectId: project.id,
    organizationId,
    userId,
    currentHeroAssetId: project.heroAssetId ?? null,
  };
}

export async function finishProjectImageRunSuccess(
  input: FinishProjectImageRunSuccessInput,
): Promise<{ url: string; assetId: string }> {
  const { contentType, extension, buffer } = parseDataUrl(input.dataUrl);
  const { assetId, path } = buildProjectAssetPath({
    organizationId: input.run.organizationId,
    projectId: input.run.projectId,
    kind: input.pathKind ?? "generated-images",
    originalFilename: `${input.deliverableTitle ?? "render"}.${extension}`,
  });

  const bucket = storageBuckets.generations;

  await uploadBufferToStorage({
    bucket,
    path,
    buffer,
    contentType,
  });

  await db.insert(schema.assets).values({
    id: assetId,
    organizationId: input.run.organizationId,
    projectId: input.run.projectId,
    createdByUserId: input.run.userId,
    sourceAssetId: input.sourceAssetId ?? input.run.currentHeroAssetId,
    sourceRunId: input.run.runId,
    bucket,
    path,
    assetKind: input.assetKind ?? "render_image",
    mediaType: "image",
    origin: "generation",
    status: "ready",
    visibility: "private",
    originalFilename: `${input.deliverableTitle ?? "render"}.${extension}`,
    contentType,
    extension,
    byteSize: buffer.byteLength,
    readyAt: new Date(),
    metadata: {
      persistedBy: "project-image-run",
    },
  });

  await db.insert(schema.toolRunAssets).values({
    toolRunId: input.run.runId,
    assetId,
    role: "output",
  });

  await db.insert(schema.deliverables).values({
    organizationId: input.run.organizationId,
    projectId: input.run.projectId,
    assetId,
    toolRunId: input.run.runId,
    type: input.deliverableType ?? "hero_render",
    status: "draft",
    title: input.deliverableTitle ?? "Generated render",
    metadata: input.deliverableMetadata ?? null,
  });

  await db
    .update(schema.toolRuns)
    .set({
      status: "succeeded",
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.toolRuns.id, input.run.runId));

  await db
    .update(schema.projects)
    .set({
      heroAssetId: assetId,
      latestRunId: input.run.runId,
      status: "complete",
      updatedByUserId: input.run.userId,
      updatedAt: new Date(),
    })
    .where(eq(schema.projects.id, input.run.projectId));

  return {
    url: await getSignedDownloadUrl(toStorageKey(bucket, path)),
    assetId,
  };
}

export async function finishProjectImageRunFailure(
  input: FinishProjectImageRunFailureInput,
) {
  await db
    .update(schema.toolRuns)
    .set({
      status: "failed",
      errorMessage: input.errorMessage,
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.toolRuns.id, input.run.runId));

  await db
    .update(schema.projects)
    .set({
      status: "failed",
      updatedByUserId: input.run.userId,
      updatedAt: new Date(),
    })
    .where(eq(schema.projects.id, input.run.projectId));
}

export async function updateProjectImageRunPrompt(
  runId: string,
  prompt: string,
) {
  await db
    .update(schema.toolRuns)
    .set({
      prompt,
      updatedAt: new Date(),
    })
    .where(eq(schema.toolRuns.id, runId));
}
