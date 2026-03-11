/**
 * Avatar service - direct Supabase upload for speed.
 * Only 2 API calls: setup → direct upload → confirm
 */

export interface SetupAvatarResult {
  success: boolean;
  avatarId?: string;
  uploadUrls?: { url: string; storageKey: string }[];
  error?: string;
}

export interface UploadAvatarResult {
  success: boolean;
  error?: string;
}

/**
 * Setup avatar and get upload URLs in one call.
 * Creates new avatar or replaces existing (deletes old images).
 */
export async function setupAvatar(
  fileCount: number
): Promise<SetupAvatarResult> {
  try {
    const response = await fetch("/api/avatars/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileCount }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return {
        success: false,
        error:
          response.status === 401
            ? "Session expired. Please refresh."
            : data.error || "Failed to set up avatar",
      };
    }

    const data = await response.json();
    return {
      success: true,
      avatarId: data.avatarId,
      uploadUrls: data.uploadUrls,
    };
  } catch (error) {
    console.error("[AvatarService] setupAvatar error:", error);
    return { success: false, error: "Network error. Please try again." };
  }
}

/**
 * Full avatar upload flow:
 * 1. Setup avatar + get signed URLs (one API call)
 * 2. Upload directly to Supabase (parallel, fast)
 * 3. Confirm uploads (one API call)
 */
export async function uploadAvatarImages(
  files: File[]
): Promise<UploadAvatarResult & { avatarId?: string }> {
  const startTime = Date.now();
  console.log(`[AvatarService] Starting upload of ${files.length} files`);

  try {
    // Step 1: Setup avatar + get upload URLs (one call)
    const setup = await setupAvatar(files.length);
    if (!setup.success || !setup.avatarId || !setup.uploadUrls) {
      return { success: false, error: setup.error || "Setup failed" };
    }

    console.log(
      `[AvatarService] Setup done in ${Date.now() - startTime}ms, avatarId: ${setup.avatarId}`
    );

    // Step 2: Upload directly to Supabase in parallel
    const uploadStart = Date.now();
    const results = await Promise.all(
      files.map(async (file, i) => {
        const { url, storageKey } = setup.uploadUrls![i];

        try {
          const res = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "image/jpeg" },
            body: file,
          });

          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return { ok: true, storageKey, name: file.name, size: file.size };
        } catch (err) {
          console.error(`[AvatarService] Upload ${i} failed:`, err);
          return { ok: false, storageKey, name: file.name, size: file.size };
        }
      })
    );

    console.log(
      `[AvatarService] Uploads done in ${Date.now() - uploadStart}ms`
    );

    const failed = results.filter((r) => !r.ok);
    if (failed.length > 0) {
      return { success: false, error: `${failed.length} upload(s) failed` };
    }

    // Step 3: Confirm uploads
    const confirmRes = await fetch("/api/avatars/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        avatarId: setup.avatarId,
        files: results.map((r) => ({
          storageKey: r.storageKey,
          name: r.name,
          size: r.size,
        })),
      }),
    });

    if (!confirmRes.ok) {
      const data = await confirmRes.json().catch(() => ({}));
      return { success: false, error: data.error || "Confirm failed" };
    }

    console.log(`[AvatarService] Total time: ${Date.now() - startTime}ms`);
    return { success: true, avatarId: setup.avatarId };
  } catch (error) {
    console.error("[AvatarService] Error:", error);
    return { success: false, error: "Network error. Please try again." };
  }
}
