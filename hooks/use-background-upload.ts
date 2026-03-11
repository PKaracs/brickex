"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  getPendingUpload,
  clearPendingUpload,
  markUploadStarted,
  isIndexedDBAvailable,
} from "@/lib/upload-queue";
import { uploadAvatarImages } from "@/lib/avatar-service";
import { seline } from "@/lib/seline";

function haptic(type: "success" | "error") {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(type === "success" ? [25, 50, 25] : [50, 100, 50]);
    }
  } catch {
    // Ignore
  }
}

let uploadInProgress = false;

interface UseBackgroundUploadResult {
  isUploading: boolean;
  uploadComplete: boolean;
  triggerUpload: () => void;
}

/**
 * Background avatar upload hook.
 * Picks up compressed files from IndexedDB and uploads them.
 */
export function useBackgroundUpload(): UseBackgroundUploadResult {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const hasStarted = useRef(false);

  const processUpload = useCallback(async (force = false) => {
    if (uploadInProgress) return;
    if (hasStarted.current && !force) return;
    if (!isIndexedDBAvailable()) return;

    const files = await getPendingUpload();
    if (!files) return;

    hasStarted.current = true;
    uploadInProgress = true;
    await markUploadStarted();

    console.log(`[BackgroundUpload] Starting upload of ${files.length} files`);

    setIsUploading(true);
    const toastId = "avatar-upload";

    await new Promise((r) => setTimeout(r, 100));
    toast.loading("Uploading your photos...", { id: toastId });

    try {
      const start = Date.now();
      const result = await uploadAvatarImages(files);

      if (!result.success) {
        throw new Error(result.error || "Upload failed");
      }

      console.log(`[BackgroundUpload] Done in ${Date.now() - start}ms`);
      await clearPendingUpload();

      // Track onboarding completion in Seline
      seline.onboarding.completed(files.length);

      toast.success("Avatar ready! You can generate now.", {
        id: toastId,
        duration: 3000,
      });
      haptic("success");
      setUploadComplete(true);
    } catch (error) {
      console.error("[BackgroundUpload] Failed:", error);
      toast.error("Upload failed. Refresh to try again.", {
        id: toastId,
        duration: 5000,
      });
      haptic("error");
    } finally {
      setIsUploading(false);
      uploadInProgress = false;
    }
  }, []);

  useEffect(() => {
    processUpload();
  }, [processUpload]);

  const triggerUpload = useCallback(() => {
    processUpload(true);
  }, [processUpload]);

  return { isUploading, uploadComplete, triggerUpload };
}
