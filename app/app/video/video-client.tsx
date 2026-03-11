"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { VideoCanvas } from "@/components/video/video-canvas";
import {
  VideoSidebar,
  VideoMobileBottomBar,
} from "@/components/video/video-sidebar";
import type { VideoScenePreset } from "@/lib/constants/video-presets";

async function compressImageToBase64(
  file: File,
  maxDim = 1920
): Promise<string> {
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
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      const rawBase64 = dataUrl.split(",")[1];
      resolve(rawBase64);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

export function VideoClient() {
  const [startFile, setStartFile] = useState<File | null>(null);
  const [endFile, setEndFile] = useState<File | null>(null);

  const [isEndFrameMode, setIsEndFrameMode] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(
    null
  );
  const [selectedScenePresetId, setSelectedScenePresetId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(5);
  const [enableAudio, setEnableAudio] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const canGenerate = !!startFile && !isGenerating;

  const handleModeToggle = useCallback((isEndFrame: boolean) => {
    setIsEndFrameMode(isEndFrame);
    if (!isEndFrame) {
      setEndFile(null);
    }
  }, []);

  const handlePresetSelect = useCallback(
    (id: string | null) => {
      setSelectedPresetId(id);
    },
    []
  );

  const handleScenePresetSelect = useCallback(
    (preset: VideoScenePreset | null) => {
      setSelectedScenePresetId(preset?.id ?? null);
    },
    []
  );

  const handleGenerate = useCallback(async () => {
    if (!startFile) {
      toast("Upload an image first", {
        description: "Drag & drop or click to upload your source image.",
        duration: 4000,
      });
      return;
    }

    setIsGenerating(true);
    setVideoUrl(null);

    try {
      const startBase64 = await compressImageToBase64(startFile);

      let endBase64: string | undefined;
      if (isEndFrameMode && endFile) {
        endBase64 = await compressImageToBase64(endFile);
      }

      const response = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startImageBase64: startBase64,
          endImageBase64: endBase64,
          prompt,
          presetId: selectedPresetId ?? undefined,
          scenePresetId: selectedScenePresetId ?? undefined,
          duration,
          mode: "std",
          enableAudio,
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
  }, [
    startFile,
    endFile,
    isEndFrameMode,
    prompt,
    selectedPresetId,
    selectedScenePresetId,
    duration,
    enableAudio,
  ]);

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

  const sidebarProps = {
    isEndFrameMode,
    onModeToggle: handleModeToggle,
    selectedPresetId,
    onPresetSelect: handlePresetSelect,
    selectedScenePresetId,
    onScenePresetSelect: handleScenePresetSelect,
    prompt,
    onPromptChange: setPrompt,
    duration,
    onDurationChange: setDuration,
    enableAudio,
    onAudioToggle: setEnableAudio,
    isGenerating,
    canGenerate,
    onGenerate: handleGenerate,
  };

  return (
    <div className="h-full w-full bg-black text-white flex flex-col overflow-hidden">
      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden transition-all duration-500 p-2 sm:p-4 pb-24 md:pb-4">
          <VideoCanvas
            isEndFrameMode={isEndFrameMode}
            startFile={startFile}
            endFile={endFile}
            onStartFileSelect={setStartFile}
            onEndFileSelect={setEndFile}
            onStartFileClear={() => setStartFile(null)}
            onEndFileClear={() => setEndFile(null)}
            isGenerating={isGenerating}
            videoUrl={videoUrl}
            onDownload={handleDownload}
          />
        </div>

        <VideoSidebar {...sidebarProps} />
      </div>

      <VideoMobileBottomBar {...sidebarProps} />
    </div>
  );
}
