"use server";

export async function setProjectTemplate(
  projectId: string,
  templateId: string | null
): Promise<{ success: boolean } | { error: string }> {
  return { success: true };
}

export async function setProjectObjects(
  projectId: string,
  objects: any[]
): Promise<{ success: boolean } | { error: string }> {
  return { success: true };
}
