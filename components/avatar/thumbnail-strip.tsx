"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImageItem } from "@/lib/hooks/use-avatar-upload";

interface ThumbnailStripProps {
  images: ImageItem[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onAddMore: (files: File[]) => void;
  canAddMore: boolean;
  disabled?: boolean;
}

export function ThumbnailStrip({
  images,
  currentIndex,
  onSelect,
  onAddMore,
  canAddMore,
  disabled,
}: ThumbnailStripProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onAddMore(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  return (
    <div className="flex gap-2 justify-center flex-wrap">
      {images.map((img, index) => (
        <button
          key={img.id}
          onClick={() => onSelect(index)}
          disabled={disabled}
          className={cn(
            "relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all",
            index === currentIndex
              ? "border-white"
              : "border-transparent opacity-50 hover:opacity-80",
            disabled && "cursor-not-allowed"
          )}
        >
          <img
            src={img.url}
            alt={`Thumbnail ${index + 1}`}
            className="w-full h-full object-cover"
          />
          {img.type === "existing" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
          )}
        </button>
      ))}

      {canAddMore && !disabled && (
        <>
          <button
            onClick={() => inputRef.current?.click()}
            className="w-14 h-14 rounded-lg border-2 border-dashed border-neutral-700 hover:border-neutral-600 flex items-center justify-center transition-colors"
          >
            <Upload className="w-4 h-4 text-neutral-500" />
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
        </>
      )}
    </div>
  );
}
