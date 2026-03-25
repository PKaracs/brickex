"use client";

import { useState, useEffect, useRef, useCallback, memo, useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  Upload,
  FileImage,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FolderOpen,
  ImageIcon,
  ArrowUp,
  Pencil,
  BoxSelect,
  MessageSquare,
  Pentagon,
  Eraser,
  Undo2,
  Redo2,
  RotateCcw,
  Monitor,
  SplitSquareHorizontal,
  Download,
  Search,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { GalleryListImage } from "@/components/gallery/gallery-list-card";
import { getUserOutputsPaginated } from "@/lib/actions/get-user-outputs";
import { RENDER_MODES } from "@/lib/constants/render-modes";
import Image from "next/image";

import type { AngleSlot } from "@/lib/constants/render-modes";

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/tiff",
  "application/pdf",
  "application/dxf",
  "application/acad",
  ".dwg",
  ".dxf",
];

const ACCEPTED_EXTENSIONS = ".jpg,.jpeg,.png,.webp,.svg,.tiff,.tif,.pdf,.dwg,.dxf";

const GENERATION_TIPS = [
  "Analyzing your input...",
  "Understanding the architecture...",
  "Generating the render...",
  "Applying materials and lighting...",
  "Fine-tuning details...",
  "Almost there...",
];

function GeneratingState() {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % GENERATION_TIPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-neutral-800" />
        <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-t-white/60 animate-spin" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-white font-medium">Creating your render</p>
        <p className="text-sm text-neutral-500">{GENERATION_TIPS[tipIndex]}</p>
      </div>
      <p className="text-xs text-neutral-600">This usually takes ~30 seconds</p>
    </div>
  );
}

