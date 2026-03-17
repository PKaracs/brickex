import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createAvatar,
  fetchUserAvatar,
  removeAvatarImage,
} from "@/app/lib/actions/avatar";

// Max 3 images - quality over quantity for AI face generation
export const MAX_AVATAR_IMAGES = 3;

// Timeout wrapper for async operations (helps with iOS freezing)
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Operation timed out"));
    }, ms);

    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// Process image for upload - MAXIMUM QUALITY for best appearance
// Only resizes if absolutely necessary to prevent memory issues
// Uses 100% quality JPEG for maximum detail
async function compressImage(file: File, maxSizeMB = 1): Promise<File> {
  // Skip processing for small files - upload original for maximum quality
  if (file.size <= maxSizeMB * 1024 * 1024) {
    return file;
  }

  // Detect iOS - use more conservative settings to prevent freezing
  const isIOS =
    typeof navigator !== "undefined" &&
    /iPhone|iPad|iPod/.test(navigator.userAgent);

  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    // Cleanup function to revoke object URL
    let objectUrl: string | null = null;
    const cleanup = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      }
    };

    // Set a timeout for the entire processing operation
    const timeoutMs = isIOS ? 20000 : 40000; // Longer timeout for quality processing
    const timeout = setTimeout(() => {
      console.warn("Image processing timed out, using original file");
      cleanup();
      resolve(file);
    }, timeoutMs);

    if (!ctx) {
      clearTimeout(timeout);
      resolve(file);
      return;
    }

    img.onload = () => {
      try {
        // Increased max dimensions for maximum quality
        // Only resize if image is extremely large to prevent memory issues
        const maxDim = isIOS ? 3072 : 4096; // Much higher limits for quality
        let { width, height } = img;

        // Only resize if absolutely necessary (very large images)
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = (height / width) * maxDim;
            width = maxDim;
          } else {
            width = (width / height) * maxDim;
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // 100% QUALITY - Maximum appearance, no quality loss
        const quality = 1.0;

        canvas.toBlob(
          (blob) => {
            clearTimeout(timeout);
            cleanup();
            if (blob) {
              resolve(new File([blob], file.name, { type: "image/jpeg" }));
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          quality
        );
      } catch (err) {
        console.error("Canvas processing error:", err);
        clearTimeout(timeout);
        cleanup();
        resolve(file);
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      cleanup();
      resolve(file);
    };

    // Create object URL and start loading
    objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
  });
}

export type ExistingImage = {
  id: string;
  url: string;
  storageKey: string;
};

export type ImageItem =
  | { type: "existing"; id: string; url: string; storageKey: string }
  | { type: "new"; id: string; url: string; file: File };

interface UseAvatarUploadOptions {
  onSuccess?: () => void;
  onClose: () => void;
}

