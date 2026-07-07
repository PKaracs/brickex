"use client";

import { useState, useEffect, useCallback } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Canvas } from "@/components/dashboard/canvas";
import { Sidebar, MobileBottomBar } from "@/components/dashboard/sidebar";
import { SubscriptionModal } from "@/components/modals/subscription-modal";
import { createProject } from "@/lib/actions/create-project";
import { useRouter } from "next/navigation";
import type { SubscriptionData } from "@/lib/actions/get-user-subscription";
import { getUserSubscription } from "@/lib/actions/get-user-subscription";
import { addWatermark } from "@/lib/watermark";
import { toast } from "sonner";
import { fireFirstGenConfetti } from "@/components/ui/confetti";
import {
  generateRender,
  generateRenderBatch,
} from "@/lib/actions/generate-render";
import {
  generateInterior,
  generateInteriorBatch,
  type ObjectFileData,
} from "@/lib/actions/generate-interior";
import {
  type RenderMode,
  type AngleSlot,
  getDefaultModeValues,
  RENDER_MODES,
  createAngleSlot,
  resolveSlotSettings,
} from "@/lib/constants/render-modes";
import { IMAGE_CREDIT_COST } from "@/lib/constants/tools";
import { SUBSCRIPTION_PLANS } from "@/lib/constants/subscription-plans";
import { editRenderRegion, editRenderGlobal } from "@/lib/actions/edit-render";
import { SESSION_STORAGE_KEYS } from "@/lib/constants/session-storage-keys";
import { trackMetaEvent } from "@/lib/meta-pixel";

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

const MAX_SLOTS = 5;

interface ProjectDashboardProps {
  projectId: string;
  replaceUrl?: boolean;
  initialOutputUrl?: string | null;
  subscription?: SubscriptionData | null;
  checkoutSuccess?: boolean;
  authMethod?: string;
  abVariant?: string | null;
}

