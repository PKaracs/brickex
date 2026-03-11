"use server";

export interface CreateProjectInput {
  sourceType?: string;
}

export async function createProject(
  input?: CreateProjectInput
): Promise<{ projectId: string } | { error: string }> {
  return { projectId: "mock-project-1" };
}

export async function getLatestProject(): Promise<
  { project: any } | { error: string; noProject?: boolean }
> {
  return {
    project: {
      id: "mock-project-1",
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
