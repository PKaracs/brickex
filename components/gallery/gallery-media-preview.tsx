"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Box } from "lucide-react";

import { cn } from "@/lib/utils";

function PreviewSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 bg-neutral-900 animate-pulse",
        className,
      )}
    />
  );
}

interface GalleryImagePreviewProps {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
}

export function GalleryImagePreview({
  src,
  alt,
  sizes,
  priority = false,
  className,
  imageClassName,
}: GalleryImagePreviewProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  useEffect(() => {
    setStatus("loading");
  }, [src]);

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-neutral-950", className)}>
      {status !== "loaded" && <PreviewSkeleton />}
      {status === "error" ? (
        <div className="absolute inset-0 bg-neutral-900" />
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={cn(
            "object-cover transition-opacity duration-200",
            status === "loaded" ? "opacity-100" : "opacity-0",
            imageClassName,
          )}
        />
      )}
    </div>
  );
}

interface GalleryVideoPreviewProps {
  src: string;
  alt: string;
  posterSrc?: string | null;
  sizes: string;
  priority?: boolean;
  className?: string;
  videoClassName?: string;
}

export function GalleryVideoPreview({
  src,
  alt,
  posterSrc,
  sizes,
  priority = false,
  className,
  videoClassName,
}: GalleryVideoPreviewProps) {
  const [shouldLoad, setShouldLoad] = useState(priority || !!posterSrc);
  const [loaded, setLoaded] = useState(!!posterSrc);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setShouldLoad(priority || !!posterSrc);
    setLoaded(!!posterSrc);
  }, [posterSrc, priority, src]);

  useEffect(() => {
    if (shouldLoad || posterSrc) {
      return;
    }

    const node = ref.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [posterSrc, shouldLoad]);

  if (posterSrc) {
    return (
      <GalleryImagePreview
        src={posterSrc}
        alt={alt}
        sizes={sizes}
        priority={priority}
        className={className}
        imageClassName={videoClassName}
      />
    );
  }

  return (
    <div
      ref={ref}
      className={cn("relative h-full w-full overflow-hidden bg-neutral-950", className)}
    >
      {!loaded && <PreviewSkeleton />}
      {shouldLoad && (
        <video
          key={src}
          src={src}
          muted
          playsInline
          preload="metadata"
          onLoadedData={(event) => {
            event.currentTarget.pause();
            setLoaded(true);
          }}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-200",
            loaded ? "opacity-100" : "opacity-0",
            videoClassName,
          )}
        />
      )}
    </div>
  );
}

interface GalleryModelPreviewProps {
  alt: string;
  posterSrc?: string | null;
  sizes: string;
  priority?: boolean;
  className?: string;
}

export function GalleryModelPreview({
  alt,
  posterSrc,
  sizes,
  priority = false,
  className,
}: GalleryModelPreviewProps) {
  if (posterSrc) {
    return (
      <GalleryImagePreview
        src={posterSrc}
        alt={alt}
        sizes={sizes}
        priority={priority}
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-950 to-black",
        className,
      )}
    >
      <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.35)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/80 backdrop-blur-sm">
          <Box className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
