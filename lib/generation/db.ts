export async function getProjectWithRelations(
  projectId: string,
  userId: string
): Promise<any> {
  return null;
}

export async function createGeneration(projectId: string) {
  return { id: "mock-gen" };
}

export async function setGenerationRunning(generationId: string, prompt: string) {}
export async function setGenerationSucceeded(generationId: string, inputImageCount: number) {}
export async function setGenerationFailed(generationId: string, errorMessage: string) {}

export function generateFlexWorth(
  projectObjects?: { objectId?: string | null; objectName: string | null }[]
): { total: number; breakdown: Record<string, number> } {
  return { total: 0, breakdown: {} };
}

export async function createOutput(
  generationId: string,
  projectId: string,
  storageKey: string,
  projectObjects?: { objectId?: string | null; objectName: string | null }[]
): Promise<{ flexWorth: number; flexBreakdown: Record<string, number> }> {
  return { flexWorth: 0, flexBreakdown: {} };
}

export async function updateProjectStatus(
  projectId: string,
  status: "draft" | "processing" | "complete" | "failed"
) {}
