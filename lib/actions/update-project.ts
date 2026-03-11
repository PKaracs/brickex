"use server";

export async function updateProject(
  projectId: string,
  input: Record<string, any>
): Promise<{ project: any } | { error: string }> {
  return {
    project: {
      id: projectId,
      userId: "mock-user-dev",
      ...input,
      updatedAt: new Date(),
    },
  };
}