export function ProjectDashboard({
  projectId,
  replaceUrl,
  initialOutputUrl,
  subscription: initialSubscription,
  checkoutSuccess,
}: ProjectDashboardProps) {
  const router = useRouter();

  // Source files
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);

  // Render mode
  const [currentMode, setCurrentMode] = useState<RenderMode | null>(null);
  const [globalValues, setGlobalValues] = useState<Record<string, string>>(() =>
    getDefaultModeValues(RENDER_MODES[0].id),
  );
  const [referenceFiles, setReferenceFiles] = useState<
    Record<string, File | null>
  >({});
  const [objectFiles, setObjectFiles] = useState<Record<string, File[]>>({});

  // Multi-slot state
  const [slots, setSlots] = useState<AngleSlot[]>([createAngleSlot(0)]);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    initialSubscription ?? null,
  );
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);

  // Per-slot edit state
  const [editHistories, setEditHistories] = useState<Record<string, string[]>>(
    initialOutputUrl ? { "slot-0": [initialOutputUrl] } : {},
  );
  const [editHistoryIndexes, setEditHistoryIndexes] = useState<
    Record<string, number>
  >(initialOutputUrl ? { "slot-0": 0 } : {});

  // Edit state
  const [isEditGenerating, setIsEditGenerating] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [hasSelection, setHasSelection] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [sourcePreviewUrl, setSourcePreviewUrl] = useState<string | null>(null);

  // Derived: active slot
  const activeSlot = slots[activeSlotIndex] ?? slots[0];
  const activeSlotId = activeSlot?.id ?? "slot-0";
  const activeEditHistory = editHistories[activeSlotId] ?? [];
  const activeEditHistoryIndex = editHistoryIndexes[activeSlotId] ?? -1;
  const generatedImageUrl = activeSlot?.outputUrl ?? null;
  const hasAnyOutput = slots.some((s) => s.status === "done" && s.outputUrl);
  const originalImageUrl = activeEditHistory[0] ?? null;

  const canGenerate = uploadedFiles.length > 0 || !!sourceUrl;
  const generationBrickCost = slots.length * IMAGE_CREDIT_COST;
  const hasEnoughBricks =
    (subscription?.creationsRemaining ?? 0) >= generationBrickCost;

  // Keep a stable preview URL for the source image
  useEffect(() => {
    if (sourceUrl) {
      setSourcePreviewUrl(sourceUrl);
    } else if (
      uploadedFiles.length > 0 &&
      uploadedFiles[0].type.startsWith("image/")
    ) {
      const url = URL.createObjectURL(uploadedFiles[0]);
      setSourcePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setSourcePreviewUrl(null);
    }
  }, [sourceUrl, uploadedFiles]);

  useEffect(() => {
    if (replaceUrl) {
      window.history.replaceState(null, "", `/app/dashboard/${projectId}`);
    }
  }, [replaceUrl, projectId]);

  useEffect(() => {
    if (initialSubscription) setSubscription(initialSubscription);
  }, [initialSubscription]);

  useEffect(() => {
    if (activeEditHistory.length < 2 && isComparing) {
      setIsComparing(false);
    }
  }, [activeEditHistory.length, isComparing]);

  useEffect(() => {
    if (isGenerating) {
      document.body.classList.add("generating");
    } else {
      document.body.classList.remove("generating");
    }
    return () => document.body.classList.remove("generating");
  }, [isGenerating]);

  const syncSubscription = useCallback(async () => {
    const updated = await getUserSubscription();
    if ("error" in updated) return null;

    setSubscription(updated);

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("brickex:subscription-updated", {
          detail: updated,
        }),
      );
    }

    return updated;
  }, []);

  const resolvePurchaseValue = useCallback(
    (plan: SubscriptionData["plan"] | null | undefined) => {
      switch (plan) {
        case "starter":
          return SUBSCRIPTION_PLANS.STARTER.price;
        case "pro":
          return SUBSCRIPTION_PLANS.PRO.price;
        case "studio":
          return SUBSCRIPTION_PLANS.STUDIO.price;
        default:
          return 0;
      }
    },
    [],
  );

  useEffect(() => {
    if (!checkoutSuccess) return;

    const returnProjectId = sessionStorage.getItem(
      SESSION_STORAGE_KEYS.CHECKOUT_RETURN_PROJECT,
    );

    if (returnProjectId && returnProjectId !== projectId) {
      sessionStorage.removeItem(SESSION_STORAGE_KEYS.CHECKOUT_RETURN_PROJECT);
      router.replace(`/app/dashboard/${returnProjectId}?checkout=success`);
      return;
    }

    let cancelled = false;

    void (async () => {
      sessionStorage.removeItem(SESSION_STORAGE_KEYS.CHECKOUT_RETURN_PROJECT);

      const updatedSubscription = await syncSubscription();
      if (cancelled) {
        return;
      }

      const purchaseEventId = sessionStorage.getItem(
        SESSION_STORAGE_KEYS.META_PURCHASE_EVENT_ID,
      );
      const storedValue = Number.parseFloat(
        sessionStorage.getItem(SESSION_STORAGE_KEYS.META_PURCHASE_VALUE) || "",
      );
      const purchaseValue =
        Number.isFinite(storedValue) && storedValue > 0
          ? storedValue
          : resolvePurchaseValue(
              updatedSubscription?.plan ?? subscription?.plan,
            );

      if (purchaseEventId && purchaseValue > 0) {
        trackMetaEvent(
          "Purchase",
          {
            content_type: "subscription",
            currency: "USD",
            value: purchaseValue,
          },
          purchaseEventId,
        );
      }

      sessionStorage.removeItem(SESSION_STORAGE_KEYS.META_PURCHASE_EVENT_ID);
      sessionStorage.removeItem(SESSION_STORAGE_KEYS.META_PURCHASE_VALUE);
      window.history.replaceState(null, "", `/app/dashboard/${projectId}`);
      toast.success("Suscripcion activa. Tu saldo de BrickEx esta actualizado.");
    })();

    return () => {
      cancelled = true;
    };
  }, [
    checkoutSuccess,
    projectId,
    resolvePurchaseValue,
    router,
    subscription?.plan,
    syncSubscription,
  ]);

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
    setGlobalValues(getDefaultModeValues(mode.id));
    setReferenceFiles({});
    setObjectFiles({});
    setSlots([createAngleSlot(0)]);
    setActiveSlotIndex(0);
    setEditHistories({});
    setEditHistoryIndexes({});
  }, []);

  const handleGlobalValueChange = useCallback((key: string, value: string) => {
    setGlobalValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSlotOverrideChange = useCallback(
    (slotId: string, key: string, value: string) => {
      setSlots((prev) =>
        prev.map((s) =>
          s.id === slotId
            ? { ...s, overrides: { ...s.overrides, [key]: value } }
            : s,
        ),
      );
    },
    [],
  );

  const handleSlotOverrideReset = useCallback((slotId: string, key: string) => {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id !== slotId) return s;
        const { [key]: _, ...rest } = s.overrides;
        return { ...s, overrides: rest };
      }),
    );
  }, []);

  const handleAddSlot = useCallback(() => {
    setSlots((prev) => {
      if (prev.length >= MAX_SLOTS) return prev;
      return [...prev, createAngleSlot(prev.length)];
    });
  }, []);

  const handleRemoveSlot = useCallback(
    (slotId: string) => {
      setSlots((prev) => {
        if (prev.length <= 1) return prev;
        const filtered = filtered_slots(prev, slotId);
        return filtered;
      });
      setActiveSlotIndex((prev) => Math.min(prev, slots.length - 2));
    },
    [slots.length],
  );

  const handleReferenceFileChange = useCallback(
    (key: string, file: File | null) => {
      setReferenceFiles((prev) => ({ ...prev, [key]: file }));
    },
    [],
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
    file: File,
  ): Promise<{ base64: string; mime: string }> => {
    const ab = await file.arrayBuffer();
    return {
      base64: btoa(
        new Uint8Array(ab).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          "",
        ),
      ),
      mime: file.type || "image/png",
    };
  };

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) {
      toast("Sube primero un boceto o archivo", {
        description:
          "Arrastra y suelta, o haz clic en el lienzo para subir un plano, boceto o foto antes de generar.",
        duration: 5000,
      });
      return;
    }

    if (!hasEnoughBricks) {
      setSubscriptionModalOpen(true);
      return;
    }

    setIsGenerating(true);

    // Mark all slots as generating
    setSlots((prev) =>
      prev.map((s) => ({
        ...s,
        status: "generating" as const,
        outputUrl: null,
        error: null,
      })),
    );

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
            "",
          ),
        );
      } else {
        toast.error("No se encontro una imagen de origen.");
        setIsGenerating(false);
        return;
      }

      const activeMode = currentMode ?? RENDER_MODES[0];

      // Prepare object files for interior
      let objFileData: ObjectFileData[] = [];
      if (activeMode.id === "interior-render") {
        const allObjFiles = objectFiles["objects"] ?? [];
        for (const file of allObjFiles) {
          const converted = await fileToBase64(file);
          objFileData.push({
            base64: converted.base64,
            mimeType: converted.mime,
            name: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
          });
        }
      }

      // Build slot inputs with resolved settings
      const slotInputs = slots.map((slot) => ({
        slotId: slot.id,
        settings: resolveSlotSettings(globalValues, slot.overrides),
      }));

      // Single batch call — GPT analysis runs ONCE, then all slots run in parallel
      let batchResults: Array<{
        slotId: string;
        outputUrl?: string;
        error?: string;
      }>;

      if (activeMode.id === "interior-render") {
        batchResults = await generateInteriorBatch(
          projectId,
          imageBase64,
          mimeType,
          slotInputs,
          objFileData,
        );
      } else {
        batchResults = await generateRenderBatch(
          projectId,
          imageBase64,
          mimeType,
          activeMode.id,
          activeMode.label,
          slotInputs,
        );
      }

      let anySuccess = false;
      const newEditHistories: Record<string, string[]> = {};
      const newEditHistoryIndexes: Record<string, number> = {};

      setSlots((prev) =>
        prev.map((slot) => {
          const r = batchResults.find((br) => br.slotId === slot.id);
          if (r?.outputUrl) {
            anySuccess = true;
            newEditHistories[slot.id] = [r.outputUrl];
            newEditHistoryIndexes[slot.id] = 0;
            return {
              ...slot,
              status: "done" as const,
              outputUrl: r.outputUrl,
              error: null,
            };
          }
          return {
            ...slot,
            status: "error" as const,
            error: r?.error ?? "La generacion fallo.",
            outputUrl: null,
          };
        }),
      );

      setEditHistories(newEditHistories);
      setEditHistoryIndexes(newEditHistoryIndexes);

      if (anySuccess) {
        haptic("success");
        try {
          fireFirstGenConfetti();
        } catch {
          /* Non-critical */
        }
      } else {
        haptic("error");
        toast.error("Todas las generaciones fallaron. Intentalo de nuevo.");
      }
    } catch (error: any) {
      haptic("error");
      console.error("Generation failed:", error);
      setSlots((prev) =>
        prev.map((s) => ({
          ...s,
          status: "error" as const,
          error: "La generacion fallo.",
        })),
      );
      if (!navigator.onLine) {
        toast.error("Sin conexion a internet. Revisala e intentalo de nuevo.");
      } else {
        toast.error(
          error?.message || "Algo salio mal. Intentalo de nuevo.",
        );
      }
    } finally {
      setIsGenerating(false);
      await syncSubscription();
    }
  }, [
    canGenerate,
    hasEnoughBricks,
    uploadedFiles,
    sourceUrl,
    currentMode,
    globalValues,
    objectFiles,
    slots,
    projectId,
    syncSubscription,
  ]);

  // ============================================================
  // EDIT HANDLERS (per active slot)
  // ============================================================

  const pushToHistory = useCallback(
    (url: string) => {
      const slotId = activeSlotId;
      setEditHistories((prev) => {
        const history = prev[slotId] ?? [];
        const idx = editHistoryIndexes[slotId] ?? -1;
        const newHistory = [...history.slice(0, idx + 1), url];
        return { ...prev, [slotId]: newHistory };
      });
      setEditHistoryIndexes((prev) => {
        const history = editHistories[slotId] ?? [];
        const idx = prev[slotId] ?? -1;
        return { ...prev, [slotId]: Math.min(idx + 1, history.length) };
      });
      setSlots((prev) =>
        prev.map((s) => (s.id === slotId ? { ...s, outputUrl: url } : s)),
      );
      setIsComparing(false);
    },
    [activeSlotId, editHistories, editHistoryIndexes],
  );

  const handleRegionEditSubmit = useCallback(
    async (annotatedImageBase64: string, prompt: string) => {
      setIsEditGenerating(true);
      try {
        const result = await editRenderRegion(
          projectId,
          annotatedImageBase64,
          prompt,
        );
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
        toast.error(error?.message || "La edicion fallo. Intentalo de nuevo.");
      } finally {
        setIsEditGenerating(false);
        await syncSubscription();
      }
    },
    [pushToHistory, projectId, syncSubscription],
  );

  const handleGlobalEditSubmit = useCallback(async () => {
    if (!editPrompt.trim() || !generatedImageUrl) return;

    setIsEditGenerating(true);
    try {
      const img = document.querySelector(
        'img[data-render-image="true"]',
      ) as HTMLImageElement;
      if (!img) {
        toast.error("No se pudo leer la imagen actual.");
        setIsEditGenerating(false);
        return;
      }

      const maxDim = 1024;
      const scale = Math.min(
        1,
        maxDim / Math.max(img.naturalWidth, img.naturalHeight),
      );
      const outW = Math.round(img.naturalWidth * scale);
      const outH = Math.round(img.naturalHeight * scale);

      const offscreen = document.createElement("canvas");
      offscreen.width = outW;
      offscreen.height = outH;
      const ctx = offscreen.getContext("2d");
      if (!ctx) {
        toast.error("Error del lienzo.");
        setIsEditGenerating(false);
        return;
      }
      ctx.drawImage(img, 0, 0, outW, outH);
      const currentBase64 = offscreen
        .toDataURL("image/jpeg", 0.85)
        .split(",")[1];

      const result = await editRenderGlobal(
        projectId,
        currentBase64,
        editPrompt.trim(),
      );
      if (result.error) {
        haptic("error");
        toast.error(result.error);
        return;
      }
      if (result.outputUrl) {
        pushToHistory(result.outputUrl);
        setEditPrompt("");
        haptic("success");
      }
    } catch (error: any) {
      haptic("error");
      toast.error(error?.message || "La edicion fallo. Intentalo de nuevo.");
    } finally {
      setIsEditGenerating(false);
      await syncSubscription();
    }
  }, [
    editPrompt,
    generatedImageUrl,
    pushToHistory,
    projectId,
    syncSubscription,
  ]);

  const handleHistorySelect = useCallback(
    (index: number) => {
      const slotId = activeSlotId;
      const history = editHistories[slotId] ?? [];
      if (index < 0 || index >= history.length) return;
      setEditHistoryIndexes((prev) => ({ ...prev, [slotId]: index }));
      setSlots((prev) =>
        prev.map((s) =>
          s.id === slotId ? { ...s, outputUrl: history[index] } : s,
        ),
      );
    },
    [activeSlotId, editHistories],
  );

  const handleToggleCompare = useCallback(() => {
    setIsComparing((p) => !p);
  }, []);

  const handleSelectionChange = useCallback((has: boolean) => {
    setHasSelection(has);
  }, []);

  const handleActiveSlotChange = useCallback((index: number) => {
    setActiveSlotIndex(index);
    setIsComparing(false);
  }, []);

  // ============================================================
  // DOWNLOAD / SHARE / NEW PROJECT
  // ============================================================

  const handleNewProject = useCallback(async () => {
    const result = await createProject();
    if ("projectId" in result) {
      router.push(`/app/dashboard/${result.projectId}`);
    }
  }, [router]);

  const handleDownload = useCallback(async () => {
    if (!generatedImageUrl) return;
    try {
      let blob: Blob;
      if (
        subscription?.plan === "free" &&
        !generatedImageUrl.startsWith("data:")
      ) {
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
      a.download = `brickex-render-${activeSlotIndex + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  }, [generatedImageUrl, subscription?.plan, activeSlotIndex]);

  const handleShare = useCallback(async () => {
    if (!generatedImageUrl) return;
    if (!navigator.share) return;
    try {
      const res = await fetch(generatedImageUrl);
      const blob = await res.blob();
      const file = new File([blob], `brickex-render.png`, {
        type: "image/png",
      });
      await navigator.share({ title: "Mi render de BrickEx", files: [file] });
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
              projectId={projectId}
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
              canCompare={activeEditHistory.length > 1}
              onSelectionChange={handleSelectionChange}
              editHistory={activeEditHistory}
              editHistoryIndex={activeEditHistoryIndex}
              onHistorySelect={handleHistorySelect}
              onToggleCompare={handleToggleCompare}
              onDownload={handleDownload}
              sourcePreviewUrl={sourcePreviewUrl}
              slots={slots}
              activeSlotIndex={activeSlotIndex}
              onActiveSlotChange={handleActiveSlotChange}
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
              hasGeneratedImage={hasAnyOutput}
              subscription={subscription}
              currentMode={currentMode}
              onModeChange={handleModeChange}
              globalValues={globalValues}
              onGlobalValueChange={handleGlobalValueChange}
              referenceFiles={referenceFiles}
              onReferenceFileChange={handleReferenceFileChange}
              objectFiles={objectFiles}
              onObjectFileAdd={handleObjectFileAdd}
              onObjectFileRemove={handleObjectFileRemove}
              slots={slots}
              activeSlotIndex={activeSlotIndex}
              onActiveSlotChange={handleActiveSlotChange}
              onSlotOverrideChange={handleSlotOverrideChange}
              onSlotOverrideReset={handleSlotOverrideReset}
              onAddSlot={handleAddSlot}
              onRemoveSlot={handleRemoveSlot}
              editPrompt={editPrompt}
              onEditPromptChange={setEditPrompt}
              onGlobalEditSubmit={handleGlobalEditSubmit}
              isEditGenerating={isEditGenerating}
              hasSelection={hasSelection}
              canCompare={activeEditHistory.length > 1}
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
          hasGeneratedImage={hasAnyOutput}
          subscription={subscription}
          currentMode={currentMode}
          onModeChange={setCurrentMode}
          globalValues={globalValues}
          onGlobalValueChange={handleGlobalValueChange}
          referenceFiles={referenceFiles}
          onReferenceFileChange={handleReferenceFileChange}
          objectFiles={objectFiles}
          onObjectFileAdd={handleObjectFileAdd}
          onObjectFileRemove={handleObjectFileRemove}
          slots={slots}
          activeSlotIndex={activeSlotIndex}
          onActiveSlotChange={setActiveSlotIndex}
          onSlotOverrideChange={handleSlotOverrideChange}
          onSlotOverrideReset={handleSlotOverrideReset}
          onAddSlot={handleAddSlot}
          onRemoveSlot={handleRemoveSlot}
          editPrompt={editPrompt}
          onEditPromptChange={setEditPrompt}
          onGlobalEditSubmit={handleGlobalEditSubmit}
          isEditGenerating={isEditGenerating}
        />

        <SubscriptionModal
          open={subscriptionModalOpen}
          onOpenChange={setSubscriptionModalOpen}
          subscription={subscription}
          projectId={projectId}
        />
      </div>
    </TooltipProvider>
  );
}

function filtered_slots(prev: AngleSlot[], slotId: string): AngleSlot[] {
  return prev
    .filter((s) => s.id !== slotId)
    .map((s, i) => ({ ...s, id: `slot-${i}`, label: `Angle ${i + 1}` }));
}
