"use server";

export async function generateImage(
  projectId: string
): Promise<any> {
  return { error: "Generation not available in development mode" };
}
