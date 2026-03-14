"use server";

export async function uploadProjectImages(
  projectId: string,
  formData: FormData,
): Promise<{ storageKeys: string[] } | { error: string }> {
  const files = formData.getAll("files");

  if (!projectId) {
    return { error: "Project ID is required" };
  }

  if (files.length === 0) {
    return { error: "No files provided" };
  }

  return {
    error: "Use the direct upload flow via /api/projects/images/setup and /confirm",
  };
}
