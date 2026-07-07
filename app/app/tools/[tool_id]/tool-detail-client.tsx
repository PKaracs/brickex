"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ModelViewerPreview } from "@/components/ui/model-viewer-preview";
import { cn } from "@/lib/utils";
import {
  getToolById,
  getToolUnavailableReason,
  isToolGenerationReady,
} from "@/lib/constants/tools";
import { createProject } from "@/lib/actions/create-project";
import { generateToolImage } from "@/lib/actions/generate-tool-image";
import {
  getUserSubscription,
  type SubscriptionData,
} from "@/lib/actions/get-user-subscription";
import { SubscriptionModal } from "@/components/modals/subscription-modal";
import { uploadProjectImagesDirect } from "@/lib/project-images-service";
import {
  ArrowLeft,
  FileImage,
  Plus,
  X,
  Loader2,
  ArrowRight,
  Download,
} from "lucide-react";
import { toast } from "sonner";

/* ─── Upload Zone ─────────────────────────────────────────────────────────── */

const SUPPORTED_TOOL_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const TOOL_IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp";

function isSupportedToolImageFile(file: File) {
  if (SUPPORTED_TOOL_IMAGE_TYPES.has(file.type)) {
    return true;
  }

  return /\.(jpe?g|png|webp)$/i.test(file.name);
}

function buildToolProjectTitle(toolLabel: string, file?: File | null) {
  const baseName = file?.name
    ?.replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim();

  if (!baseName) {
    return toolLabel;
  }

  const truncated = baseName.slice(0, 48).trim();
  return `${toolLabel} - ${truncated}`;
}

async function downloadFile(url: string, filename: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("No se pudo descargar el archivo.");
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}

type GeneratedAsset = {
  url: string;
  mediaType: "image" | "model_3d";
};

function UploadZone({
  files,
  onAdd,
  onRemove,
  multiUpload,
}: {
  files: (File | null)[];
  onAdd: (index: number) => void;
  onRemove: (index: number) => void;
  multiUpload?: boolean;
}) {
  const hasAnyFile = files.some(Boolean);

  if (hasAnyFile && multiUpload) {
    return (
      <div className="flex gap-3 flex-wrap">
        {files.map((file, i) => (
          <UploadedThumb
            key={i}
            file={file}
            onAdd={() => onAdd(i)}
            onRemove={() => onRemove(i)}
          />
        ))}
      </div>
    );
  }

  if (hasAnyFile) {
    const fileIndex = files.findIndex(Boolean);
    const file = files[fileIndex]!;
    return (
      <UploadedThumb
        file={file}
        onAdd={() => onAdd(fileIndex)}
        onRemove={() => onRemove(fileIndex)}
        large
      />
    );
  }

  return (
    <button
      onClick={() => onAdd(0)}
      className="w-full rounded-xl border border-dashed border-neutral-700 bg-neutral-800/20 hover:bg-neutral-800/40 transition-colors py-14 sm:py-20 flex flex-col items-center justify-center gap-3"
    >
      <div className="w-10 h-10 rounded-full border border-dashed border-neutral-600 flex items-center justify-center">
        <Plus className="w-5 h-5 text-neutral-500" />
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
          Sube una imagen o arrastrala aqui
        </p>
        <p className="text-[11px] text-neutral-600 mt-1">
          PNG, JPG y JPEG (hasta 30MB)
        </p>
      </div>
    </button>
  );
}

function UploadedThumb({
  file,
  onAdd,
  onRemove,
  large,
}: {
  file: File | null;
  onAdd: () => void;
  onRemove: () => void;
  large?: boolean;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    setPreviewFailed(false);

    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const reader = new FileReader();
    let canceled = false;

    reader.onload = () => {
      if (canceled) return;
      if (typeof reader.result === "string") {
        setPreviewUrl(reader.result);
      } else {
        setPreviewFailed(true);
        setPreviewUrl(null);
      }
    };

    reader.onerror = () => {
      if (canceled) return;
      setPreviewFailed(true);
      setPreviewUrl(null);
    };

    reader.readAsDataURL(file);

    return () => {
      canceled = true;
      if (reader.readyState === FileReader.LOADING) {
        reader.abort();
      }
    };
  }, [file]);

  if (!file) {
    return (
      <button
        onClick={onAdd}
        className={cn(
          "rounded-xl border border-dashed border-neutral-700 bg-neutral-800/20 hover:bg-neutral-800/40 transition-colors flex flex-col items-center justify-center gap-2 flex-shrink-0",
          large ? "w-full py-14" : "w-40 h-32 sm:w-44 sm:h-36",
        )}
      >
        <div className="w-8 h-8 rounded-full border border-dashed border-neutral-600 flex items-center justify-center">
          <Plus className="w-4 h-4 text-neutral-500" />
        </div>
        <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider">
          Agregar imagen
        </span>
      </button>
    );
  }

  if (!previewUrl || previewFailed) {
    return (
      <div
        className={cn(
          "relative rounded-xl overflow-hidden bg-neutral-800/50 border border-neutral-700/40 flex flex-col items-center justify-center px-4 text-center",
          large ? "w-full aspect-[16/9] max-h-56" : "w-40 h-32 sm:w-44 sm:h-36",
        )}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
        >
          <X className="w-3 h-3 text-white" />
        </button>
        <button
          onClick={onAdd}
          className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
        >
          <Plus className="w-3 h-3 text-white" />
        </button>

        <FileImage className="w-8 h-8 text-neutral-500 mb-3" />
        <p className="text-xs font-medium text-neutral-300 line-clamp-2">
          {file.name}
        </p>
        <p className="text-[11px] text-neutral-500 mt-1">
          Vista previa no disponible
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden bg-neutral-800/50 border border-neutral-700/40 flex-shrink-0",
        large ? "w-full aspect-[16/9] max-h-56" : "w-40 h-32 sm:w-44 sm:h-36",
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={previewUrl}
        alt="Subida"
        onError={() => setPreviewFailed(true)}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
      >
        <X className="w-3 h-3 text-white" />
      </button>
      <button
        onClick={onAdd}
        className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
      >
        <Plus className="w-3 h-3 text-white" />
      </button>
    </div>
  );
}

