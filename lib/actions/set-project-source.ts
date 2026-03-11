"use server";

export async function setProjectSource(
  projectId: string,
  sourceType: "avatar" | "upload"
): Promise<{ success: boolean } | { error: string }> {
  return { success: true };
}
