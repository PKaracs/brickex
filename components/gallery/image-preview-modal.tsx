"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { ModelViewerPreview } from "@/components/ui/model-viewer-preview";
import {
  Box,
  ChevronLeft,
  ChevronRight,
  Download,
  Layers3,
  Pencil,
  Play,
  Save,
  Share2,
  Trash2,
  X,
} from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { RENDER_MODES } from "@/lib/constants/render-modes";
import {
  GalleryProjectModalItem,
  GalleryProjectStack,
  getGalleryProjectCollection,
  getGalleryProjectCollectionLabel,
  getGalleryProjectItems,
  getGalleryProjectPrimaryDescriptor,
} from "./gallery-types";

const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkOAMAAPMASTyq3tQAAAAASUVORK5CYII=";

function formatFullDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ImagePreviewModalProps {
  project: GalleryProjectStack | null;
  selectedItemId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectedItemChange: (itemId: string) => void;
  onDownload?: (item: GalleryProjectModalItem) => void;
  onShare?: (item: GalleryProjectModalItem) => void;
  onDelete?: (item: GalleryProjectModalItem) => void;
  onDeleteProject?: (project: GalleryProjectStack) => void;
  isRenamingProject?: boolean;
  projectRenameValue?: string;
  onProjectRenameValueChange?: (value: string) => void;
  onProjectRenameStart?: (project: GalleryProjectStack) => void;
  onProjectRenameCancel?: () => void;
  onProjectRenameSubmit?: () => void;
  isSavingProjectName?: boolean;
}

