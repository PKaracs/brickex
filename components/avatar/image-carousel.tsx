"use client";

import { ChevronLeft, ChevronRight, Loader2, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImageItem } from "@/lib/hooks/use-avatar-upload";

interface ImageCarouselProps {
  images: ImageItem[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onRemove: () => void;
  isDeleting: boolean;
  isUploading: boolean;
}

export function ImageCarousel({
  images,
  currentIndex,
  onNext,
  onPrev,
  onRemove,
  isDeleting,
  isUploading,
}: ImageCarouselProps) {
  const currentImage = images[currentIndex];
  if (!currentImage) return null;

  const isExisting = currentImage.type === "existing";
  // Count existing images to prevent deleting the last one
  const existingImagesCount = images.filter(img => img.type === "existing").length;
  const isLastExisting = isExisting && existingImagesCount === 1;
  const canDelete = !isLastExisting;

  return (
    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
      <img
        src={currentImage.url}
        alt={`Image ${currentIndex + 1}`}
        className="w-full h-full object-cover"
      />

      {/* Remove button */}
      {!isUploading && (
        <button
          onClick={onRemove}
          disabled={isDeleting || !canDelete}
          className={cn(
            "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors",
            !canDelete && "cursor-not-allowed opacity-50",
            isExisting && canDelete
              ? "bg-red-500/80 hover:bg-red-500"
              : isExisting && !canDelete
              ? "bg-neutral-700/50"
              : "bg-black/60 hover:bg-black/80"
          )}
          title={!canDelete ? "Debes conservar al menos una imagen de avatar" : undefined}
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          ) : isExisting ? (
            <Trash2 className="w-4 h-4 text-white" />
          ) : (
            <X className="w-4 h-4 text-white" />
          )}
        </button>
      )}

      {/* Navigation */}
      {images.length > 1 && (
        <>
          <button
            onClick={onPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={onNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </>
      )}

      {/* Counter */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/60 text-xs text-white">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Upload overlay */}
      {isUploading && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            <p className="text-sm text-white">Subiendo...</p>
          </div>
        </div>
      )}
    </div>
  );
}
