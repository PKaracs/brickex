"use server";

import { listProjectsForOrganization } from "@/lib/data/projects";
import { requireWorkspaceContext } from "@/lib/auth-guard";

export async function listCompletedProjects(): Promise<
  { projects: any[] } | { error: string }
> {
  try {
    const { organizationId } = await requireWorkspaceContext();
    const projects = await listProjectsForOrganization(organizationId);
    return {
      projects: projects.filter((project) => project.status === "complete"),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list projects";
    return { error: message };
  }
}
