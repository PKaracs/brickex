"use server";

import { and, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import * as schema from "@/db/schema";
import { requireWorkspaceContext } from "@/lib/auth-guard";
import { getProjectForOrganization } from "@/lib/data/projects";
import { getSignedDownloadUrl, toStorageKey } from "@/lib/storage";

export interface ProjectOutputWithFlex {
  url: string | null;
  flexWorth: number | null;
  flexBreakdown: Record<string, number> | null;
}

export type GenerationStatusType =
  | "idle"
  | "queued"
  | "running"
  | "succeeded"
  | "failed";

export interface ProjectGenerationState {
  status: GenerationStatusType;
  generationId: string | null;
}

export async function getProject(
  projectId: string,
): Promise<{ project: any } | { error: string }> {
  try {
    const { organizationId } = await requireWorkspaceContext();
    const project = await getProjectForOrganization(projectId, organizationId);

    if (!project) {
      return { error: "Proyecto no encontrado" };
    }

    return { project };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo cargar el proyecto";
    return { error: message };
  }
}

export async function getProjectLatestOutputUrl(
  projectId: string,
): Promise<string | null> {
  try {
    const { organizationId } = await requireWorkspaceContext();
    const latestDeliverable = await db.query.deliverables.findFirst({
      where: and(
        eq(schema.deliverables.projectId, projectId),
        eq(schema.deliverables.organizationId, organizationId),
      ),
      columns: {
        assetId: true,
      },
      orderBy: (deliverables, { desc }) => [desc(deliverables.createdAt)],
    });

    if (!latestDeliverable?.assetId) {
      return null;
    }

    const asset = await db.query.assets.findFirst({
      where: and(
        eq(schema.assets.id, latestDeliverable.assetId),
        isNull(schema.assets.deletedAt),
      ),
      columns: {
        bucket: true,
        path: true,
      },
    });

    if (!asset) {
      return null;
    }

    return getSignedDownloadUrl(toStorageKey(asset.bucket, asset.path));
  } catch {
    return null;
  }
}

export async function getProjectLatestOutput(
  projectId: string,
): Promise<ProjectOutputWithFlex> {
  const url = await getProjectLatestOutputUrl(projectId);
  return { url, flexWorth: null, flexBreakdown: null };
}

export async function getGenerationPrompt(
  generationId: string,
): Promise<string | null> {
  try {
    const { organizationId } = await requireWorkspaceContext();
    const run = await db.query.toolRuns.findFirst({
      where: and(
        eq(schema.toolRuns.id, generationId),
        eq(schema.toolRuns.organizationId, organizationId),
      ),
      columns: {
        prompt: true,
      },
    });

    return run?.prompt ?? null;
  } catch {
    return null;
  }
}

export async function getProjectGenerationStatus(
  projectId: string,
): Promise<ProjectGenerationState> {
  try {
    const { organizationId } = await requireWorkspaceContext();
    const latestRun = await db.query.toolRuns.findFirst({
      where: and(
        eq(schema.toolRuns.projectId, projectId),
        eq(schema.toolRuns.organizationId, organizationId),
        isNull(schema.toolRuns.canceledAt),
      ),
      columns: {
        id: true,
        status: true,
      },
      orderBy: (toolRuns, { desc }) => [desc(toolRuns.createdAt)],
    });

    if (!latestRun) {
      return { status: "idle", generationId: null };
    }

    if (latestRun.status === "canceled") {
      return { status: "failed", generationId: latestRun.id };
    }

    return {
      status: latestRun.status === "succeeded" ? "succeeded" : latestRun.status,
      generationId: latestRun.id,
    };
  } catch {
    return { status: "idle", generationId: null };
  }
}
