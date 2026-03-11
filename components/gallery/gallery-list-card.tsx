"use client";

import { memo } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Share2 } from "lucide-react";
import { RENDER_MODES } from "@/lib/constants/render-modes";

const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkOAMAAPMASTyq3tQAAAAASUVORK5CYII=";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export interface GalleryListImage {
  id: string;
  url: string;
  createdAt: Date;
  projectId: string;
  mode?: string;
  prompt?: string;
}

interface GalleryListCardProps {
  image: GalleryListImage;
  onDownload?: (image: GalleryListImage) => void;
  onDelete?: (image: GalleryListImage) => void;
  onShare?: (image: GalleryListImage) => void;
  onClick?: (image: GalleryListImage) => void;
  priority?: boolean;
}

export const GalleryListCard = memo(function GalleryListCard({
  image,
  onDownload,
  onDelete,
  onShare,
  onClick,
  priority = false,
}: GalleryListCardProps) {
  const mode = RENDER_MODES.find((m) => m.id === image.mode);
  const ModeIcon = mode?.icon;

  return (
    <Card className="group relative overflow-hidden rounded-xl border border-neutral-800/80 bg-neutral-900/30 hover:border-neutral-700 hover:bg-neutral-900/50 active:bg-neutral-900/60 transition-all duration-300">
      <div className="flex items-center gap-4 sm:gap-6 p-3 sm:p-4">
        {/* Image */}
        <div
          className="relative w-20 h-20 sm:w-32 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer"
          onClick={() => onClick?.(image)}
        >
          <Image
            src={image.url}
            alt="Generated render"
            fill
            sizes="(max-width: 640px) 80px, 128px"
            priority={priority}
            loading={priority ? undefined : "lazy"}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            className="object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {mode && (
            <div className="flex items-center gap-2">
              {ModeIcon && (
                <ModeIcon className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
              )}
              <span className="text-xs font-medium text-neutral-300">
                {mode.label}
              </span>
            </div>
          )}
          {image.prompt && (
            <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
              {image.prompt}
            </p>
          )}
          <span className="text-[10px] text-neutral-600">
            {formatDate(image.createdAt)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-neutral-500 hover:text-white hover:bg-neutral-800"
            onClick={(e) => {
              e.stopPropagation();
              onDownload?.(image);
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-neutral-500 hover:text-white hover:bg-neutral-800"
            onClick={(e) => {
              e.stopPropagation();
              onShare?.(image);
            }}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-neutral-500 hover:text-red-400 hover:bg-neutral-800"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(image);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
});
