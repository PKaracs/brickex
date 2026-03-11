/**
 * Image utility functions for compression and processing.
 * Balanced for good quality with fast direct upload.
 */

function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

/**
 * Compress an image for AI lifestyle generation.
 * 2000px max, 0.95 quality - high quality for face detail.
 * @param file - The image file to compress
 * @returns Compressed file (~500-900KB)
 */
export async function compressImage(file: File): Promise<File> {
  const startTime = Date.now();
  const originalSizeKB = Math.round(file.size / 1024);

  // Skip if already under 1MB - direct upload is fast anyway
  if (file.size < 1024 * 1024) {
    console.log(`[Compress] ${file.name} (${originalSizeKB}KB) - skip`);
    return file;
  }

  console.log(`[Compress] ${file.name} (${originalSizeKB}KB) - starting`);

  // Timeout fallback - use original if compression hangs
  const timeoutPromise = new Promise<File>((resolve) => {
    setTimeout(() => {
      console.log(`[Compress] ${file.name} timeout`);
      resolve(file);
    }, 8000);
  });

  const compressionPromise = new Promise<File>((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const objectUrl = URL.createObjectURL(file);

    const cleanup = () => URL.revokeObjectURL(objectUrl);

    if (!ctx) {
      cleanup();
      resolve(file);
      return;
    }

    const loadImage = async () => {
      if (typeof createImageBitmap !== "undefined") {
        const bitmap = await createImageBitmap(file);
        return { width: bitmap.width, height: bitmap.height, source: bitmap };
      }
      return new Promise<{
        width: number;
        height: number;
        source: CanvasImageSource;
      }>((res, rej) => {
        const img = new Image();
        img.onload = () =>
          res({ width: img.width, height: img.height, source: img });
        img.onerror = rej;
        img.src = objectUrl;
      });
    };

    (async () => {
      try {
        const { width: rawW, height: rawH, source } = await loadImage();

        // 2000px - high quality for full-body and face detail
        const maxDim = 2000;
        let width = rawW;
        let height = rawH;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height / width) * maxDim);
            width = maxDim;
          } else {
            width = Math.round((width / height) * maxDim);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(source, 0, 0, width, height);

        // 0.95 quality - high detail, ~500-900KB typical
        canvas.toBlob(
          (blob) => {
            cleanup();
            if (blob) {
              const compressedKB = Math.round(blob.size / 1024);
              console.log(
                `[Compress] ${file.name}: ${originalSizeKB}KB → ${compressedKB}KB (${Date.now() - startTime}ms)`
              );
              resolve(new File([blob], file.name, { type: "image/jpeg" }));
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          0.95
        );
      } catch (err) {
        console.error(`[Compress] Error:`, err);
        cleanup();
        resolve(file);
      }
    })();
  });

  return Promise.race([compressionPromise, timeoutPromise]);
}

/**
 * Compress multiple images.
 * Always parallel for speed (limited concurrency on mobile to avoid memory issues).
 * @param files - Array of image files
 * @returns Array of compressed files
 */
export async function compressImages(files: File[]): Promise<File[]> {
  console.log(`[Compress] Starting batch of ${files.length} images`);
  const startTime = Date.now();

  // Always compress in parallel for speed
  // On mobile, limit to 2 concurrent to avoid memory issues
  const maxConcurrent = isMobile() ? 2 : files.length;
  const results: File[] = [];

  // Process in batches if needed (mobile only)
  if (isMobile() && files.length > maxConcurrent) {
    for (let i = 0; i < files.length; i += maxConcurrent) {
      const batch = files.slice(i, i + maxConcurrent);
      const compressed = await Promise.all(
        batch.map((file) => compressImage(file))
      );
      results.push(...compressed);
    }
  } else {
    // Parallel for all files (desktop) or small batches (mobile)
    const compressed = await Promise.all(
      files.map((file) => compressImage(file))
    );
    results.push(...compressed);
  }

  const totalOriginalKB = files.reduce((sum, f) => sum + f.size, 0) / 1024;
  const totalCompressedKB = results.reduce((sum, f) => sum + f.size, 0) / 1024;

  console.log(
    `[Compress] Batch done in ${Date.now() - startTime}ms: ${Math.round(totalOriginalKB)}KB → ${Math.round(totalCompressedKB)}KB`
  );

  return results;
}
