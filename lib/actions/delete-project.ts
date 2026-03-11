"use server";

export async function deleteProject(
  projectId: string
): Promise<{ success: boolean } | { error: string }> {
  return { success: true };
}
