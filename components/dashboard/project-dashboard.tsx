"use client";

import { useState, useEffect, useCallback } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Canvas } from "@/components/dashboard/canvas";
import { Sidebar, MobileBottomBar } from "@/components/dashboard/sidebar";
import { Project } from "@/db/schema";
import { createProject } from "@/lib/actions/create-project";
import { useRouter } from "next/navigation";
import type { SubscriptionData } from "@/lib/actions/get-user-subscription";
import { addWatermark } from "@/lib/watermark";
import { toast } from "sonner";
import { fireFirstGenConfetti } from "@/components/ui/confetti";
import { generateRender } from "@/lib/actions/generate-render";
import {
  generateInterior,
  type ObjectFileData,
} from "@/lib/actions/generate-interior";
import {
  type RenderMode,
  getDefaultModeValues,
  RENDER_MODES,
} from "@/lib/constants/render-modes";
import {
  editRenderRegion,
  editRenderGlobal,
} from "@/lib/actions/edit-render";

function haptic(type: "light" | "medium" | "success" | "error") {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      const patterns: Record<string, number | number[]> = {
        light: 10,
        medium: 25,
        success: [25, 50, 25],
        error: [50, 100, 50],
      };
      navigator.vibrate(patterns[type]);
    }
  } catch {
    // Silently fail
  }
}

interface ProjectDashboardProps {
  project: Project;
  replaceUrl?: boolean;
  initialOutputUrl?: string | null;
  subscription?: SubscriptionData | null;
  checkoutSuccess?: boolean;
  authMethod?: string;
  abVariant?: string | null;
}

