/**
 * Client-side watermarking utility
 * Adds logo and URL watermark to images for free users
 */

import { getPublicAssetUrl } from "@/lib/utils/storage";

const LOGO_URL = "/brickex-logo.png";

/**
 * Load an image from URL with CORS handling
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (error) => {
      console.error("Failed to load image:", url, error);
      reject(new Error(`Failed to load image: ${url}`));
    };
    img.src = url;
  });
}

/**
 * Add watermark to an image
 * @param imageUrl - URL of the image to watermark
 * @param appUrl - App URL to display in watermark (unused, kept for compatibility)
 * @returns Promise that resolves to a Blob of the watermarked image
 */
export async function addWatermark(
  imageUrl: string,
  appUrl?: string
): Promise<Blob> {
  try {
    // Load both images
    const [mainImage, logoImage] = await Promise.all([
      loadImage(imageUrl),
      loadImage(LOGO_URL),
    ]);

    // Create canvas
    const canvas = document.createElement("canvas");
    canvas.width = mainImage.width;
    canvas.height = mainImage.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    // Draw main image
    ctx.drawImage(mainImage, 0, 0);

    // Watermark dimensions and positioning
    const padding = 96;
    const logoHeight = 320;
    const logoAspectRatio = logoImage.width / logoImage.height;
    const logoWidth = logoHeight * logoAspectRatio;
    const urlFontSize = 72;
    const urlPadding = 48;
    const urlText = "brickex.com";

    // Measure URL text width
    ctx.font = `${urlFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    const urlTextMetrics = ctx.measureText(urlText);
    const urlTextWidth = urlTextMetrics.width;

    // Watermark container dimensions
    const watermarkWidth = Math.max(logoWidth, urlTextWidth) + padding * 2;
    const watermarkHeight =
      logoHeight + urlFontSize + urlPadding * 2 + padding * 2;

    // Position: top-right corner
    const watermarkX = canvas.width - watermarkWidth - padding;
    const watermarkY = padding;

    // Draw semi-transparent background
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(
      watermarkX,
      watermarkY,
      watermarkWidth,
      watermarkHeight
    );

    // Draw logo (centered horizontally in watermark container)
    const logoX = watermarkX + (watermarkWidth - logoWidth) / 2;
    const logoY = watermarkY + padding;
    ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);

    // Draw URL text (centered below logo)
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const urlX = watermarkX + watermarkWidth / 2;
    const urlY = logoY + logoHeight + urlPadding;
    ctx.fillText(urlText, urlX, urlY);

    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob from canvas"));
          }
        },
        "image/png",
        1.0
      );
    });
  } catch (error) {
    console.error("Watermarking failed:", error);
    throw error;
  }
}