/* ─── Right Panel ─────────────────────────────────────────────────────────── */

function PreviewPanel({
  isGenerating,
  isUploading,
  generatedAsset,
  inputThumbs,
  readyTitle,
  readySubtitle,
  pendingLabel,
  icon: Icon,
  sampleInput,
  sampleOutput,
  sourcePreviewUrl,
  onDownload,
}: {
  isGenerating: boolean;
  isUploading: boolean;
  generatedAsset: GeneratedAsset | null;
  inputThumbs: string[];
  readyTitle: string;
  readySubtitle: string;
  pendingLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  sampleInput?: string;
  sampleOutput?: string;
  sourcePreviewUrl?: string | null;
  onDownload?: () => void;
}) {
  if (generatedAsset) {
    return (
      <div className="relative w-full h-full rounded-xl overflow-hidden bg-neutral-900">
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          {onDownload ? (
            <button
              onClick={onDownload}
              className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <Download className="w-4 h-4 text-white" />
            </button>
          ) : null}
          <Link
            href="/app/gallery"
            className="rounded-full bg-black/50 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white hover:bg-black/70 transition-colors"
          >
            Galeria
          </Link>
        </div>

        {generatedAsset.mediaType === "model_3d" ? (
          <ModelViewerPreview
            src={generatedAsset.url}
            alt="Modelo 3D generado"
            posterSrc={sourcePreviewUrl ?? null}
            className="h-full w-full"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={generatedAsset.url}
            alt="Resultado generado"
            className="w-full h-full object-cover"
          />
        )}

        <div className="absolute top-3 left-3 rounded-full bg-black/55 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
          Guardado en la galeria
        </div>

        {/* Input thumbnails strip */}
        {inputThumbs.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 flex gap-2 p-3 justify-center bg-gradient-to-t from-black/60 via-black/30 to-transparent pt-8">
            {inputThumbs.map((url, i) => (
              <div
                key={i}
                className="w-14 h-14 rounded-lg overflow-hidden border border-white/20 bg-neutral-800"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="relative mb-5">
          <div className="w-14 h-14 rounded-full border-2 border-neutral-800" />
          <div className="absolute inset-0 w-14 h-14 rounded-full border-2 border-transparent border-t-white/60 animate-spin" />
        </div>
        <p className="text-sm font-medium text-neutral-300">
          {pendingLabel}
        </p>
        <p className="text-xs text-neutral-600 mt-1.5">
          {isUploading ? "Subiendo imagen de origen..." : "Normalmente tarda unos 30 segundos"}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-6">
      {/* Before → After visual */}
      <div className="flex items-center gap-5 mb-7">
        <div className="w-28 h-24 sm:w-32 sm:h-28 rounded-2xl bg-neutral-800/50 border border-neutral-700/30 flex items-center justify-center overflow-hidden">
          {sampleInput ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={sampleInput}
              alt="Entrada de muestra"
              className="w-full h-full object-cover"
            />
          ) : (
            <Icon className="w-8 h-8 text-neutral-600" />
          )}
        </div>
        <ArrowRight className="w-5 h-5 text-neutral-600 flex-shrink-0" />
        <div className="w-28 h-24 sm:w-32 sm:h-28 rounded-2xl bg-neutral-800/50 border border-neutral-700/30 flex items-center justify-center overflow-hidden">
          {sampleOutput ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={sampleOutput}
              alt="Resultado de muestra"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg border border-dashed border-neutral-600" />
          )}
        </div>
      </div>

      <h3 className="text-base font-semibold text-neutral-200 text-center">
        {readyTitle}
      </h3>
      <p className="text-xs text-neutral-500 mt-1.5 text-center max-w-[280px] leading-relaxed">
        {readySubtitle}
      </p>
    </div>
  );
}

/* ─── Main ────────────────────────────────────────────────────────────────── */

export function ToolDetailClient() {
  const params = useParams();
  const toolId = params.tool_id as string;
  const tool = getToolById(toolId);
  const isLiveTool = tool ? isToolGenerationReady(toolId) : false;
  const disabledReason = tool ? getToolUnavailableReason(toolId) : null;

  const maxSlots = tool?.multiUpload ? 4 : 1;
  const [files, setFiles] = useState<(File | null)[]>(
    () => Array(maxSlots).fill(null) as (File | null)[],
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploadingSource, setIsUploadingSource] = useState(false);
  const [generatedAsset, setGeneratedAsset] = useState<GeneratedAsset | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [sourceUploaded, setSourceUploaded] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeSlotRef = useRef<number>(0);

  useEffect(() => {
    setFiles(Array(maxSlots).fill(null) as (File | null)[]);
    setGeneratedAsset(null);
    setProjectId(null);
    setSourceUploaded(false);
  }, [maxSlots, toolId]);

  const syncSubscription = useCallback(async () => {
    const result = await getUserSubscription();
    if ("error" in result) return null;

    setSubscription(result);
    return result;
  }, []);

  useEffect(() => {
    void syncSubscription();
  }, [syncSubscription]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (!selected) return;

      if (!isSupportedToolImageFile(selected)) {
        toast.error("Usa una imagen JPG, PNG o WebP.");
        e.target.value = "";
        return;
      }

      setFiles((prev) => {
        const updated = [...prev];
        updated[activeSlotRef.current] = selected;
        return updated;
      });
      setGeneratedAsset(null);
      setProjectId(null);
      setSourceUploaded(false);
      e.target.value = "";
    },
    [],
  );

  const handleAdd = useCallback((slotIndex: number) => {
    activeSlotRef.current = slotIndex;
    inputRef.current?.click();
  }, []);

  const handleRemove = useCallback((slotIndex: number) => {
    setFiles((prev) => {
      const updated = [...prev];
      updated[slotIndex] = null;
      return updated;
    });
    setGeneratedAsset(null);
    setProjectId(null);
    setSourceUploaded(false);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!tool) return;

    if (!isLiveTool) {
      toast.error(
        disabledReason ?? `${tool.label} no esta disponible en este flujo.`,
      );
      return;
    }

    const selectedFiles = files.filter((file): file is File => file !== null);
    if (selectedFiles.length === 0) {
      toast.error("Sube una imagen primero.");
      return;
    }

    const currentSubscription = subscription ?? (await syncSubscription());
    if ((currentSubscription?.creationsRemaining ?? 0) < tool.creditCost) {
      setSubscriptionModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setGeneratedAsset(null);

    try {
      let activeProjectId = projectId;

      if (!activeProjectId) {
        const created = await createProject({
          sourceType: "upload",
          title: buildToolProjectTitle(tool.label, selectedFiles[0]),
        });

        if ("error" in created) {
          throw new Error(created.error);
        }

        activeProjectId = created.projectId;
        setProjectId(created.projectId);
      }

      if (!sourceUploaded) {
        setIsUploadingSource(true);
        const uploadResult = await uploadProjectImagesDirect(
          activeProjectId,
          selectedFiles,
        );

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || "No se pudo subir la imagen de origen.");
        }

        setSourceUploaded(true);
      }

      setIsUploadingSource(false);

      const result = await generateToolImage(activeProjectId, toolId);

      if (result.error || !result.outputUrl) {
        throw new Error(result.error || "La generacion fallo.");
      }

      setGeneratedAsset({
        url: result.outputUrl,
        mediaType: result.mediaType ?? "image",
      });
      toast.success(`${tool.label} generado y guardado en la galeria.`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "La generacion fallo.";
      if (message.includes("No hay suficientes bricks")) {
        await syncSubscription();
        setSubscriptionModalOpen(true);
      } else {
        toast.error(message);
      }
    } finally {
      setIsGenerating(false);
      setIsUploadingSource(false);
      void syncSubscription();
    }
  }, [
    disabledReason,
    files,
    isLiveTool,
    projectId,
    sourceUploaded,
    subscription,
    syncSubscription,
    tool,
    toolId,
  ]);

  const handleDownload = useCallback(async () => {
    if (!generatedAsset) return;

    try {
      await downloadFile(
        generatedAsset.url,
        `${toolId}.${generatedAsset.mediaType === "model_3d" ? "glb" : "png"}`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo descargar el archivo.";
      toast.error(message);
    }
  }, [generatedAsset, toolId]);

  const hasFiles = files.some(Boolean);

  const inputThumbs = useMemo(
    () =>
      files
        .filter((f): f is File => f !== null)
        .map((f) => URL.createObjectURL(f)),
    [files],
  );
  const primarySourcePreview = inputThumbs[0] ?? null;

  useEffect(() => {
    return () => {
      inputThumbs.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [inputThumbs]);

  if (!tool) {
    return (
      <div className="h-full bg-black flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-lg text-neutral-400">Herramienta no encontrada</p>
          <Link
            href="/app/tools"
            className="text-sm text-neutral-500 hover:text-white transition-colors underline"
          >
            Volver a herramientas
          </Link>
        </div>
      </div>
    );
  }

  const labelParts = tool.label.split(" ");
  const italicWord = tool.labelItalic;
  const titleBeforeItalic = labelParts
    .slice(0, labelParts.lastIndexOf(italicWord.split(" ")[0]))
    .join(" ");

  return (
    <>
      <div className="h-full bg-black overflow-y-auto">
      <div className="h-full flex flex-col px-5 sm:px-8 pt-5 sm:pt-6 pb-6">
        {/* Back */}
        <Link
          href="/app/tools"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-white transition-colors mb-5 flex-shrink-0 w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Herramientas</span>
        </Link>

        {/* Container card */}
        <div className="flex-1 min-h-0 rounded-2xl border border-neutral-800/60 bg-neutral-900/30 overflow-hidden">
          <div className="h-full flex flex-col lg:flex-row">
            {/* ── Left: controls ──────────────────────────────────────── */}
            <div className="lg:w-[45%] xl:w-[42%] flex-shrink-0 flex flex-col p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-neutral-800/60">
              {/* Title + description */}
              <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
                  {titleBeforeItalic}{" "}
                  <em className="italic font-bold">{italicWord}</em>
                </h1>
                <p className="text-[13px] text-neutral-500 mt-1.5 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              {/* Upload area */}
              <div className="flex-1 min-h-0 flex flex-col">
                <UploadZone
                  files={files}
                  onAdd={handleAdd}
                  onRemove={handleRemove}
                  multiUpload={tool.multiUpload}
                />

                <input
                  ref={inputRef}
                  type="file"
                  accept={TOOL_IMAGE_ACCEPT}
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {/* Bottom controls */}
              <div className="mt-6 space-y-3 flex-shrink-0">
                {isLiveTool ? (
                  <p className="text-xs text-neutral-500 text-center">
                    Tu solicitud costara{" "}
                    <span className="text-amber-400/90 font-medium">
                      {tool.creditCost} bricks
                    </span>
                  </p>
                ) : (
                  <p className="text-xs text-neutral-500 text-center leading-relaxed">
                    {disabledReason}
                  </p>
                )}

                {/* Generate */}
                <button
                  onClick={handleGenerate}
                  disabled={!hasFiles || isGenerating || !isLiveTool}
                  className={cn(
                    "w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                    hasFiles && !isGenerating && isLiveTool
                      ? "bg-white text-black hover:bg-neutral-200 active:scale-[0.98]"
                      : "bg-neutral-800 text-neutral-500 cursor-not-allowed",
                  )}
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isUploadingSource ? "Subiendo..." : "Generando..."}
                    </span>
                  ) : (
                    isLiveTool
                      ? toolId === "image-to-3d"
                        ? "Generar modelo 3D"
                        : "Generar imagen"
                      : "No disponible en Gemini 3.1"
                  )}
                </button>
              </div>
            </div>

            {/* ── Right: preview ──────────────────────────────────────── */}
            <div className="flex-1 min-w-0 min-h-[300px] lg:min-h-0">
              <PreviewPanel
                isGenerating={isGenerating}
                isUploading={isUploadingSource}
                generatedAsset={generatedAsset}
                inputThumbs={inputThumbs}
                readyTitle={tool.readyTitle}
                readySubtitle={isLiveTool ? tool.readySubtitle : disabledReason ?? tool.readySubtitle}
                pendingLabel={
                  isUploadingSource
                    ? "Subiendo fuente..."
                    : toolId === "image-to-3d"
                      ? "Generando modelo 3D..."
                      : `Generando ${tool.label.toLowerCase()}...`
                }
                icon={tool.icon}
                sampleInput={tool.inputPreview}
                sampleOutput={tool.outputPreview}
                sourcePreviewUrl={primarySourcePreview}
                onDownload={generatedAsset ? handleDownload : undefined}
              />
            </div>
          </div>
        </div>
      </div>
      </div>
      <SubscriptionModal
        open={subscriptionModalOpen}
        onOpenChange={setSubscriptionModalOpen}
        subscription={subscription}
        projectId={projectId ?? undefined}
      />
    </>
  );
}
