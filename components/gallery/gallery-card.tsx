"use client";

import { memo } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, MoreVertical, Trash2, Share2 } from "lucide-react";

// Dark gray placeholder (#262626) - proper base64 PNG
const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkOAMAAPMASTyq3tQAAAAASUVORK5CYII=";

export interface GeneratedImage {
  id: string;
  url: string;
  createdAt: Date;
  template?: string;
  objects?: { name: string; image: string }[];
  projectId?: string;
}

interface GalleryCardProps {
  image: GeneratedImage;
  onDownload?: (image: GeneratedImage) => void;
  onDelete?: (image: GeneratedImage) => void;
  onShare?: (image: GeneratedImage) => void;
  onClick?: (image: GeneratedImage) => void;
}

export const GalleryCard = memo(function GalleryCard({
  image,
  onDownload,
  onDelete,
  onShare,
  onClick,
}: GalleryCardProps) {
  return (
    <Card
      className="group relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 cursor-pointer"
      onClick={() => onClick?.(image)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={image.url}
          alt="Imagen generada"
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 20vw, 16vw"
          loading="lazy"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          className="object-cover"
        />

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Actions Menu - Top Right */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/60"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4 text-white" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-neutral-900 border-neutral-800"
          >
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDownload?.(image);
              }}
              className="text-neutral-300 focus:text-white focus:bg-neutral-800 cursor-pointer"
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onShare?.(image);
              }}
              className="text-neutral-300 focus:text-white focus:bg-neutral-800 cursor-pointer"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartir
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(image);
              }}
              className="text-red-400 focus:text-red-300 focus:bg-neutral-800 cursor-pointer"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick Download Button - Bottom Right */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white"
          onClick={(e) => {
            e.stopPropagation();
            onDownload?.(image);
          }}
        >
          <Download className="h-4 w-4 text-black" />
        </Button>
      </div>

      {/* Card Footer - Metadata */}
      <div className="p-3 space-y-2">
        {/* Objects Mini Cards */}
        {image.objects && image.objects.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {image.objects.map((obj, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-neutral-800/80 border border-neutral-700/50 flex-shrink-0"
              >
                <div className="relative h-4 w-4 rounded overflow-hidden bg-neutral-700">
                  <Image
                    src={obj.image}
                    alt={obj.name}
                    fill
                    sizes="16px"
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    className="object-cover"
                  />
                </div>
                <span className="text-[10px] text-neutral-300 whitespace-nowrap">
                  {obj.name}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Date and Template */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-neutral-500">
            {formatDate(image.createdAt)}
          </span>
          {image.template && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
              {image.template}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
});

function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Ahora mismo";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays < 7) return `Hace ${diffDays} d`;

  return date.toLocaleDateString("es-ES", {
    month: "short",
    day: "numeric",
  });
}
