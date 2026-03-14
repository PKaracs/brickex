"use server";

import { db } from "@/lib/db";
import * as schema from "@/db/schema";
import { requireWorkspaceContext } from "@/lib/auth-guard";
import { ensureUniqueProjectSlug, getLatestProjectForOrganization } from "@/lib/data/projects";

export interface CreateProjectInput {
  sourceType?: typeof schema.projectSourceTypeEnum.enumValues[number];
  title?: string;
}

export async function createProject(
  input?: CreateProjectInput,
): Promise<{ projectId: string } | { error: string }> {
  try {
    const { organizationId, userId } = await requireWorkspaceContext();
    const title = input?.title?.trim() || "Untitled project";
    const slug = await ensureUniqueProjectSlug(organizationId, title);

    const [project] = await db
      .insert(schema.projects)
      .values({
        organizationId,
        createdByUserId: userId,
        updatedByUserId: userId,
        title,
        slug,
        sourceType: input?.sourceType ?? "upload",
        status: "draft",
      })
      .returning({ id: schema.projects.id });

    await db.insert(schema.projectVersions).values({
      projectId: project.id,
      versionNumber: 1,
      createdByUserId: userId,
      label: "Initial brief",
      config: {
        sourceType: input?.sourceType ?? "upload",
      },
    });

    return { projectId: project.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create project";
    return { error: message };
  }
}

export async function getLatestProject(): Promise<
  { project: any } | { error: string; noProject?: boolean }
> {
  try {
    const { organizationId } = await requireWorkspaceContext();
    const project = await getLatestProjectForOrganization(organizationId);

    if (!project) {
      return { error: "No project found", noProject: true };
    }

    return { project };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load project";
    return { error: message };
  }
}
