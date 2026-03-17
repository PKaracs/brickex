"use client";

import "@google/model-viewer";

import { createElement } from "react";
import { Box } from "lucide-react";

import { cn } from "@/lib/utils";

interface ModelViewerPreviewProps {
  src: string;
  alt: string;
  posterSrc?: string | null;
  className?: string;
}

export function ModelViewerPreview({
  src,
  alt,
  posterSrc,
  className,
}: ModelViewerPreviewProps) {
  const modelViewer = createElement("model-viewer", {
    src,
    alt,
    poster: posterSrc ?? undefined,
    "camera-controls": true,
    "auto-rotate": true,
    "auto-rotate-delay": "0",
    "shadow-intensity": "1",
    exposure: "1",
    "environment-image": "neutral",
    "interaction-prompt": "auto",
    "touch-action": "pan-y",
    style: { width: "100%", height: "100%", backgroundColor: "transparent" },
  });

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-neutral-950", className)}>
      {modelViewer}

      <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
        <Box className="h-3.5 w-3.5" />
        3D preview
      </div>
    </div>
  );
}