export function ProjectDashboard({
  project,
  replaceUrl,
  initialOutputUrl,
  subscription: initialSubscription,
}: ProjectDashboardProps) {
  const router = useRouter();

  // Source files
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);

  // Render mode
  const [currentMode, setCurrentMode] = useState<RenderMode | null>(null);
  const [modeValues, setModeValues] = useState<Record<string, string>>(() =>
    getDefaultModeValues(RENDER_MODES[0].id)
  );
  const [referenceFiles, setReferenceFiles] = useState<
    Record<string, File | null>
  >({});
  const [objectFiles, setObjectFiles] = useState<Record<string, File[]>>({});

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    initialOutputUrl ?? null
  );
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    initialSubscription ?? null
  );

  // Edit state
  const [isEditGenerating, setIsEditGenerating] = useState(false);
  const [editHistory, setEditHistory] = useState<string[]>(
    initialOutputUrl ? [initialOutputUrl] : []
  );
  const [editHistoryIndex, setEditHistoryIndex] = useState(
    initialOutputUrl ? 0 : -1
  );
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(
    initialOutputUrl ?? null
  );
  const [globalPrompt, setGlobalPrompt] = useState("");
  const [hasSelection, setHasSelection] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [sourcePreviewUrl, setSourcePreviewUrl] = useState<string | null>(null);

  const canGenerate = uploadedFiles.length > 0 || !!sourceUrl;

  // Keep a stable preview URL for the source image (for version history strip)
  useEffect(() => {
    if (sourceUrl) {
      setSourcePreviewUrl(sourceUrl);
    } else if (uploadedFiles.length > 0 && uploadedFiles[0].type.startsWith("image/")) {
      const url = URL.createObjectURL(uploadedFiles[0]);
      setSourcePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setSourcePreviewUrl(null);
    }
  }, [sourceUrl, uploadedFiles]);

  useEffect(() => {
    if (replaceUrl) {
      window.history.replaceState(null, "", `/dashboard/${project.id}`);
    }
  }, [replaceUrl, project.id]);

  useEffect(() => {
    if (initialSubscription) setSubscription(initialSubscription);
  }, [initialSubscription]);

  useEffect(() => {
    if (isGenerating) {
      document.body.classList.add("generating");
    } else {
      document.body.classList.remove("generating");
    }
    return () => document.body.classList.remove("generating");
  }, [isGenerating]);

  // ============================================================
  // SOURCE HANDLERS
  // ============================================================

  const handleFilesAdded = useCallback((files: File[]) => {
    setUploadedFiles((prev) => [...prev, ...files]);
    setSourceUrl(null);
  }, []);

  const handleFileRemoved = useCallback((index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSourceUrlSet = useCallback((url: string) => {
    setSourceUrl(url);
    setUploadedFiles([]);
  }, []);

  const handleClearSource = useCallback(() => {
    setUploadedFiles([]);
    setSourceUrl(null);
  }, []);

  // ============================================================
  // MODE HANDLERS
  // ============================================================

  const handleModeChange = useCallback((mode: RenderMode) => {
    setCurrentMode(mode);
    setModeValues(getDefaultModeValues(mode.id));
    setReferenceFiles({});
    setObjectFiles({});
  }, []);

  const handleModeValueChange = useCallback((key: string, value: string) => {
    setModeValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleReferenceFileChange = useCallback(
    (key: string, file: File | null) => {
      setReferenceFiles((prev) => ({ ...prev, [key]: file }));
    },
    []
  );

  const handleObjectFileAdd = useCallback((key: string, file: File) => {
    setObjectFiles((prev) => ({
      ...prev,
      [key]: [...(prev[key] ?? []), file],
    }));
  }, []);

  const handleObjectFileRemove = useCallback((key: string, index: number) => {
    setObjectFiles((prev) => ({
      ...prev,
      [key]: (prev[key] ?? []).filter((_, i) => i !== index),
    }));
  }, []);

  // ============================================================
  // GENERATION
  // ============================================================

  const fileToBase64 = async (
    file: File
  ): Promise<{ base64: string; mime: string }> => {
    const ab = await file.arrayBuffer();
    return {
      base64: btoa(
        new Uint8Array(ab).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      ),
      mime: file.type || "image/png",
    };
  };

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) {
      toast("Upload a source image first", {
        description:
          "Drag & drop or click the canvas to upload a floor plan, sketch, or photo.",
        duration: 5000,
      });
      return;
    }

    setIsGenerating(true);

    try {
      let imageBase64: string;
      let mimeType: string;

      if (uploadedFiles.length > 0) {
        const converted = await fileToBase64(uploadedFiles[0]);
        imageBase64 = converted.base64;
        mimeType = converted.mime;
      } else if (sourceUrl) {
        const response = await fetch(sourceUrl);
        const blob = await response.blob();
        mimeType = blob.type || "image/png";
        const arrayBuffer = await blob.arrayBuffer();
        imageBase64 = btoa(
          new Uint8Array(arrayBuffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
      } else {
        toast.error("No source image found.");
        setIsGenerating(false);
        return;
      }

      const activeMode = currentMode ?? RENDER_MODES[0];
      let result: { outputUrl?: string; error?: string };

      if (activeMode.id === "interior-render") {
        const objFileData: ObjectFileData[] = [];
        const allObjFiles = objectFiles["objects"] ?? [];
        for (const file of allObjFiles) {
          const converted = await fileToBase64(file);
          objFileData.push({
            base64: converted.base64,
            mimeType: converted.mime,
            name: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
          });
        }
        result = await generateInterior(imageBase64, mimeType, modeValues, objFileData);
      } else {
        result = await generateRender(imageBase64, mimeType, activeMode.label, modeValues);
      }

      if (result.error) {
        haptic("error");
        toast.error(result.error);
        setIsGenerating(false);
        return;
      }

      if (result.outputUrl) {
        setGeneratedImageUrl(result.outputUrl);
        setOriginalImageUrl(result.outputUrl);
        setEditHistory([result.outputUrl]);
        setEditHistoryIndex(0);
        setGlobalPrompt("");
        haptic("success");

        try {
          fireFirstGenConfetti();
        } catch {
          // Non-critical
        }
      }
    } catch (error: any) {
      haptic("error");
      console.error("Generation failed:", error);
      if (!navigator.onLine) {
        toast.error("No internet connection. Please check and try again.");
      } else {
        toast.error(error?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  }, [canGenerate, uploadedFiles, sourceUrl, currentMode, modeValues, objectFiles]);

  // ============================================================
  // EDIT HANDLERS
  // ============================================================

  const pushToHistory = useCallback(
    (url: string) => {
      const newHistory = [...editHistory.slice(0, editHistoryIndex + 1), url];
      setEditHistory(newHistory);
      setEditHistoryIndex(newHistory.length - 1);
      setGeneratedImageUrl(url);
    },
    [editHistory, editHistoryIndex]
  );

  const handleRegionEditSubmit = useCallback(
    async (annotatedImageBase64: string, prompt: string) => {
      setIsEditGenerating(true);
      try {
        const result = await editRenderRegion(annotatedImageBase64, prompt);
        if (result.error) {
          haptic("error");
          toast.error(result.error);
          return;
        }
        if (result.outputUrl) {
          pushToHistory(result.outputUrl);
          haptic("success");
        }
      } catch (error: any) {
        haptic("error");
        toast.error(error?.message || "Edit failed. Please try again.");
      } finally {
        setIsEditGenerating(false);
      }
    },
    [pushToHistory]
  );

  const handleGlobalEditSubmit = useCallback(async () => {
    if (!globalPrompt.trim() || !generatedImageUrl) return;

    setIsEditGenerating(true);
    try {
      // Compress to JPEG at 1024px max to stay within body limits
      const img = document.querySelector(
        'img[alt="Generated render"]'
      ) as HTMLImageElement;
      if (!img) {
        toast.error("Could not read the current image.");
        setIsEditGenerating(false);
        return;
      }

      const maxDim = 1024;
      const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
      const outW = Math.round(img.naturalWidth * scale);
      const outH = Math.round(img.naturalHeight * scale);

      const offscreen = document.createElement("canvas");
      offscreen.width = outW;
      offscreen.height = outH;
      const ctx = offscreen.getContext("2d");
      if (!ctx) {
        toast.error("Canvas error.");
        setIsEditGenerating(false);
        return;
      }
      ctx.drawImage(img, 0, 0, outW, outH);
      const currentBase64 = offscreen.toDataURL("image/jpeg", 0.85).split(",")[1];

      const result = await editRenderGlobal(currentBase64, globalPrompt.trim());
      if (result.error) {
        haptic("error");
        toast.error(result.error);
        return;
      }
      if (result.outputUrl) {
        pushToHistory(result.outputUrl);
        setGlobalPrompt("");
        haptic("success");
      }
    } catch (error: any) {
      haptic("error");
      toast.error(error?.message || "Edit failed. Please try again.");
    } finally {
      setIsEditGenerating(false);
    }
  }, [globalPrompt, generatedImageUrl, pushToHistory]);

  const handleHistorySelect = useCallback(
    (index: number) => {
      if (index < 0 || index >= editHistory.length) return;
      setEditHistoryIndex(index);
      setGeneratedImageUrl(editHistory[index]);
    },
    [editHistory]
  );

  const handleToggleCompare = useCallback(() => {
    setIsComparing((p) => !p);
  }, []);

  const handleSelectionChange = useCallback((has: boolean) => {
    setHasSelection(has);
  }, []);

  // ============================================================
  // DOWNLOAD / SHARE / NEW PROJECT
  // ============================================================

  const handleNewProject = useCallback(async () => {
    const result = await createProject();
    if ("projectId" in result) {
      router.push(`/dashboard/${result.projectId}`);
    }
  }, [router]);

  const handleDownload = useCallback(async () => {
    if (!generatedImageUrl) return;
    try {
      let blob: Blob;
      if (subscription?.plan === "free" && !generatedImageUrl.startsWith("data:")) {
        blob = await addWatermark(generatedImageUrl);
      } else if (generatedImageUrl.startsWith("data:")) {
        const res = await fetch(generatedImageUrl);
        blob = await res.blob();
      } else {
        const response = await fetch(generatedImageUrl);
        blob = await response.blob();
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `brickex-render.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  }, [generatedImageUrl, subscription?.plan]);

  const handleShare = useCallback(async () => {
    if (!generatedImageUrl) return;
    if (!navigator.share) return;
    try {
      const res = await fetch(generatedImageUrl);
      const blob = await res.blob();
      const file = new File([blob], `brickex-render.png`, { type: "image/png" });
      await navigator.share({ title: "My BrickEx render", files: [file] });
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Share failed:", error);
      }
    }
  }, [generatedImageUrl]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <TooltipProvider>
      <div className="h-full w-full bg-black text-white flex flex-col overflow-hidden">
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Main canvas area */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden transition-all duration-500 p-2 sm:p-4 pb-24 md:pb-4">
            <Canvas
              projectId={project.id}
              uploadedFiles={uploadedFiles}
              sourceUrl={sourceUrl}
              generatedImageUrl={generatedImageUrl}
              isGenerating={isGenerating}
              onFilesAdded={handleFilesAdded}
              onFileRemoved={handleFileRemoved}
              onSourceUrlSet={handleSourceUrlSet}
              onClearSource={handleClearSource}
              isEditGenerating={isEditGenerating}
              onRegionEditSubmit={handleRegionEditSubmit}
              originalImageUrl={originalImageUrl}
              isComparing={isComparing}
              onSelectionChange={handleSelectionChange}
              editHistory={editHistory}
              editHistoryIndex={editHistoryIndex}
              onHistorySelect={handleHistorySelect}
              onToggleCompare={handleToggleCompare}
              onDownload={handleDownload}
              sourcePreviewUrl={sourcePreviewUrl}
            />
          </div>

          {/* Desktop sidebar */}
          <div className="hidden md:flex">
            <Sidebar
              onGenerate={handleGenerate}
              onNewProject={handleNewProject}
              onDownload={handleDownload}
              isGenerating={isGenerating}
              canGenerate={canGenerate}
              hasGeneratedImage={!!generatedImageUrl}
              subscription={subscription}
              currentMode={currentMode}
              onModeChange={handleModeChange}
              modeValues={modeValues}
              onModeValueChange={handleModeValueChange}
              referenceFiles={referenceFiles}
              onReferenceFileChange={handleReferenceFileChange}
              objectFiles={objectFiles}
              onObjectFileAdd={handleObjectFileAdd}
              onObjectFileRemove={handleObjectFileRemove}
              globalPrompt={globalPrompt}
              onGlobalPromptChange={setGlobalPrompt}
              onGlobalEditSubmit={handleGlobalEditSubmit}
              isEditGenerating={isEditGenerating}
              hasSelection={hasSelection}
              onToggleCompare={handleToggleCompare}
              isComparing={isComparing}
            />
          </div>
        </div>

        {/* Mobile bottom bar */}
        <MobileBottomBar
          onGenerate={handleGenerate}
          onNewProject={handleNewProject}
          onDownload={handleDownload}
          onShare={handleShare}
          isGenerating={isGenerating}
          canGenerate={canGenerate}
          hasGeneratedImage={!!generatedImageUrl}
          subscription={subscription}
          currentMode={currentMode}
          modeValues={modeValues}
          onModeValueChange={handleModeValueChange}
          globalPrompt={globalPrompt}
          onGlobalPromptChange={setGlobalPrompt}
          onGlobalEditSubmit={handleGlobalEditSubmit}
          isEditGenerating={isEditGenerating}
        />
      </div>
    </TooltipProvider>
  );
}
