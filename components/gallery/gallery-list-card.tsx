"use client";

import { memo, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Box, Download, Layers3, MoreHorizontal, Pencil, Play, Share2, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { RENDER_MODES } from "@/lib/constants/render-modes";
import {
  GalleryProjectStack,
  GalleryProjectVariation,
  getGalleryProjectCollection,
  getGalleryProjectCollectionLabel,
  getGalleryProjectPrimaryDescriptor,
  getGalleryProjectPrimaryMediaType,
} from "./gallery-types";
import {
  GalleryImagePreview,
  GalleryModelPreview,
  GalleryVideoPreview,
} from "./gallery-media-preview";

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-ES", {
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
  onRenameProject?: (project: GalleryProjectStack) => void;
  onDeleteProject?: (project: GalleryProjectStack) => void;
  onClick?: (project: GalleryProjectStack) => void;
  priority?: boolean;
}

function StackPreviewAsset({
  asset,
  title,
  priority = false,
  fallbackImageUrl,
}: {
  asset: GalleryProjectVariation;
  title: string;
  priority?: boolean;
  fallbackImageUrl?: string | null;
}) {
  if (asset.mediaType === "video") {
    return (
      <div className="relative h-full w-full bg-neutral-950">
        <GalleryVideoPreview
          src={asset.url}
          alt={title}
          posterSrc={fallbackImageUrl}
          sizes="(max-width: 640px) 96px, 144px"
          priority={priority}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
            <Play className="h-4 w-4 fill-white" />
          </div>
        </div>
      </div>
    );
  }

  if (asset.mediaType === "model_3d") {
    return (
      <div className="relative h-full w-full bg-neutral-950">
        <GalleryModelPreview
          alt={title}
          posterSrc={fallbackImageUrl}
          sizes="(max-width: 640px) 96px, 144px"
          priority={priority}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
            <Box className="h-4 w-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <GalleryImagePreview
      src={asset.url}
      alt={title}
      sizes="(max-width: 640px) 96px, 144px"
      priority={priority}
    />
  );
}

export const GalleryListCard = memo(function GalleryListCard({
  project,
  onDownload,
  onDelete,
  onShare,
  onRenameProject,
  onDeleteProject,
  onClick,
  priority = false,
}: GalleryListCardProps) {
  const latestVariation = project.variations[0] ?? null;
  const previewImages = project.variations.slice(0, 3);
  const primaryMediaType = getGalleryProjectPrimaryMediaType(project);
  const collection = getGalleryProjectCollection(project);
  const descriptor = getGalleryProjectPrimaryDescriptor(project);

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
                  <StackPreviewAsset
                    asset={image}
                    title={project.title}
                    priority={priority && index === previewImages.length - 1}
                    fallbackImageUrl={
                      index === previewImages.length - 1 ? project.original?.url : null
                    }
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
              {project.variationCount} {project.variationCount === 1 ? "variacion" : "variaciones"}
              {project.original ? " + original" : ""}
            </p>
          </div>

          {latestVariation?.prompt && (
            <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
              {latestVariation.prompt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900/80 px-2 py-1 text-[10px] text-neutral-300">
              {primaryMediaType === "video" && <Play className="h-3 w-3 fill-current" />}
              {primaryMediaType === "model_3d" && <Box className="h-3 w-3" />}
              {descriptor}
            </span>
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
              Actualizado {formatDate(project.latestCreatedAt)}
            </span>
            <span className="text-[10px] text-neutral-600">
              {getGalleryProjectCollectionLabel(collection)}
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-neutral-500 hover:text-white hover:bg-neutral-800"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-neutral-900 border-neutral-800 text-neutral-200"
            >
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onRenameProject?.(project);
                }}
                className="focus:bg-neutral-800 focus:text-white"
              >
                <Pencil className="h-4 w-4" />
                Renombrar proyecto
              </DropdownMenuItem>
              {latestVariation && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(latestVariation);
                  }}
                  className="focus:bg-neutral-800 focus:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar ultima variacion
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteProject?.(project);
                }}
                className="text-red-400 focus:bg-neutral-800 focus:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar proyecto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
});
