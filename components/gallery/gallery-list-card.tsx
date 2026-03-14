"use client";

import { memo, useMemo } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Layers3, Share2, Trash2 } from "lucide-react";

import { RENDER_MODES } from "@/lib/constants/render-modes";
import { GalleryProjectStack, GalleryProjectVariation } from "./gallery-types";

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
  mediaType?: string;
}

interface GalleryListCardProps {
  project: GalleryProjectStack;
  onDownload?: (image: GalleryProjectVariation) => void;
  onDelete?: (image: GalleryProjectVariation) => void;
  onShare?: (image: GalleryProjectVariation) => void;
  onClick?: (project: GalleryProjectStack) => void;
  priority?: boolean;
}

export const GalleryListCard = memo(function GalleryListCard({
  project,
  onDownload,
  onDelete,
  onShare,
  onClick,
  priority = false,
}: GalleryListCardProps) {
  const latestVariation = project.variations[0] ?? null;
  const previewImages = project.variations.slice(0, 3);

  const modePills = useMemo(
    () =>
      project.modeIds
        .map((modeId) => RENDER_MODES.find((mode) => mode.id === modeId))
        .filter(Boolean)
        .slice(0, 3),
    [project.modeIds],
  );

  return (
    <Card
      className="group relative overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-900/30 hover:border-neutral-700 hover:bg-neutral-900/50 active:bg-neutral-900/60 transition-all duration-300 cursor-pointer"
      onClick={() => onClick?.(project)}
    >
      <div className="flex items-center gap-4 sm:gap-6 p-3 sm:p-4">
        <div className="relative w-24 h-24 sm:w-36 sm:h-28 flex-shrink-0">
          {previewImages
            .slice()
            .reverse()
            .map((image, index) => {
              const offset = index * 10;
              const zIndex = index + 1;
              return (
                <div
                  key={image.id}
                  className="absolute inset-0 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
                  style={{
                    transform: `translate(${offset}px, ${offset}px) scale(${1 - index * 0.04})`,
                    zIndex,
                  }}
                >
                  <Image
                    src={image.url}
                    alt={project.title}
                    fill
                    sizes="(max-width: 640px) 96px, 144px"
                    priority={priority && index === previewImages.length - 1}
                    loading={priority && index === previewImages.length - 1 ? undefined : "lazy"}
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    className="object-cover"
                  />
                </div>
              );
            })}
          <div className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[10px] text-white backdrop-blur-sm">
            <Layers3 className="h-3 w-3" />
            {project.variationCount}
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="space-y-1">
            <p className="text-sm font-medium text-white truncate">{project.title}</p>
            <p className="text-xs text-neutral-500">
              {project.variationCount} {project.variationCount === 1 ? "variation" : "variations"}
              {project.original ? " + original" : ""}
            </p>
          </div>

          {latestVariation?.prompt && (
            <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
              {latestVariation.prompt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {modePills.map((mode) => {
              const ModeIcon = mode!.icon;
              return (
                <span
                  key={mode!.id}
                  className="inline-flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900/80 px-2 py-1 text-[10px] text-neutral-300"
                >
                  <ModeIcon className="h-3 w-3" />
                  {mode!.label}
                </span>
              );
            })}
            <span className="text-[10px] text-neutral-600">
              Updated {formatDate(project.latestCreatedAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            disabled={!latestVariation}
            className="h-8 w-8 text-neutral-500 hover:text-white hover:bg-neutral-800 disabled:opacity-40"
            onClick={(e) => {
              e.stopPropagation();
              if (latestVariation) {
                onDownload?.(latestVariation);
              }
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={!latestVariation}
            className="h-8 w-8 text-neutral-500 hover:text-white hover:bg-neutral-800 disabled:opacity-40"
            onClick={(e) => {
              e.stopPropagation();
              if (latestVariation) {
                onShare?.(latestVariation);
              }
            }}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={!latestVariation}
            className="h-8 w-8 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 disabled:opacity-40"
            onClick={(e) => {
              e.stopPropagation();
              if (latestVariation) {
                onDelete?.(latestVariation);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
});
