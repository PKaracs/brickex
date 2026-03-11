export async function downloadFromStorage(
  storageKey: string
): Promise<Buffer | null> {
  return null;
}

export async function uploadToStorage(
  storageKey: string,
  data: Buffer,
  contentType = "image/png"
): Promise<{ success: true } | { error: string }> {
  return { error: "Storage not available in development mode" };
}

export async function getSignedUrl(
  storageKey: string,
  expiresIn = 86400
): Promise<string | null> {
  return null;
}

export class NsfwContentError extends Error {
  constructor(message: string = "NSFW content detected") {
    super(message);
    this.name = "NsfwContentError";
  }
}
