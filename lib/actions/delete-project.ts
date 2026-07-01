"use server";

import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import * as schema from "@/db/schema";
import { requireWorkspaceContext } from "@/lib/auth-guard";

export async function deleteProject(
  projectId: string,
): Promise<{ success: boolean } | { error: string }> {
  try {
    const { organizationId, userId } = await requireWorkspaceContext();

    const [project] = await db
      .update(schema.projects)
      .set({
        status: "archived",
        archivedAt: new Date(),
        updatedByUserId: userId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.projects.id, projectId),
          eq(schema.projects.organizationId, organizationId),
        ),
      )
      .returning({ id: schema.projects.id });

    if (!project) {
      return { error: "Proyecto no encontrado" };
    }

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo eliminar el proyecto";
    return { error: message };
  }
}
