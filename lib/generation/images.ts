export async function getFaceImages(
  userId: string,
  project: {
    sourceType: string | null;
    inputImages: { storageKey: string }[];
    advancedSettings?: Record<string, any> | null;
  }
): Promise<Buffer[]> {
  return [];
}

export async function getObjectImages(
  objects: any[]
): Promise<Buffer[]> {
  return [];
}

export async function getDefaultFreeUserBackground(): Promise<Buffer[]> {
  return [];
}
