"use server";

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
  projectId: string
): Promise<{ project: any } | { error: string }> {
  return {
    project: {
      id: projectId,
      userId: "mock-user-dev",
      sourceType: "avatar",
      status: "draft",
      templateId: null,
      prompt: null,
      negativePrompt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
}

export async function getProjectLatestOutputUrl(
  projectId: string
): Promise<string | null> {
  return null;
}

export async function getProjectLatestOutput(
  projectId: string
): Promise<ProjectOutputWithFlex> {
  return { url: null, flexWorth: null, flexBreakdown: null };
}

export async function getGenerationPrompt(
  generationId: string
): Promise<string | null> {
  return null;
}

export async function getProjectGenerationStatus(
  projectId: string
): Promise<ProjectGenerationState> {
  return { status: "idle", generationId: null };
}
