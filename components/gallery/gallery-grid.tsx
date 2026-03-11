"use client";

import { GalleryCard, GeneratedImage } from "./gallery-card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GalleryGridProps {
  images: GeneratedImage[];
  onDownload?: (image: GeneratedImage) => void;
  onDelete?: (image: GeneratedImage) => void;
  onShare?: (image: GeneratedImage) => void;
  onToggleFavorite?: (image: GeneratedImage) => void;
  onImageClick?: (image: GeneratedImage) => void;
}

export function GalleryGrid({
  images,
  onDownload,
  onDelete,
  onShare,
  onToggleFavorite,
  onImageClick,
}: GalleryGridProps) {
  return (
    <ScrollArea className="flex-1">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
        {images.map((image) => (
          <GalleryCard
            key={image.id}
            image={image}
            onDownload={onDownload}
            onDelete={onDelete}
            onShare={onShare}
            onClick={onImageClick}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
