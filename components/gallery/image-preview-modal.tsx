"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GeneratedImage } from "./gallery-card";
import { Download, Share2, X, ChevronLeft, ChevronRight } from "lucide-react";

// Dark gray placeholder (#262626) - proper base64 PNG
const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkOAMAAPMASTyq3tQAAAAASUVORK5CYII=";

interface ImagePreviewModalProps {
  image: GeneratedImage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload?: (image: GeneratedImage) => void;
  onShare?: (image: GeneratedImage) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export function ImagePreviewModal({
  image,
  open,
  onOpenChange,
  onDownload,
  onShare,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: ImagePreviewModalProps) {
  // Swipe gesture state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

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
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && hasNext) {
      onNext?.();
    } else if (isRightSwipe && hasPrevious) {
      onPrevious?.();
    }
  }, [touchStart, touchEnd, hasNext, hasPrevious, onNext, onPrevious]);

  if (!image) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showXIcon={false}
        className="max-w-5xl w-full md:h-[90vh] p-0 bg-black border-neutral-800 overflow-hidden max-h-[100dvh] md:max-h-[90vh]"
      >
        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col h-[100dvh] bg-black">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 h-11 w-11 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 z-20"
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Navigation Arrows */}
          {hasPrevious && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrevious}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 z-10"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}
          {hasNext && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 z-10"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}

          {/* Main Image - Full Screen with Swipe Support */}
          <div
            className="flex-1 relative flex items-center justify-center"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <Image
              src={image.url}
              alt="Generated image"
              fill
              sizes="100vw"
              priority
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              className="object-contain"
            />
          </div>

          {/* Mobile Actions Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-black via-black/80 to-transparent">
            <div className="flex gap-3">
              <Button
                onClick={() => onDownload?.(image)}
                className="flex-1 bg-white text-black hover:bg-neutral-200 font-medium h-12"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                onClick={() => onShare?.(image)}
                className="flex-1 border-neutral-700 text-white hover:bg-neutral-800 h-12"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex h-full">
          {/* Image Section */}
          <div className="flex-1 relative bg-neutral-950 flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="absolute top-4 left-4 h-10 w-10 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 z-10"
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Navigation Arrows */}
            {hasPrevious && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 z-10"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}
            {hasNext && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 z-10"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}

            {/* Main Image */}
            <div className="relative w-full h-full p-8">
              <Image
                src={image.url}
                alt="Generated image"
                fill
                priority
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="object-contain"
              />
            </div>
          </div>

          {/* Details Sidebar - Desktop Only */}
          <div className="w-80 border-l border-neutral-800 bg-neutral-900/50 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-neutral-800">
              <h3 className="text-sm font-medium text-white">Image Details</h3>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 space-y-6 overflow-y-auto">
              {/* Template */}
              {image.template && (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-neutral-400">
                    Template
                  </span>
                  <div className="inline-flex px-2.5 py-1 rounded-md bg-neutral-800 text-sm text-neutral-300">
                    {image.template}
                  </div>
                </div>
              )}

              {/* Objects Mini Cards */}
              {image.objects && image.objects.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-medium text-neutral-400">
                    Objects
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {image.objects.map((obj, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2 rounded-lg bg-neutral-800/60 border border-neutral-700/50"
                      >
                        <div className="relative h-8 w-8 rounded-md overflow-hidden bg-neutral-700 flex-shrink-0">
                          <Image
                            src={obj.image}
                            alt={obj.name}
                            fill
                            sizes="32px"
                            loading="lazy"
                            className="object-cover"
                          />
                        </div>
                        <span className="text-xs text-neutral-300 truncate">
                          {obj.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Created At */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-neutral-400">
                  Created
                </span>
                <p className="text-sm text-neutral-300">
                  {image.createdAt.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 border-t border-neutral-800 space-y-2">
              <Button
                onClick={() => onDownload?.(image)}
                className="w-full bg-white text-black hover:bg-neutral-200 font-medium h-10"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                onClick={() => onShare?.(image)}
                className="w-full border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white h-10"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
