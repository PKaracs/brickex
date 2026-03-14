import { and, eq } from "drizzle-orm";

import * as schema from "@/db/schema";
import { db } from "@/lib/db";
import { parseStorageKey } from "@/lib/storage";

export async function getProjectWithRelations(
  projectId: string,
  userId: string,
): Promise<any> {
  const membership = await db.query.members.findFirst({
    where: eq(schema.members.userId, userId),
    columns: {
      organizationId: true,
    },
  });

  if (!membership) {
    return null;
  }

  const project = await db.query.projects.findFirst({
    where: and(
      eq(schema.projects.id, projectId),
      eq(schema.projects.organizationId, membership.organizationId),
    ),
    with: {
      assets: true,
    },
  });

  if (!project) {
    return null;
  }

  return {
    id: project.id,
    sourceType: project.sourceType,
    advancedSettings: project.settings,
    customPrompt: project.customPrompt,
    templateId: project.templateId,
    inputImages: project.assets
      .filter((asset: (typeof project.assets)[number]) =>
        ["source_image", "reference_image", "moodboard", "style_reference"].includes(asset.assetKind),
      )
      .map((asset: (typeof project.assets)[number]) => ({
        storageKey: `${asset.bucket}/${asset.path}`,
      })),
    objects: [],
  };
}

export async function createGeneration(projectId: string) {
  const project = await db.query.projects.findFirst({
    where: eq(schema.projects.id, projectId),
    columns: {
      id: true,
      organizationId: true,
      createdByUserId: true,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const [run] = await db
    .insert(schema.toolRuns)
    .values({
      organizationId: project.organizationId,
      projectId: project.id,
      createdByUserId: project.createdByUserId,
      type: "image_generation",
      toolId: "legacy-render",
      provider: "system",
      status: "queued",
    })
    .returning({ id: schema.toolRuns.id });

  return run;
}

export async function setGenerationRunning(generationId: string, prompt: string) {
  await db
    .update(schema.toolRuns)
    .set({
      status: "running",
      prompt,
      startedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.toolRuns.id, generationId));
}

export async function setGenerationSucceeded(generationId: string, inputImageCount: number) {
  await db
    .update(schema.toolRuns)
    .set({
      status: "succeeded",
      completedAt: new Date(),
      settings: {
        inputImageCount,
      },
      updatedAt: new Date(),
    })
    .where(eq(schema.toolRuns.id, generationId));
}

export async function setGenerationFailed(generationId: string, errorMessage: string) {
  await db
    .update(schema.toolRuns)
    .set({
      status: "failed",
      errorMessage,
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.toolRuns.id, generationId));
}

export function generateFlexWorth(
  _projectObjects?: { objectId?: string | null; objectName: string | null }[],
): { total: number; breakdown: Record<string, number> } {
  return { total: 0, breakdown: {} };
}

export async function createOutput(
  generationId: string,
  projectId: string,
  storageKey: string,
  _projectObjects?: { objectId?: string | null; objectName: string | null }[],
): Promise<{ flexWorth: number; flexBreakdown: Record<string, number> }> {
  const run = await db.query.toolRuns.findFirst({
    where: eq(schema.toolRuns.id, generationId),
    columns: {
      id: true,
      organizationId: true,
      createdByUserId: true,
    },
  });

  if (!run) {
    throw new Error("Generation not found");
  }

  const { bucket, path } = parseStorageKey(storageKey);

  const [asset] = await db
    .insert(schema.assets)
    .values({
      organizationId: run.organizationId,
      projectId,
      createdByUserId: run.createdByUserId,
      sourceRunId: generationId,
      bucket,
      path,
      assetKind: "render_image",
      mediaType: "image",
      origin: "generation",
      status: "ready",
      visibility: "private",
      readyAt: new Date(),
    })
    .returning({ id: schema.assets.id });

  await db.insert(schema.toolRunAssets).values({
    toolRunId: generationId,
    assetId: asset.id,
    role: "output",
  });

  await db.insert(schema.deliverables).values({
    organizationId: run.organizationId,
    projectId,
    assetId: asset.id,
    toolRunId: generationId,
    type: "hero_render",
    status: "draft",
    title: "Generated output",
  });

  return { flexWorth: 0, flexBreakdown: {} };
}

export async function updateProjectStatus(
  projectId: string,
  status: "draft" | "processing" | "complete" | "failed",
) {
  await db
    .update(schema.projects)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(schema.projects.id, projectId));
}