export function useAvatarUpload({
  onSuccess,
  onClose,
}: UseAvatarUploadOptions) {
  const router = useRouter();

  // State
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [existingAvatarId, setExistingAvatarId] = useState<string | null>(null);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Derived state
  const totalImages = existingImages.length + newFiles.length;
  // remainingSlots can be negative if user has more than MAX (existing users with 6 images)
  // Use Math.max(0, ...) to prevent issues, but they can still USE all their existing images
  const remainingSlots = Math.max(0, MAX_AVATAR_IMAGES - totalImages);
  const hasExistingAvatar = existingImages.length > 0;
  const isBusy = isUploading || deletingImageId !== null;

  // Check if current image can be deleted (must keep at least one existing image)
  // Users can delete new (pending) files freely, but need at least one existing avatar image
  const canDeleteCurrentImage = (() => {
    const allImagesLocal: ImageItem[] = [
      ...existingImages.map((img) => ({ type: "existing" as const, ...img })),
      ...newFiles.map((file, i) => ({
        type: "new" as const,
        id: `new-${i}`,
        url: URL.createObjectURL(file),
        file,
      })),
    ];
    const currentImg = allImagesLocal[carouselIndex] ?? null;

    if (!currentImg) return false;

    // If it's a new file (not uploaded yet), allow deletion
    if (currentImg.type === "new") return true;

    // For existing images, only allow deletion if there's more than one existing image
    // OR if there are new files that will be uploaded (user is adding replacements)
    return existingImages.length > 1 || newFiles.length > 0;
  })();

  const allImages: ImageItem[] = [
    ...existingImages.map((img) => ({ type: "existing" as const, ...img })),
    ...newFiles.map((file, i) => ({
      type: "new" as const,
      id: `new-${i}`,
      url: URL.createObjectURL(file),
      file,
    })),
  ];

  const currentImage = allImages[carouselIndex] ?? null;

  // Actions
  const loadAvatar = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchUserAvatar();
      if (result.avatar) {
        setExistingAvatarId(result.avatar.id);
        setExistingImages(
          result.avatar.images.map((img) => ({
            id: img.id,
            url: img.url,
            storageKey: img.storageKey,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load avatar:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addFiles = useCallback(
    (files: File[]) => {
      setError(null);
      const filesToAdd = files
        .filter((f) => f.type.startsWith("image/"))
        .slice(0, remainingSlots);

      if (filesToAdd.length > 0) {
        setNewFiles((prev) => [...prev, ...filesToAdd]);
      }
    },
    [remainingSlots]
  );

  const removeNewFile = useCallback(
    (index: number) => {
      setNewFiles((prev) => {
        const updated = prev.filter((_, i) => i !== index);
        const newTotal = existingImages.length + updated.length;

        if (carouselIndex >= newTotal && newTotal > 0) {
          setCarouselIndex(newTotal - 1);
        } else if (newTotal === 0) {
          setCarouselIndex(0);
        }

        return updated;
      });
    },
    [existingImages.length, carouselIndex]
  );

  const deleteExistingImage = useCallback(
    async (imageId: string) => {
      // Frontend check: prevent deleting the last existing image
      if (existingImages.length <= 1 && newFiles.length === 0) {
        setError(
          "Cannot delete the last avatar image. You must keep at least one image."
        );
        return;
      }

      setDeletingImageId(imageId);
      setError(null);

      try {
        const result = await removeAvatarImage(imageId);
        if ("error" in result) throw new Error((result as any).error);

        setExistingImages((prev) => {
          const updated = prev.filter((img) => img.id !== imageId);
          const newTotal = updated.length + newFiles.length;

          if (carouselIndex >= newTotal && newTotal > 0) {
            setCarouselIndex(newTotal - 1);
          } else if (newTotal === 0) {
            setCarouselIndex(0);
          }

          return updated;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete image");
      } finally {
        setDeletingImageId(null);
      }
    },
    [newFiles.length, carouselIndex, existingImages.length]
  );

  const removeCurrentImage = useCallback(() => {
    if (!currentImage) return;

    // Check if deletion is allowed
    if (!canDeleteCurrentImage) {
      setError(
        "Cannot delete the last avatar image. Add a new image first or keep at least one."
      );
      return;
    }

    if (currentImage.type === "existing") {
      deleteExistingImage(currentImage.id);
    } else {
      const newFileIndex = carouselIndex - existingImages.length;
      removeNewFile(newFileIndex);
    }
  }, [
    currentImage,
    carouselIndex,
    existingImages.length,
    deleteExistingImage,
    removeNewFile,
    canDeleteCurrentImage,
  ]);

  const uploadNewImages = useCallback(async () => {
    if (newFiles.length === 0 || isUploading) return;

    setIsUploading(true);
    setError(null);

    try {
      // Compress images with timeout protection
      const compressedFiles = await Promise.all(
        newFiles.map((file) =>
          withTimeout(compressImage(file), 20000).catch(() => file)
        )
      );

      let avatarId = existingAvatarId;

      if (!avatarId) {
        const result = await createAvatar();
        if ("error" in result || !result.avatarId) {
          throw new Error(("error" in result ? (result as any).error : null) || "Failed to create avatar");
        }
        avatarId = result.avatarId;
      }

      const formData = new FormData();
      formData.append("avatarId", avatarId);
      compressedFiles.forEach((file, i) => formData.append(`image_${i}`, file));

      // Fetch with 60 second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      let response: Response;
      try {
        response = await fetch("/api/avatars/upload", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (err) {
        clearTimeout(timeoutId);
        if (err instanceof Error && err.name === "AbortError") {
          throw new Error("Upload timeout - please try again");
        }
        throw err;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload images");
      }

      onClose();
      onSuccess?.();
      router.push("/dashboard/new");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsUploading(false);
    }
  }, [newFiles, existingAvatarId, isUploading, onClose, onSuccess, router]);

  const reset = useCallback(() => {
    setNewFiles([]);
    setExistingImages([]);
    setExistingAvatarId(null);
    setCarouselIndex(0);
    setError(null);
  }, []);

  const goToImage = useCallback((index: number) => {
    setCarouselIndex(index);
  }, []);

  const nextImage = useCallback(() => {
    if (allImages.length > 0) {
      setCarouselIndex((prev) => (prev + 1) % allImages.length);
    }
  }, [allImages.length]);

  const prevImage = useCallback(() => {
    if (allImages.length > 0) {
      setCarouselIndex(
        (prev) => (prev - 1 + allImages.length) % allImages.length
      );
    }
  }, [allImages.length]);

  return {
    // State
    allImages,
    currentImage,
    carouselIndex,
    totalImages,
    remainingSlots,
    hasExistingAvatar,
    newFilesCount: newFiles.length,
    error,
    canDeleteCurrentImage,

    // Loading states
    isLoading,
    isUploading,
    deletingImageId,
    isBusy,

    // Actions
    loadAvatar,
    addFiles,
    removeCurrentImage,
    uploadNewImages,
    reset,
    goToImage,
    nextImage,
    prevImage,
    setError,
  };
}