function PickFromGalleryModal({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
}) {
  const [images, setImages] = useState<GalleryListImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    setSearchQuery("");
    getUserOutputsPaginated(0, 48).then((result) => {
      if ("images" in result) {
        setImages(
          result.images
            .filter((img) => (img.mediaType ?? "image") === "image")
            .map((img) => ({
              id: img.id,
              url: img.url,
              createdAt: new Date(img.createdAt),
              projectId: img.projectId,
              mode: img.mode,
              prompt: img.prompt,
              mediaType: img.mediaType,
            }))
        );
      }
      setIsLoading(false);
    });
  }, [open]);

  const filteredImages = useMemo(() => {
    if (!searchQuery.trim()) return images;
    const q = searchQuery.toLowerCase();
    return images.filter((img) => {
      const mode = img.mode
        ? RENDER_MODES.find((m) => m.id === img.mode)
        : null;
      return (
        img.prompt?.toLowerCase().includes(q) ||
        mode?.label.toLowerCase().includes(q)
      );
    });
  }, [images, searchQuery]);

  const getModeLabel = (modeId?: string) => {
    if (!modeId) return null;
    return RENDER_MODES.find((m) => m.id === modeId)?.label ?? null;
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showXIcon={false}
        className="max-w-3xl w-full md:w-[88vw] max-h-[85vh] bg-neutral-950 border-neutral-800 p-0 overflow-hidden flex flex-col"
      >
        <div className="flex-shrink-0 px-5 pt-5 pb-0 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Your Gallery</h2>
              <p className="text-sm text-neutral-500 mt-0.5">
                {isLoading
                  ? "Loading your images..."
                  : `${images.length} image${images.length !== 1 ? "s" : ""} available`}
              </p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="w-8 h-8 rounded-full bg-neutral-800/80 border border-neutral-700/50 flex items-center justify-center hover:bg-neutral-700 transition-colors"
            >
              <X className="w-4 h-4 text-neutral-400" />
            </button>
          </div>

          {!isLoading && images.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by prompt or mode..."
                className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-neutral-600 transition-colors"
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-none px-5 pb-5 pt-4">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-square bg-neutral-800/60 rounded-xl animate-pulse" />
                  <div className="space-y-1.5 px-0.5">
                    <div className="h-3 w-16 bg-neutral-800/60 rounded animate-pulse" />
                    <div className="h-2.5 w-24 bg-neutral-800/40 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-neutral-800/50 border border-neutral-700/50 flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-7 h-7 text-neutral-600" />
              </div>
              <p className="text-sm font-medium text-neutral-400">No images yet</p>
              <p className="text-xs text-neutral-600 mt-1">
                Generate some renders first, then pick them here
              </p>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="py-16 text-center">
              <Search className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
              <p className="text-sm text-neutral-500">
                No results for &ldquo;{searchQuery}&rdquo;
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredImages.map((img) => {
                const modeLabel = getModeLabel(img.mode);
                const isHovered = hoveredId === img.id;

                return (
                  <button
                    key={img.id}
                    onClick={() => {
                      onSelect(img.url);
                      onOpenChange(false);
                    }}
                    onMouseEnter={() => setHoveredId(img.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="group text-left rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
                  >
                    <div
                      className={cn(
                        "relative aspect-square rounded-xl overflow-hidden border transition-all duration-200",
                        isHovered
                          ? "border-white/25 shadow-[0_0_20px_rgba(255,255,255,0.06)]"
                          : "border-neutral-800/80"
                      )}
                    >
                      <Image
                        src={img.url}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      <div
                        className={cn(
                          "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-200",
                          isHovered ? "opacity-100" : "opacity-0"
                        )}
                      />

                      <div
                        className={cn(
                          "absolute inset-0 flex items-center justify-center transition-opacity duration-200",
                          isHovered ? "opacity-100" : "opacity-0"
                        )}
                      >
                        <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                          <Check className="w-5 h-5 text-black" />
                        </div>
                      </div>

                      {modeLabel && (
                        <div
                          className={cn(
                            "absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm transition-opacity duration-200",
                            isHovered ? "opacity-100" : "opacity-0"
                          )}
                        >
                          <span className="text-[10px] font-medium text-neutral-300">
                            {modeLabel}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 px-0.5">
                      <p className="text-[11px] text-neutral-500">
                        {formatDate(img.createdAt)}
                      </p>
                      {img.prompt && (
                        <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                          {img.prompt}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface CanvasProps {
  projectId: string;
  uploadedFiles: File[];
  sourceUrl: string | null;
  generatedImageUrl: string | null;
  isGenerating: boolean;
  onFilesAdded: (files: File[]) => void;
  onFileRemoved: (index: number) => void;
  onSourceUrlSet: (url: string) => void;
  onClearSource: () => void;
  isEditGenerating?: boolean;
  onRegionEditSubmit?: (annotatedImageBase64: string, prompt: string) => void;
  originalImageUrl?: string | null;
  isComparing?: boolean;
  canCompare?: boolean;
  onToggleCompare?: () => void;
  onSelectionChange?: (hasSelection: boolean) => void;
  editHistory?: string[];
  editHistoryIndex?: number;
  onHistorySelect?: (index: number) => void;
  onDownload?: () => void;
  sourcePreviewUrl?: string | null;
  slots?: AngleSlot[];
  activeSlotIndex?: number;
  onActiveSlotChange?: (index: number) => void;
}

interface SelectionRect {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

function normalizeRect(rect: SelectionRect) {
  return {
    x: Math.min(rect.startX, rect.endX),
    y: Math.min(rect.startY, rect.endY),
    width: Math.abs(rect.endX - rect.startX),
    height: Math.abs(rect.endY - rect.startY),
  };
}

export const Canvas = memo(function Canvas({
  projectId,
  uploadedFiles,
  sourceUrl,
  generatedImageUrl,
  isGenerating,
  onFilesAdded,
  onFileRemoved,
  onSourceUrlSet,
  onClearSource,
  isEditGenerating = false,
  onRegionEditSubmit,
  originalImageUrl,
  isComparing = false,
  canCompare = false,
  onToggleCompare,
  onSelectionChange,
  editHistory = [],
  editHistoryIndex = -1,
  onHistorySelect,
  onDownload,
  sourcePreviewUrl,
  slots = [],
  activeSlotIndex = 0,
  onActiveSlotChange,
}: CanvasProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // Region edit state (fully local to canvas)
  const [selection, setSelection] = useState<SelectionRect | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [regionPrompt, setRegionPrompt] = useState("");
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const generatedImgRef = useRef<HTMLImageElement>(null);

  const hasGenerated = !!generatedImageUrl;

  const hasSource = uploadedFiles.length > 0 || sourceUrl;

  useEffect(() => {
    if (generatedImageUrl || originalImageUrl) {
      setImageLoaded(false);
    }
  }, [generatedImageUrl, originalImageUrl, isComparing]);

  useEffect(() => {
    if (currentFileIndex >= uploadedFiles.length && uploadedFiles.length > 0) {
      setCurrentFileIndex(uploadedFiles.length - 1);
    }
  }, [uploadedFiles.length, currentFileIndex]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      dragCounterRef.current = 0;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onFilesAdded(files);
      }
    },
    [onFilesAdded]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length > 0) {
        onFilesAdded(files);
      }
      e.target.value = "";
    },
    [onFilesAdded]
  );

  const blobUrls = uploadedFiles.map((f) => URL.createObjectURL(f));

  useEffect(() => {
    return () => {
      blobUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [uploadedFiles]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset selection when no generated image
  useEffect(() => {
    if (!hasGenerated) {
      setSelection(null);
      setRegionPrompt("");
    }
  }, [hasGenerated]);

  // Notify parent about selection state
  useEffect(() => {
    onSelectionChange?.(!!selection);
  }, [selection, onSelectionChange]);

  // Draw the green overlay rectangle on the canvas
  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    const container = imageContainerRef.current;
    if (!canvas || !container || !hasGenerated) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (selection) {
      const norm = normalizeRect(selection);
      ctx.fillStyle = "rgba(74, 222, 128, 0.25)";
      ctx.fillRect(norm.x, norm.y, norm.width, norm.height);
      ctx.strokeStyle = "rgba(74, 222, 128, 0.8)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(norm.x, norm.y, norm.width, norm.height);
    }
  }, [selection, hasGenerated]);

  const getPointerPos = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const container = imageContainerRef.current;
      if (!container) return { x: 0, y: 0 };
      const rect = container.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!hasGenerated) return;
      const pos = getPointerPos(e);
      setIsDrawing(true);
      setSelection({ startX: pos.x, startY: pos.y, endX: pos.x, endY: pos.y });
      setRegionPrompt("");
    },
    [hasGenerated, getPointerPos]
  );

  const handlePointerMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing || !selection) return;
      const pos = getPointerPos(e);
      setSelection((prev) =>
        prev ? { ...prev, endX: pos.x, endY: pos.y } : null
      );
    },
    [isDrawing, selection, getPointerPos]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (selection) {
      const norm = normalizeRect(selection);
      if (norm.width < 10 || norm.height < 10) {
        setSelection(null);
      }
    }
  }, [isDrawing, selection]);

  const handleEditSubmitInternal = useCallback(() => {
    if (!selection || !regionPrompt.trim() || !onRegionEditSubmit || !generatedImageUrl)
      return;

    const img = generatedImgRef.current;
    if (!img) return;

    // Cap at 1024px to keep payload under body limits
    const maxDim = 1024;
    const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
    const outW = Math.round(img.naturalWidth * scale);
    const outH = Math.round(img.naturalHeight * scale);

    const offscreen = document.createElement("canvas");
    offscreen.width = outW;
    offscreen.height = outH;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, 0, 0, outW, outH);

    const container = imageContainerRef.current;
    if (!container) return;

    const displayRect = img.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const imgDisplayLeft = displayRect.left - containerRect.left;
    const imgDisplayTop = displayRect.top - containerRect.top;
    const scaleX = outW / displayRect.width;
    const scaleY = outH / displayRect.height;

    const norm = normalizeRect(selection);
    const natX = (norm.x - imgDisplayLeft) * scaleX;
    const natY = (norm.y - imgDisplayTop) * scaleY;
    const natW = norm.width * scaleX;
    const natH = norm.height * scaleY;

    ctx.fillStyle = "rgba(74, 222, 128, 0.4)";
    ctx.fillRect(natX, natY, natW, natH);
    ctx.strokeStyle = "rgba(74, 222, 128, 1)";
    ctx.lineWidth = Math.max(2, 4 * scale);
    ctx.strokeRect(natX, natY, natW, natH);

    const annotatedBase64 = offscreen.toDataURL("image/jpeg", 0.85).split(",")[1];
    onRegionEditSubmit(annotatedBase64, regionPrompt.trim());
    setSelection(null);
    setRegionPrompt("");
  }, [selection, regionPrompt, onRegionEditSubmit, generatedImageUrl]);

  const handleClearSelection = useCallback(() => {
    setSelection(null);
    setRegionPrompt("");
  }, []);

  // Multi-slot grid view: when multiple slots exist and at least one has output
  const multiSlotOutputs = slots.filter((s) => s.status === "done" || s.status === "generating" || s.status === "error");
  const hasMultiSlotOutputs = slots.length > 1 && multiSlotOutputs.length > 0;

  // Generated image display (single active image with edit tools)
  if (generatedImageUrl) {
    const showOriginal = canCompare && isComparing && originalImageUrl;
    const displayUrl = showOriginal ? originalImageUrl : generatedImageUrl;
    const promptNorm = selection ? normalizeRect(selection) : null;

    return (
      <Card className="flex-1 min-h-0 rounded-xl border-2 bg-neutral-900/30 overflow-hidden relative">
        {/* Multi-slot strip at top */}
        {hasMultiSlotOutputs && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-2 py-1.5 bg-black/70 backdrop-blur-sm rounded-xl">
            {slots.map((slot, idx) => (
              <button
                key={slot.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onActiveSlotChange?.(idx);
                }}
                title={slot.label}
                className={cn(
                  "relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0",
                  idx === activeSlotIndex
                    ? "border-white shadow-lg scale-105"
                    : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                {slot.status === "done" && slot.outputUrl ? (
                  <img
                    src={slot.outputUrl}
                    alt={slot.label}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                ) : slot.status === "generating" ? (
                  <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-neutral-400 animate-spin" />
                  </div>
                ) : slot.status === "error" ? (
                  <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                    <X className="w-4 h-4 text-red-400" />
                  </div>
                ) : (
                  <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                    <span className="text-[9px] text-neutral-500">{idx + 1}</span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-end justify-center pb-0.5">
                  <span className="text-[7px] font-bold text-white drop-shadow-lg leading-none">
                    {idx + 1}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="w-full h-full rounded-lg border border-neutral-700 bg-neutral-900/50 flex items-center justify-center overflow-hidden">
          <div className="w-full h-full flex flex-col min-h-0 overflow-hidden">
            <div
              ref={imageContainerRef}
              className="flex-1 relative flex items-center justify-center min-h-0 overflow-hidden transition-all duration-500 p-4 cursor-crosshair"
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
            >
              {!imageLoaded && (
                <img
                  src={displayUrl!}
                  alt=""
                  aria-hidden="true"
                  {...(!displayUrl?.startsWith("data:") && { crossOrigin: "anonymous" as const })}
                  className="absolute max-w-full max-h-full object-contain rounded-lg shadow-2xl blur-lg scale-105 opacity-60"
                />
              )}
              <img
                ref={generatedImgRef}
                src={displayUrl!}
                alt="Generated render"
                {...(!displayUrl?.startsWith("data:") && { crossOrigin: "anonymous" as const })}
                onLoad={() => setImageLoaded(true)}
                className={cn(
                  "max-w-full max-h-full object-contain transition-all duration-500 rounded-lg shadow-2xl select-none pointer-events-none",
                  !imageLoaded && "opacity-0"
                )}
                draggable={false}
              />

              {/* Selection overlay canvas */}
              <canvas
                ref={overlayCanvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
              />

              {/* Edit generating spinner */}
              {isEditGenerating && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/25 rounded-lg">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                    <p className="text-sm text-white/80">Applying edit...</p>
                  </div>
                </div>
              )}

              {/* Floating prompt input near selection (local to canvas) */}
              {selection && !isDrawing && promptNorm && promptNorm.width >= 10 && (
                <div
                  className="absolute z-20 flex flex-col items-center gap-2"
                  style={{
                    left: `${Math.min(promptNorm.x + promptNorm.width / 2, (imageContainerRef.current?.getBoundingClientRect().width ?? 400) - 140)}px`,
                    top: `${Math.max(promptNorm.y - 52, 8)}px`,
                    transform: "translateX(-50%)",
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1.5 bg-white rounded-full shadow-xl pl-4 pr-1.5 py-1.5 min-w-[220px] max-w-[320px]">
                    <input
                      type="text"
                      value={regionPrompt}
                      onChange={(e) => setRegionPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && regionPrompt.trim()) {
                          handleEditSubmitInternal();
                        }
                        if (e.key === "Escape") handleClearSelection();
                      }}
                      placeholder="Suggest change (1 brick)"
                      className="flex-1 bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 outline-none min-w-0"
                      autoFocus
                      disabled={isEditGenerating}
                    />
                    <button
                      onClick={handleEditSubmitInternal}
                      disabled={!regionPrompt.trim() || isEditGenerating}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-neutral-800 text-white hover:bg-neutral-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Compare label */}
              {showOriginal && (
                <div className="absolute top-6 left-6 z-20 px-3 py-1 bg-black/70 rounded-full text-xs text-white/80">
                  Original
                </div>
              )}

              {/* Version history strip */}
              {editHistory.length > 0 && (
                <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 px-2 py-1.5 bg-black/70 backdrop-blur-sm rounded-xl">
                  {/* Source input image */}
                  {sourcePreviewUrl && (
                    <div
                      title="Input"
                      className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-transparent opacity-50 shrink-0"
                    >
                      <img
                        src={sourcePreviewUrl}
                        alt="Input"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-end justify-center pb-0.5">
                        <span className="text-[7px] font-bold text-white drop-shadow-lg leading-none">
                          IN
                        </span>
                      </div>
                    </div>
                  )}
                  {/* Generated versions */}
                  {editHistory.map((url, idx) => {
                    const label = idx === 0 ? "Original" : `Edit ${idx}`;
                    const isActive = idx === editHistoryIndex;
                    return (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          onHistorySelect?.(idx);
                        }}
                        title={label}
                        className={cn(
                          "relative w-10 h-10 rounded-lg overflow-hidden border-2 transition-all shrink-0",
                          isActive
                            ? "border-white shadow-lg scale-105"
                            : "border-transparent opacity-60 hover:opacity-100"
                        )}
                      >
                        <img
                          src={url}
                          alt={label}
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                        />
                        <div className="absolute inset-0 flex items-end justify-center pb-0.5">
                          <span className="text-[7px] font-bold text-white drop-shadow-lg leading-none">
                            {idx === 0 ? "OG" : idx}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom editing toolbar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-0.5 px-2 py-1.5 bg-neutral-900/95 backdrop-blur-md border border-neutral-700/60 rounded-xl shadow-2xl">
          {/* Drawing tools */}
          <button title="Select region" className="w-9 h-9 flex items-center justify-center rounded-lg bg-white text-black">
            <BoxSelect className="w-4 h-4" />
          </button>
          <button title="Comment" className="w-9 h-9 flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
            <MessageSquare className="w-4 h-4" />
          </button>
          <button title="Shape" className="w-9 h-9 flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
            <Pentagon className="w-4 h-4" />
          </button>
          <button title="Eraser" className="w-9 h-9 flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
            <Eraser className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-neutral-700 mx-1" />

          {/* History */}
          <button
            onClick={(e) => { e.stopPropagation(); if (editHistoryIndex > 0) onHistorySelect?.(editHistoryIndex - 1); }}
            disabled={editHistoryIndex <= 0}
            title="Undo"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); if (editHistoryIndex < editHistory.length - 1) onHistorySelect?.(editHistoryIndex + 1); }}
            disabled={editHistoryIndex >= editHistory.length - 1}
            title="Redo"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); if (editHistory.length > 0) onHistorySelect?.(0); }}
            title="Reset to original"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-neutral-700 mx-1" />

          {/* View / actions */}
          <button title="Fullscreen" className="w-9 h-9 flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); if (canCompare) onToggleCompare?.(); }}
            disabled={!canCompare}
            title="Compare with original"
            className={cn(
              "w-9 h-9 flex items-center justify-center rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
              isComparing && canCompare
                ? "bg-white text-black"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            )}
          >
            <SplitSquareHorizontal className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDownload?.(); }}
            title="Download"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </Card>
    );
  }

  // Generating state
  if (isGenerating) {
    if (slots.length > 1) {
      const gridCols = slots.length <= 2 ? "grid-cols-2" : slots.length <= 4 ? "grid-cols-2" : "grid-cols-3";
      return (
        <Card className="flex-1 min-h-0 rounded-xl border-2 bg-neutral-900/30 overflow-hidden">
          <div className={cn("w-full h-full grid gap-2 p-2", gridCols)}>
            {slots.map((slot, idx) => (
              <div
                key={slot.id}
                className="relative rounded-lg border border-neutral-700 bg-neutral-900/50 flex flex-col items-center justify-center overflow-hidden"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full border-2 border-neutral-800" />
                  <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-transparent border-t-white/60 animate-spin" />
                </div>
                <p className="text-xs text-neutral-500 mt-3">{slot.label}</p>
              </div>
            ))}
          </div>
        </Card>
      );
    }

    return (
      <Card className="flex-1 min-h-0 rounded-xl border-2 bg-neutral-900/30 overflow-hidden">
        <div className="w-full h-full rounded-lg border border-neutral-700 bg-neutral-900/50 flex flex-col items-center justify-center overflow-hidden">
          <GeneratingState />
        </div>
      </Card>
    );
  }

  // Source preview (uploaded files or gallery pick)
  if (hasSource) {
    const displayUrl = sourceUrl ?? blobUrls[currentFileIndex];
    const isFileSource = uploadedFiles.length > 0;
    const currentFile = isFileSource ? uploadedFiles[currentFileIndex] : null;
    const isPdf = currentFile?.type === "application/pdf";
    const isCad = currentFile?.name.match(/\.(dwg|dxf)$/i);

    return (
      <div
        className="flex-1 flex flex-col min-h-0 gap-3"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Card
          className={cn(
            "flex-1 min-h-0 rounded-xl border-2 bg-neutral-900/30 overflow-hidden relative",
            isDragOver
              ? "border-white/40 bg-white/5"
              : "border-neutral-800/80"
          )}
        >
          {/* Clear button */}
          <button
            onClick={onClearSource}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-neutral-900/80 border border-neutral-700 flex items-center justify-center hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4 text-neutral-300" />
          </button>

          {/* File preview */}
          <div className="w-full h-full rounded-lg border border-neutral-700 bg-neutral-900/50 flex items-center justify-center overflow-hidden p-4">
            {isPdf || isCad ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                  <FileImage className="w-10 h-10 text-neutral-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-white">{currentFile?.name}</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {isPdf ? "PDF" : "CAD"} file ready for processing
                  </p>
                </div>
              </div>
            ) : displayUrl ? (
              <div className="relative flex-1 h-full flex items-center justify-center">
                <img
                  src={displayUrl}
                  alt="Source image"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
                {/* Navigation arrows for multiple files */}
                {isFileSource && uploadedFiles.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentFileIndex((prev) =>
                          (prev - 1 + uploadedFiles.length) % uploadedFiles.length
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-neutral-800/80 hover:bg-neutral-700 flex items-center justify-center transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentFileIndex((prev) =>
                          (prev + 1) % uploadedFiles.length
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-neutral-800/80 hover:bg-neutral-700 flex items-center justify-center transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-white" />
                    </button>
                    <div className="absolute top-3 left-3 px-2 py-1 rounded bg-neutral-800/80 text-xs text-white">
                      {currentFileIndex + 1} / {uploadedFiles.length}
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>

          {/* Drag overlay */}
          {isDragOver && (
            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-white" />
                <p className="text-sm font-medium text-white">Drop to add more files</p>
              </div>
            </div>
          )}
        </Card>

        {/* Thumbnail strip + add more */}
        {isFileSource && uploadedFiles.length > 0 && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex gap-2 flex-1 overflow-x-auto scrollbar-none">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="relative flex-shrink-0 group">
                  <button
                    onClick={() => setCurrentFileIndex(index)}
                    className={cn(
                      "w-12 h-12 rounded-lg overflow-hidden border-2 transition-all",
                      index === currentFileIndex
                        ? "border-white"
                        : "border-neutral-700 opacity-60 hover:opacity-100"
                    )}
                  >
                    {file.type.startsWith("image/") ? (
                      <img
                        src={blobUrls[index]}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                        <FileImage className="w-4 h-4 text-neutral-500" />
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => onFileRemoved(index)}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neutral-700 border border-neutral-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-2.5 h-2.5 text-white" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 flex-shrink-0 rounded-lg border-2 border-dashed border-neutral-700 flex items-center justify-center hover:border-neutral-500 hover:bg-neutral-800/30 transition-colors"
            >
              <Upload className="w-4 h-4 text-neutral-500" />
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS}
          className="hidden"
          onChange={handleFileInput}
        />
        <PickFromGalleryModal
          open={galleryOpen}
          onOpenChange={setGalleryOpen}
          onSelect={onSourceUrlSet}
        />
      </div>
    );
  }

  // Empty state — upload area
  return (
    <div
      className="flex-1 min-h-0"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Card
        className={cn(
          "w-full h-full rounded-xl border-2 bg-neutral-900/30 overflow-hidden transition-all duration-200 cursor-pointer",
          isDragOver
            ? "border-white/40 bg-white/5 scale-[1.01]"
            : "hover:bg-neutral-900/50"
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-full h-full rounded-lg border border-neutral-700 bg-neutral-900/50 flex items-center justify-center overflow-hidden">
        <div className="flex flex-col items-center gap-4 p-6 max-w-md text-center">
          <div
            className={cn(
              "w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-dashed flex items-center justify-center transition-all",
              isDragOver
                ? "border-white/40 bg-white/10"
                : "border-neutral-600 bg-neutral-800/50"
            )}
          >
            <Upload
              className={cn(
                "w-7 h-7 md:w-9 md:h-9 transition-colors",
                isDragOver ? "text-white" : "text-neutral-400"
              )}
            />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base md:text-lg font-medium text-white">
              {isDragOver ? "Drop files here" : "Upload your source"}
            </h3>
            <p className="text-xs md:text-sm text-neutral-500 leading-relaxed">
              Drag & drop floor plans, sketches, photos, AutoCAD files — or click to browse
            </p>
          </div>

          {/* Quick action buttons */}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              Browse Files
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setGalleryOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 text-sm font-medium border border-neutral-700 hover:bg-neutral-700 hover:text-white transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
              Pick from Gallery
            </button>
          </div>

          <p className="text-[10px] text-neutral-600 mt-1">
            JPG, PNG, WebP, SVG, PDF, DWG, DXF
          </p>
        </div>
        </div>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPTED_EXTENSIONS}
        className="hidden"
        onChange={handleFileInput}
      />
      <PickFromGalleryModal
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        onSelect={onSourceUrlSet}
      />
    </div>
  );
});
