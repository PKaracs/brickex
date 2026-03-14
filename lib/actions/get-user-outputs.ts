"use server";

import { and, count, desc, eq, inArray, isNull, or, sql } from "drizzle-orm";

import * as schema from "@/db/schema";
import { requireWorkspaceContext } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { getSignedDownloadUrl, toStorageKey } from "@/lib/storage";

export interface GalleryImage {
  id: string;
  url: string;
  createdAt: string;
  projectId: string;
  mode?: string;
  prompt?: string;
  mediaType?: string;
}

export interface PaginatedGalleryResult {
  images: GalleryImage[];
  totalCount: number;
  hasMore: boolean;
  nextOffset: number;
}

export interface GalleryProjectOriginal {
  id: string;
  url: string;
  createdAt: string;
  filename?: string;
}

export interface GalleryProjectVariation {
  id: string;
  url: string;
  createdAt: string;
  projectId: string;
  mode?: string;
  prompt?: string;
  title?: string;
  mediaType?: string;
}

export interface GalleryProjectStack {
  projectId: string;
  title: string;
  slug: string;
  latestCreatedAt: string;
  variationCount: number;
  modeIds: string[];
  original: GalleryProjectOriginal | null;
  variations: GalleryProjectVariation[];
}

export interface PaginatedGalleryProjectResult {
  projects: GalleryProjectStack[];
  totalProjectCount: number;
  totalRenderCount: number;
  hasMore: boolean;
  nextOffset: number;
}

function renderAssetConditions(organizationId: string) {
  return and(
    eq(schema.deliverables.organizationId, organizationId),
    or(
      and(eq(schema.assets.mediaType, "image"), eq(schema.assets.assetKind, "render_image")),
      and(eq(schema.assets.mediaType, "video"), eq(schema.assets.assetKind, "render_video")),
    ),
    eq(schema.assets.status, "ready"),
    isNull(schema.assets.deletedAt),
  );
}

async function fetchGalleryRows(offset = 0, limit = 8) {
  const { organizationId } = await requireWorkspaceContext();

  const conditions = renderAssetConditions(organizationId);

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        assetId: schema.assets.id,
        projectId: schema.deliverables.projectId,
        createdAt: schema.deliverables.createdAt,
        bucket: schema.assets.bucket,
        path: schema.assets.path,
        prompt: schema.toolRuns.prompt,
        metadata: schema.deliverables.metadata,
        mediaType: schema.assets.mediaType,
      })
      .from(schema.deliverables)
      .innerJoin(schema.assets, eq(schema.deliverables.assetId, schema.assets.id))
      .leftJoin(schema.toolRuns, eq(schema.deliverables.toolRunId, schema.toolRuns.id))
      .where(conditions)
      .orderBy(desc(schema.deliverables.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(schema.deliverables)
      .innerJoin(schema.assets, eq(schema.deliverables.assetId, schema.assets.id))
      .where(conditions),
  ]);

  return {
    rows,
    totalCount: totalRows[0]?.total ?? 0,
  };
}

function extractMode(metadata: Record<string, unknown> | null | undefined) {
  const mode = metadata?.mode;
  return typeof mode === "string" ? mode : undefined;
}

function normalizeCount(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  if (typeof value === "string") {
    return Number.parseInt(value, 10);
  }

  return 0;
}

function toIsoDateString(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return new Date(0).toISOString();
}

