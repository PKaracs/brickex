import "server-only";

import { and, desc, eq, isNull } from "drizzle-orm";

import * as schema from "@/db/schema";
import { db } from "@/lib/db";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export async function ensureUniqueProjectSlug(
  organizationId: string,
  title: string,
) {
  const baseSlug = slugify(title) || "project";
  let slug = baseSlug;
  let suffix = 1;

  while (
    await db.query.projects.findFirst({
      where: and(
        eq(schema.projects.organizationId, organizationId),
        eq(schema.projects.slug, slug),
      ),
      columns: { id: true },
    })
  ) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  return slug;
}

export async function getProjectForOrganization(
  projectId: string,
  organizationId: string,
) {
  return db.query.projects.findFirst({
    where: and(
      eq(schema.projects.id, projectId),
      eq(schema.projects.organizationId, organizationId),
      isNull(schema.projects.archivedAt),
    ),
    with: {
      heroAsset: true,
      latestRun: true,
      deliverables: true,
      assets: true,
    },
  });
}

export async function listProjectsForOrganization(organizationId: string) {
  return db.query.projects.findMany({
    where: and(
      eq(schema.projects.organizationId, organizationId),
      isNull(schema.projects.archivedAt),
    ),
    with: {
      heroAsset: true,
      latestRun: true,
    },
    orderBy: (projects, { desc }) => [desc(projects.updatedAt)],
  });
}

/**
 * Find the most recent draft project that has never produced any output,
 * so repeated visits to /app/dashboard/new don't accumulate empty projects.
 */
export async function getReusableDraftProjectForOrganization(
  organizationId: string,
) {
  return db.query.projects.findFirst({
    where: and(
      eq(schema.projects.organizationId, organizationId),
      eq(schema.projects.status, "draft"),
      isNull(schema.projects.latestRunId),
      isNull(schema.projects.heroAssetId),
      isNull(schema.projects.archivedAt),
    ),
    columns: { id: true },
    orderBy: (projects, { desc }) => [desc(projects.createdAt)],
  });
}

export async function getLatestProjectForOrganization(organizationId: string) {
  return db.query.projects.findFirst({
    where: and(
      eq(schema.projects.organizationId, organizationId),
      isNull(schema.projects.archivedAt),
    ),
    orderBy: (projects, { desc }) => [desc(projects.updatedAt)],
  });
}
