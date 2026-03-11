/**
 * Project images service - direct Supabase Storage upload for large mobile photos.
 *
 * Flow:
 * 1) Setup → get signed upload URLs
 * 2) PUT files directly to Supabase Storage
 * 3) Confirm → create DB records + set project sourceType=upload
 */

import { compressImages } from "@/lib/image-utils";

export interface UploadProjectImagesResult {
  success: boolean;
  storageKeys?: string[];
  error?: string;
}

export async function uploadProjectImagesDirect(
  projectId: string,
  files: File[]
): Promise<UploadProjectImagesResult> {
  try {
    if (!projectId) return { success: false, error: "Missing project ID" };
    if (!files || files.length === 0)
      return { success: false, error: "No images provided" };

    const compressedFiles = await compressImages(files);

    const setupRes = await fetch("/api/projects/images/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, fileCount: compressedFiles.length }),
    });

    if (!setupRes.ok) {
      const data = await setupRes.json().catch(() => ({}));
      return {
        success: false,
        error:
          setupRes.status === 401
            ? "Session expired. Please refresh."
            : data.error || "Failed to start upload",
      };
    }

    const setupData: { uploadUrls?: { url: string; storageKey: string }[] } =
      await setupRes.json();

    if (
      !setupData.uploadUrls ||
      setupData.uploadUrls.length !== compressedFiles.length
    ) {
      return { success: false, error: "Upload setup failed" };
    }

    type UploadOk = {
      ok: true;
      storageKey: string;
      name: string;
      size: number;
      type: string;
    };
    type UploadFail = { ok: false; storageKey: string };

    const uploads: Array<UploadOk | UploadFail> = await Promise.all(
      compressedFiles.map(async (file, i) => {
        const { url, storageKey } = setupData.uploadUrls![i];
        try {
          const res = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": file.type || "application/octet-stream" },
            body: file,
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return {
            ok: true as const,
            storageKey,
            name: file.name,
            size: file.size,
            type: file.type || "application/octet-stream",
          };
        } catch (err) {
          console.error("[ProjectImagesService] Upload failed:", err);
          return { ok: false as const, storageKey };
        }
      })
    );

    const failed = uploads.filter((u) => !u.ok);
    if (failed.length > 0) {
      return { success: false, error: `${failed.length} upload(s) failed` };
    }

    const confirmRes = await fetch("/api/projects/images/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        files: uploads
          .filter((u): u is UploadOk => u.ok)
          .map((u) => ({
            storageKey: u.storageKey,
            name: u.name,
            size: u.size,
            type: u.type,
          })),
      }),
    });

    if (!confirmRes.ok) {
      const data = await confirmRes.json().catch(() => ({}));
      return { success: false, error: data.error || "Confirm failed" };
    }

    const confirmData: { storageKeys?: string[] } = await confirmRes.json();
    const storageKeys =
      confirmData.storageKeys || setupData.uploadUrls.map((u) => u.storageKey);

    return { success: true, storageKeys };
  } catch (error) {
    console.error("[ProjectImagesService] Error:", error);
    return { success: false, error: "Network error. Please try again." };
  }
}