export function ImagePreviewModal({
  project,
  selectedItemId,
  open,
  onOpenChange,
  onSelectedItemChange,
  onDownload,
  onShare,
  onDelete,
  onDeleteProject,
  isRenamingProject = false,
  projectRenameValue = "",
  onProjectRenameValueChange,
  onProjectRenameStart,
  onProjectRenameCancel,
  onProjectRenameSubmit,
  isSavingProjectName = false,
}: ImagePreviewModalProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const items = useMemo(() => (project ? getGalleryProjectItems(project) : []), [project]);

  const currentIndex = useMemo(() => {
    if (!selectedItemId) {
      return items.length > 0 ? 0 : -1;
    }

    return items.findIndex((item) => item.id === selectedItemId);
  }, [items, selectedItemId]);

  const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;
  const currentItem = items[safeCurrentIndex] ?? null;
  const hasPrevious = safeCurrentIndex > 0;
  const hasNext = safeCurrentIndex < items.length - 1;
  const minSwipeDistance = 50;

  const currentMode =
    currentItem?.kind === "variation" && currentItem.mode
      ? RENDER_MODES.find((mode) => mode.id === currentItem.mode)
      : null;
  const CurrentModeIcon = currentMode?.icon;
  const projectCollection = useMemo(
    () => (project ? getGalleryProjectCollection(project) : "tool"),
    [project],
  );
  const projectDescriptor = useMemo(
    () => (project ? getGalleryProjectPrimaryDescriptor(project) : "Tool"),
    [project],
  );
  const isCurrentVideo =
    currentItem?.kind === "variation" && currentItem.mediaType === "video";
  const isCurrentModel =
    currentItem?.kind === "variation" && currentItem.mediaType === "model_3d";

  const goToPrevious = useCallback(() => {
    if (!hasPrevious) return;
    onSelectedItemChange(items[safeCurrentIndex - 1].id);
  }, [hasPrevious, items, onSelectedItemChange, safeCurrentIndex]);

  const goToNext = useCallback(() => {
    if (!hasNext) return;
    onSelectedItemChange(items[safeCurrentIndex + 1].id);
  }, [hasNext, items, onSelectedItemChange, safeCurrentIndex]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      goToNext();
    } else if (distance < -minSwipeDistance) {
      goToPrevious();
    }
  }, [goToNext, goToPrevious, touchEnd, touchStart]);

  if (!project || !currentItem) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showXIcon={false}
        className="max-w-7xl w-full h-[100dvh] md:h-[92vh] p-0 bg-black border-neutral-900 overflow-hidden"
      >
        <div className="flex h-full flex-col md:flex-row bg-black text-white">
          <div
            className="relative flex-1 bg-neutral-950"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="absolute left-4 top-4 z-20 h-10 w-10 rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <X className="h-5 w-5" />
            </Button>

            {hasPrevious && (
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 z-20 h-11 w-11 -translate-y-1/2 rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}

            {hasNext && (
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="absolute right-4 top-1/2 z-20 h-11 w-11 -translate-y-1/2 rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}

            <div className="absolute left-4 top-16 z-20 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs text-neutral-200 backdrop-blur-sm">
              <Layers3 className="h-3.5 w-3.5" />
              <span>
                {safeCurrentIndex + 1} / {items.length}
              </span>
              <span className="text-neutral-500">•</span>
              <span>{currentItem.label}</span>
            </div>

            <div className="relative h-full w-full p-6 md:p-10 pb-28 md:pb-10">
              {isCurrentVideo ? (
                <div className="absolute inset-6 md:inset-10 bottom-28 md:bottom-10 flex items-center justify-center">
                  <div className="w-full max-w-5xl rounded-[28px] border border-neutral-800 bg-neutral-950/90 p-3 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
                    <div className="overflow-hidden rounded-[22px] border border-neutral-800 bg-black">
                      <video
                        key={currentItem.id}
                        src={currentItem.url}
                        controls
                        loop
                        playsInline
                        preload="metadata"
                        poster={project.original?.url}
                        className="max-h-[72vh] w-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              ) : isCurrentModel ? (
                <div className="absolute inset-6 md:inset-10 bottom-28 md:bottom-10 overflow-hidden rounded-[28px] border border-neutral-800 bg-neutral-950/90 p-3 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
                  <div className="h-full overflow-hidden rounded-[22px] border border-neutral-800 bg-black">
                    <ModelViewerPreview
                      src={currentItem.url}
                      alt={project.title}
                      posterSrc={project.original?.url}
                    />
                  </div>
                </div>
              ) : (
                <Image
                  src={currentItem.url}
                  alt={project.title}
                  fill
                  priority
                  unoptimized
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  className="object-contain"
                />
              )}
            </div>

            <div className="absolute inset-x-0 bottom-0 z-20 border-t border-neutral-900/80 bg-gradient-to-t from-black via-black/95 to-black/30 px-4 pb-4 pt-3 md:hidden">
              <div className="mb-3 flex gap-2 overflow-x-auto scrollbar-none">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelectedItemChange(item.id)}
                    className={cn(
                      "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border transition-all",
                      item.id === currentItem.id
                        ? "border-white"
                        : "border-neutral-800 opacity-70 hover:opacity-100",
                    )}
                  >
                    {item.kind === "variation" && item.mediaType === "video" ? (
                      <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
                        <Play className="w-5 h-5 text-neutral-300 fill-neutral-300" />
                      </div>
                    ) : item.kind === "variation" && item.mediaType === "model_3d" ? (
                      <>
                        {project.original ? (
                          <Image
                            src={project.original.url}
                            alt={item.label}
                            fill
                            unoptimized
                            sizes="64px"
                            loading="lazy"
                            placeholder="blur"
                            blurDataURL={BLUR_DATA_URL}
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-neutral-900" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Box className="w-5 h-5 text-white" />
                        </div>
                      </>
                    ) : (
                      <Image
                        src={item.url}
                        alt={item.label}
                        fill
                        unoptimized
                        sizes="64px"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL={BLUR_DATA_URL}
                        className="object-cover"
                      />
                    )}
                    <div className="absolute inset-x-1 bottom-1 rounded bg-black/70 px-1 py-0.5 text-[9px] text-white">
                      {item.kind === "original"
                        ? "OG"
                        : item.mediaType === "video"
                          ? "Video"
                          : item.mediaType === "model_3d"
                            ? "3D"
                          : item.label.replace("Variation ", "V")}
                    </div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={() => onDownload?.(currentItem)}
                  className="bg-white text-black hover:bg-neutral-200"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onShare?.(currentItem)}
                  className="border-neutral-700 text-neutral-200 hover:bg-neutral-800"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  disabled={currentItem.kind !== "variation"}
                  onClick={() => onDelete?.(currentItem)}
                  className="border-neutral-700 text-neutral-200 hover:bg-neutral-800 disabled:opacity-40"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>

          <aside className="hidden md:flex w-[360px] flex-col border-l border-neutral-900 bg-neutral-950/80">
            <div className="border-b border-neutral-900 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">Project Stack</p>
              {isRenamingProject ? (
                <div className="mt-3 space-y-3">
                  <Input
                    value={projectRenameValue}
                    onChange={(e) => onProjectRenameValueChange?.(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        onProjectRenameSubmit?.();
                      }
                      if (e.key === "Escape") {
                        e.preventDefault();
                        onProjectRenameCancel?.();
                      }
                    }}
                    placeholder="Project name"
                    autoFocus
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onProjectRenameCancel}
                      className="border-neutral-700 text-neutral-200 hover:bg-neutral-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="white"
                      size="sm"
                      onClick={onProjectRenameSubmit}
                      isLoading={isSavingProjectName}
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-medium text-white">{project.title}</h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      {project.variationCount} {project.variationCount === 1 ? "variation" : "variations"}
                      {project.original ? " + original" : ""}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onProjectRenameStart?.(project)}
                    className="h-9 w-9 rounded-full border border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              <div className="grid grid-cols-4 gap-2">
                {items.map((item) => {
                  const isVideo = item.kind === "variation" && item.mediaType === "video";
                  const isModel =
                    item.kind === "variation" && item.mediaType === "model_3d";
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectedItemChange(item.id)}
                      className={cn(
                        "group relative aspect-square overflow-hidden rounded-xl border transition-all",
                        item.id === currentItem.id
                          ? "border-white"
                          : "border-neutral-800 hover:border-neutral-700",
                      )}
                    >
                      {isVideo ? (
                        <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
                          <Play className="w-5 h-5 text-neutral-400 fill-neutral-400" />
                        </div>
                      ) : isModel ? (
                        <>
                          {project.original ? (
                            <Image
                              src={project.original.url}
                              alt={item.label}
                              fill
                              unoptimized
                              sizes="80px"
                              loading="lazy"
                              placeholder="blur"
                              blurDataURL={BLUR_DATA_URL}
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-neutral-900" />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Box className="w-5 h-5 text-white" />
                          </div>
                        </>
                      ) : (
                        <Image
                          src={item.url}
                          alt={item.label}
                          fill
                          unoptimized
                          sizes="80px"
                          loading="lazy"
                          placeholder="blur"
                          blurDataURL={BLUR_DATA_URL}
                          className="object-cover"
                        />
                      )}
                      <div className="absolute inset-x-1 bottom-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                        {item.kind === "original"
                          ? "Original"
                          : isVideo
                            ? "Video"
                            : isModel
                              ? "3D"
                              : item.label.replace("Variation ", "V")}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-neutral-500">Selection</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex rounded-full border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-200">
                      {currentItem.label}
                    </span>
                    <span className="inline-flex rounded-full border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-200">
                      {projectDescriptor}
                    </span>
                    {currentMode && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-200">
                        {CurrentModeIcon && <CurrentModeIcon className="h-3 w-3" />}
                        {currentMode.label}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-neutral-500">Created</p>
                  <p className="mt-2 text-sm text-neutral-300">{formatFullDate(currentItem.createdAt)}</p>
                </div>

                {currentItem.kind === "original" ? (
                  <div>
                    <p className="text-xs font-medium text-neutral-500">Original Input</p>
                    <p className="mt-2 text-sm text-neutral-300">
                      {currentItem.filename || "Saved source image"}
                    </p>
                    <p className="mt-2 text-sm text-neutral-500">
                      This is the source image used for this render project.
                    </p>
                  </div>
                ) : (
                  <>
                    {currentItem.title && (
                      <div>
                        <p className="text-xs font-medium text-neutral-500">Output</p>
                        <p className="mt-2 text-sm text-neutral-300">{currentItem.title}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium text-neutral-500">Collection</p>
                      <p className="mt-2 text-sm text-neutral-300">
                        {getGalleryProjectCollectionLabel(projectCollection)}
                      </p>
                    </div>
                    {currentItem.prompt && (
                      <div>
                        <p className="text-xs font-medium text-neutral-500">Prompt</p>
                        <div className="mt-2 max-h-56 overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3">
                          <p className="text-sm leading-relaxed text-neutral-300">
                          {currentItem.prompt}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="border-t border-neutral-900 p-5 space-y-2">
              <Button
                onClick={() => onDownload?.(currentItem)}
                className="w-full bg-white text-black hover:bg-neutral-200"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button
                variant="outline"
                onClick={() => onShare?.(currentItem)}
                className="w-full border-neutral-700 text-neutral-200 hover:bg-neutral-800"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share Link
              </Button>
              <Button
                variant="outline"
                onClick={() => onProjectRenameStart?.(project)}
                className="w-full border-neutral-700 text-neutral-200 hover:bg-neutral-800"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Rename Project
              </Button>
              <Button
                variant="outline"
                disabled={currentItem.kind !== "variation"}
                onClick={() => onDelete?.(currentItem)}
                className="w-full border-neutral-700 text-neutral-200 hover:bg-neutral-800 disabled:opacity-40"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Variation
              </Button>
              <Button
                variant="outline"
                onClick={() => onDeleteProject?.(project)}
                className="w-full border-red-900/60 text-red-300 hover:bg-red-950/40 hover:text-red-200"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Project
              </Button>
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}