export async function getUserProjectStacksPaginated(
  offset = 0,
  limit = 12,
): Promise<PaginatedGalleryProjectResult | { error: string }> {
  try {
    const { organizationId } = await requireWorkspaceContext();
    const safeOffset = Math.max(0, offset);
    const safeLimit = Math.min(Math.max(1, limit), 48);

    const latestDeliverablesByProject = db
      .select({
        projectId: schema.deliverables.projectId,
        latestCreatedAt:
          sql<Date>`max(${schema.deliverables.createdAt})`.as("latest_created_at"),
      })
      .from(schema.deliverables)
      .innerJoin(schema.assets, eq(schema.deliverables.assetId, schema.assets.id))
      .where(renderAssetConditions(organizationId))
      .groupBy(schema.deliverables.projectId)
      .as("latest_deliverables_by_project");

    const [projectRows, counts] = await Promise.all([
      db
        .select({
          projectId: latestDeliverablesByProject.projectId,
          latestCreatedAt: latestDeliverablesByProject.latestCreatedAt,
          title: schema.projects.title,
          slug: schema.projects.slug,
        })
        .from(latestDeliverablesByProject)
        .innerJoin(
          schema.projects,
          eq(schema.projects.id, latestDeliverablesByProject.projectId),
        )
        .orderBy(desc(latestDeliverablesByProject.latestCreatedAt))
        .limit(safeLimit)
        .offset(safeOffset),
      db
        .select({
          totalProjects:
            sql<number>`count(distinct ${schema.deliverables.projectId})`.as(
              "total_projects",
            ),
          totalRenders: count(),
        })
        .from(schema.deliverables)
        .innerJoin(schema.assets, eq(schema.deliverables.assetId, schema.assets.id))
        .where(renderAssetConditions(organizationId)),
    ]);

    const projectIds = projectRows.map((row) => row.projectId);

    if (projectIds.length === 0) {
      return {
        projects: [],
        totalProjectCount: normalizeCount(counts[0]?.totalProjects),
        totalRenderCount: normalizeCount(counts[0]?.totalRenders),
        hasMore: false,
        nextOffset: safeOffset,
      };
    }

    const [variationRows, originalRows] = await Promise.all([
      db
        .select({
          projectId: schema.deliverables.projectId,
          assetId: schema.assets.id,
          createdAt: schema.deliverables.createdAt,
          bucket: schema.assets.bucket,
          path: schema.assets.path,
          prompt: schema.toolRuns.prompt,
          metadata: schema.deliverables.metadata,
          title: schema.deliverables.title,
          mediaType: schema.assets.mediaType,
        })
        .from(schema.deliverables)
        .innerJoin(schema.assets, eq(schema.deliverables.assetId, schema.assets.id))
        .leftJoin(schema.toolRuns, eq(schema.deliverables.toolRunId, schema.toolRuns.id))
        .where(
          and(
            renderAssetConditions(organizationId),
            inArray(schema.deliverables.projectId, projectIds),
          ),
        )
        .orderBy(desc(schema.deliverables.createdAt)),
      db
        .select({
          projectId: schema.assets.projectId,
          assetId: schema.assets.id,
          createdAt: schema.assets.createdAt,
          bucket: schema.assets.bucket,
          path: schema.assets.path,
          filename: schema.assets.originalFilename,
        })
        .from(schema.assets)
        .where(
          and(
            eq(schema.assets.organizationId, organizationId),
            inArray(schema.assets.projectId, projectIds),
            or(
              eq(schema.assets.assetKind, "source_image"),
              eq(schema.assets.assetKind, "reference_image"),
            ),
            eq(schema.assets.mediaType, "image"),
            eq(schema.assets.status, "ready"),
            isNull(schema.assets.deletedAt),
          ),
        )
        .orderBy(desc(schema.assets.createdAt)),
    ]);

    const signedVariations = await Promise.all(
      variationRows.map(async (row) => ({
        projectId: row.projectId,
        variation: {
          id: row.assetId,
          url: await getSignedDownloadUrl(toStorageKey(row.bucket, row.path)),
          createdAt: toIsoDateString(row.createdAt),
          projectId: row.projectId,
          mode: extractMode(row.metadata as Record<string, unknown> | null | undefined),
          prompt: row.prompt ?? undefined,
          title: row.title,
          mediaType: row.mediaType ?? "image",
        } satisfies GalleryProjectVariation,
      })),
    );

    const signedOriginals = await Promise.all(
      originalRows.map(async (row) => ({
        projectId: row.projectId!,
        original: {
          id: row.assetId,
          url: await getSignedDownloadUrl(toStorageKey(row.bucket, row.path)),
          createdAt: toIsoDateString(row.createdAt),
          filename: row.filename ?? undefined,
        } satisfies GalleryProjectOriginal,
      })),
    );

    const variationsByProject = new Map<string, GalleryProjectVariation[]>();
    for (const row of signedVariations) {
      const existing = variationsByProject.get(row.projectId) ?? [];
      existing.push(row.variation);
      variationsByProject.set(row.projectId, existing);
    }

    const originalByProject = new Map<string, GalleryProjectOriginal>();
    for (const row of signedOriginals) {
      if (!originalByProject.has(row.projectId)) {
        originalByProject.set(row.projectId, row.original);
      }
    }

    const projects: GalleryProjectStack[] = projectRows.map((row) => {
      const variations = variationsByProject.get(row.projectId) ?? [];
      const modeIds = Array.from(
        new Set(variations.map((variation) => variation.mode).filter(Boolean)),
      ) as string[];

      return {
        projectId: row.projectId,
        title: row.title,
        slug: row.slug,
        latestCreatedAt: toIsoDateString(row.latestCreatedAt),
        variationCount: variations.length,
        modeIds,
        original: originalByProject.get(row.projectId) ?? null,
        variations,
      };
    });

    const totalProjectCount = normalizeCount(counts[0]?.totalProjects);
    const totalRenderCount = normalizeCount(counts[0]?.totalRenders);

    return {
      projects,
      totalProjectCount,
      totalRenderCount,
      hasMore: safeOffset + projects.length < totalProjectCount,
      nextOffset: safeOffset + projects.length,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load project stacks";
    return { error: message };
  }
}

export async function getUserLatestOutput(): Promise<
  { url: string } | { error: string } | null
> {
  try {
    const result = await getUserOutputsPaginated(0, 1);
    if ("error" in result) {
      return result;
    }

    const latest = result.images[0];
    if (!latest) return null;

    return { url: latest.url };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load latest output";
    return { error: message };
  }
}

export async function getUserOutputs(): Promise<
  { images: GalleryImage[] } | { error: string }
> {
  try {
    const result = await getUserOutputsPaginated(0, 100);
    if ("error" in result) {
      return result;
    }

    return { images: result.images };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load outputs";
    return { error: message };
  }
}

export async function getUserOutputsPaginated(
  offset = 0,
  limit = 8
): Promise<PaginatedGalleryResult | { error: string }> {
  try {
    const safeOffset = Math.max(0, offset);
    const safeLimit = Math.min(Math.max(1, limit), 100);
    const { rows, totalCount } = await fetchGalleryRows(safeOffset, safeLimit);

    const images = await Promise.all(
      rows.map(async (row) => ({
        id: row.assetId,
        url: await getSignedDownloadUrl(toStorageKey(row.bucket, row.path)),
        createdAt: row.createdAt.toISOString(),
        projectId: row.projectId,
        mode: extractMode(row.metadata as Record<string, unknown> | null | undefined),
        prompt: row.prompt ?? undefined,
        mediaType: row.mediaType ?? "image",
      })),
    );

    return {
      images,
      totalCount,
      hasMore: safeOffset + images.length < totalCount,
      nextOffset: safeOffset + images.length,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load outputs";
    return { error: message };
  }
}

export async function deleteUserOutput(
  outputId: string
): Promise<{ success: true } | { error: string }> {
  try {
    const { organizationId, userId } = await requireWorkspaceContext();

    const asset = await db.query.assets.findFirst({
      where: and(
        eq(schema.assets.id, outputId),
        eq(schema.assets.organizationId, organizationId),
        isNull(schema.assets.deletedAt),
      ),
      columns: {
        id: true,
        projectId: true,
      },
    });

    if (!asset) {
      return { error: "Output not found" };
    }

    await db
      .update(schema.assets)
      .set({
        status: "deleted",
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.assets.id, asset.id));

    await db
      .update(schema.deliverables)
      .set({
        status: "archived",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.deliverables.assetId, asset.id),
          eq(schema.deliverables.organizationId, organizationId),
        ),
      );

    if (asset.projectId) {
      const fallbackDeliverable = await db.query.deliverables.findFirst({
        where: and(
          eq(schema.deliverables.projectId, asset.projectId),
          eq(schema.deliverables.organizationId, organizationId),
        ),
        with: {
          asset: true,
        },
        orderBy: (deliverables, { desc }) => [desc(deliverables.createdAt)],
      });

      await db
        .update(schema.projects)
        .set({
          heroAssetId:
            fallbackDeliverable?.asset && !fallbackDeliverable.asset.deletedAt
              ? fallbackDeliverable.asset.id
              : null,
          updatedByUserId: userId,
          updatedAt: new Date(),
        })
        .where(eq(schema.projects.id, asset.projectId));
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete output";
    return { error: message };
  }
}
