"use server";

import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import * as schema from "@/db/schema";
import { requireWorkspaceContext } from "@/lib/auth-guard";

const ALLOWED_UPDATE_KEYS = new Set([
  "title",
  "description",
  "status",
  "sourceType",
  "templateId",
  "customPrompt",
  "settings",
  "addressLine1",
  "city",
  "region",
  "postalCode",
  "countryCode",
  "latitude",
  "longitude",
  "heroAssetId",
  "latestRunId",
]);

export async function updateProject(
  projectId: string,
  input: Record<string, any>,
): Promise<{ project: any } | { error: string }> {
  try {
    const { organizationId, userId } = await requireWorkspaceContext();
    const patch = Object.fromEntries(
      Object.entries(input).filter(([key]) => ALLOWED_UPDATE_KEYS.has(key)),
    );

    const [project] = await db
      .update(schema.projects)
      .set({
        ...patch,
        updatedByUserId: userId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.projects.id, projectId),
          eq(schema.projects.organizationId, organizationId),
        ),
      )
      .returning();

    if (!project) {
      return { error: "Proyecto no encontrado" };
    }

    return { project };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo actualizar el proyecto";
    return { error: message };
  }
}
