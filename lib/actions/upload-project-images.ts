"use server";

export async function uploadProjectImages(
  projectId: string,
  formData: FormData,
): Promise<{ storageKeys: string[] } | { error: string }> {
  const files = formData.getAll("files");

  if (!projectId) {
    return { error: "Se requiere el ID del proyecto" };
  }

  if (files.length === 0) {
    return { error: "No se proporcionaron archivos" };
  }

  return {
    error: "Usa el flujo de subida directa mediante /api/projects/images/setup y /confirm",
  };
}
