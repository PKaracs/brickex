"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { VideoCanvas } from "@/components/video/video-canvas";
import {
  VideoSidebar,
  VideoMobileBottomBar,
} from "@/components/video/video-sidebar";
import type { VideoScenePreset } from "@/lib/constants/video-presets";

const SUPPORTED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function normalizeImageMimeType(mimeType?: string) {
  if (!mimeType) return "image/jpeg";
  return SUPPORTED_IMAGE_MIME_TYPES.has(mimeType) ? mimeType : "image/jpeg";
}

async function compressImageToPayload(
  file: File,
  maxDim = 1280
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas unavailable"));
      ctx.drawImage(img, 0, 0, w, h);
      const mimeType = normalizeImageMimeType(file.type);
      const quality =
        mimeType === "image/jpeg" || mimeType === "image/webp" ? 0.82 : undefined;
      const dataUrl = canvas.toDataURL(mimeType, quality);
      const rawBase64 = dataUrl.split(",")[1];
      resolve({ base64: rawBase64, mimeType });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

async function urlToPayload(
  url: string,
  maxDim = 1280,
): Promise<{ base64: string; mimeType: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch gallery image");
  const blob = await res.blob();
  const file = new File([blob], "gallery-image", {
    type: normalizeImageMimeType(blob.type),
  });
  return compressImageToPayload(file, maxDim);
}

export function VideoClient() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [galleryUrl, setGalleryUrl] = useState<string | null>(null);

  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [selectedScenePresetId, setSelectedScenePresetId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(5);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [resolution, setResolution] = useState("720p");

  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const hasSource = !!imageFile || !!galleryUrl;
  const canGenerate = hasSource && !isGenerating;

  const handleFileSelect = useCallback((file: File) => {
    setImageFile(file);
    setGalleryUrl(null);
  }, []);

  const handleGallerySelect = useCallback((url: string) => {
    setGalleryUrl(url);
    setImageFile(null);
  }, []);

  const handleClear = useCallback(() => {
    setImageFile(null);
    setGalleryUrl(null);
  }, []);

  const handlePresetSelect = useCallback((id: string | null) => {
    setSelectedPresetId(id);
  }, []);

  const handleScenePresetSelect = useCallback((preset: VideoScenePreset | null) => {
    setSelectedScenePresetId(preset?.id ?? null);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!hasSource) {
      toast("Upload an image first", {
        description: "Drag & drop, browse files, or pick from your gallery.",
        duration: 4000,
      });
      return;
    }

    setIsGenerating(true);
    setVideoUrl(null);

    try {
      let imageBase64: string;
      let imageMimeType: string;
      if (imageFile) {
        const prepared = await compressImageToPayload(imageFile);
        imageBase64 = prepared.base64;
        imageMimeType = prepared.mimeType;
      } else {
        const prepared = await urlToPayload(galleryUrl!);
        imageBase64 = prepared.base64;
        imageMimeType = prepared.mimeType;
      }

      console.log(`[Video] Sending request — image: ${imageBase64.length} chars (${imageMimeType}), scene: ${selectedScenePresetId ?? "none"}, motion: ${selectedPresetId ?? "none"}, prompt: "${prompt.substring(0, 50)}"`);

      const response = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          imageMimeType,
          prompt,
          presetId: selectedPresetId ?? undefined,
          scenePresetId: selectedScenePresetId ?? undefined,
          duration,
          aspectRatio,
          resolution,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        toast.error(result.error || "Video generation failed");
        return;
      }

      if (result.videoUrl) {
        setVideoUrl(result.videoUrl);
        toast.success("Video generated successfully!");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      console.error("Video generation failed:", error);
      if (!navigator.onLine) {
        toast.error("No internet connection. Please check and try again.");
      } else {
        toast.error(message);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [hasSource, imageFile, galleryUrl, prompt, selectedPresetId, selectedScenePresetId, duration, aspectRatio, resolution]);

  const handleDownload = useCallback(async () => {
    if (!videoUrl) return;
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "brickex-video.mp4";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download video");
    }
  }, [videoUrl]);

  const handleNewVideo = useCallback(() => {
    setVideoUrl(null);
  }, []);

  const sidebarProps = {
    selectedPresetId,
    onPresetSelect: handlePresetSelect,
    selectedScenePresetId,
    onScenePresetSelect: handleScenePresetSelect,
    prompt,
    onPromptChange: setPrompt,
    duration,
    onDurationChange: setDuration,
    aspectRatio,
    onAspectRatioChange: setAspectRatio,
    resolution,
    onResolutionChange: setResolution,
    isGenerating,
    canGenerate,
    onGenerate: handleGenerate,
    videoUrl,
    onDownload: handleDownload,
    onNewVideo: handleNewVideo,
  };

  return (
    <div className="h-full w-full bg-black text-white flex flex-col overflow-hidden">
      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden transition-all duration-500 p-2 sm:p-4 pb-24 md:pb-4">
          <VideoCanvas
            imageFile={imageFile}
            previewUrl={galleryUrl}
            onFileSelect={handleFileSelect}
            onGallerySelect={handleGallerySelect}
            onFileClear={handleClear}
            isGenerating={isGenerating}
            videoUrl={videoUrl}
          />
        </div>

        <VideoSidebar {...sidebarProps} />
      </div>

      <VideoMobileBottomBar {...sidebarProps} />
    </div>
  );
}
