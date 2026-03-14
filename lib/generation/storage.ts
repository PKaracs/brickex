import { downloadStorageObject, getSignedDownloadUrl, parseStorageKey, uploadBufferToStorage } from "@/lib/storage";
import { storageBuckets } from "@/lib/env";

function normalizeStorageKey(storageKey: string) {
  if (storageKey.includes("/")) {
    return storageKey;
  }

  return `${storageBuckets.generations}/${storageKey}`;
}

export async function downloadFromStorage(
  storageKey: string,
): Promise<Buffer | null> {
  try {
    return await downloadStorageObject(normalizeStorageKey(storageKey));
  } catch {
    return null;
  }
}

export async function uploadToStorage(
  storageKey: string,
  data: Buffer,
  contentType = "image/png",
): Promise<{ success: true } | { error: string }> {
  try {
    const normalized = normalizeStorageKey(storageKey);
    const { bucket, path } = parseStorageKey(normalized);
    await uploadBufferToStorage({
      bucket,
      path,
      buffer: data,
      contentType,
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Storage upload failed";
    return { error: message };
  }
}

export async function getSignedUrl(
  storageKey: string,
  expiresIn = 86400,
): Promise<string | null> {
  try {
    return await getSignedDownloadUrl(normalizeStorageKey(storageKey), expiresIn);
  } catch {
    return null;
  }
}

export class NsfwContentError extends Error {
  constructor(message = "NSFW content detected") {
    super(message);
    this.name = "NsfwContentError";
  }
}
