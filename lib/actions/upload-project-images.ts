"use server";

export async function uploadProjectImages(
  projectId: string,
  formData: FormData
): Promise<{ storageKeys: string[] } | { error: string }> {
  return { storageKeys: [] };
}
