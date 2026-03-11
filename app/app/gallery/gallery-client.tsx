"use client";

import { useState, useMemo, useRef, useCallback, useEffect, memo } from "react";
import {
  GalleryEmpty,
  GalleryFilters,
  ImagePreviewModal,
  SortOption,
  ViewMode,
} from "@/components/gallery";
import {
  GalleryListCard,
  GalleryListImage,
} from "@/components/gallery/gallery-list-card";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import {
  GalleryImage,
  deleteUserOutput,
  getUserOutputsPaginated,
} from "@/lib/actions/get-user-outputs";
import { Loader2 } from "lucide-react";
import { RENDER_MODES } from "@/lib/constants/render-modes";
import { cn } from "@/lib/utils";

const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkOAMAAPMASTyq3tQAAAAASUVORK5CYII=";

const GridCard = memo(function GridCard({
  image,
  onClick,
  priority = false,
}: {
  image: GalleryListImage;
  onClick: (image: GalleryListImage) => void;
  priority?: boolean;
}) {
  const mode = RENDER_MODES.find((m) => m.id === image.mode);
  const ModeIcon = mode?.icon;

  return (
    <Card
      className="group relative overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 active:border-neutral-600 cursor-pointer aspect-square"
      onClick={() => onClick(image)}
    >
      <Image
        src={image.url}
        alt="Generated render"
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        priority={priority}
        loading={priority ? undefined : "lazy"}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
        <div className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 right-1.5 sm:right-2 flex items-center justify-between">
          <span className="text-[10px] sm:text-xs text-neutral-300">
            {image.createdAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
          {mode && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/50 backdrop-blur-sm">
              {ModeIcon && <ModeIcon className="w-3 h-3 text-neutral-300" />}
              <span className="text-[10px] text-neutral-300">{mode.label}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
});

function SkeletonCard() {
  return (
    <div className="flex items-center gap-4 p-3 sm:p-4 rounded-xl border border-neutral-800/80 bg-neutral-900/30">
      <div className="w-20 h-20 sm:w-32 sm:h-32 bg-neutral-800 rounded-lg animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="w-24 h-3 bg-neutral-800 rounded animate-pulse" />
        <div className="w-48 h-3 bg-neutral-800/60 rounded animate-pulse" />
        <div className="w-16 h-2 bg-neutral-800/40 rounded animate-pulse" />
      </div>
    </div>
  );
}

function ModeFilterBar({
  activeMode,
  onModeChange,
  availableModes,
}: {
  activeMode: string | null;
  onModeChange: (mode: string | null) => void;
  availableModes: string[];
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-3 sm:px-6 py-3 border-b border-neutral-800/50">
      <button
        onClick={() => onModeChange(null)}
        className={cn(
          "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150",
          activeMode === null
            ? "bg-white text-black"
            : "bg-neutral-800/60 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
        )}
      >
        All
      </button>
      {availableModes.map((modeId) => {
        const mode = RENDER_MODES.find((m) => m.id === modeId);
        if (!mode) return null;
        const ModeIcon = mode.icon;
        return (
          <button
            key={modeId}
            onClick={() => onModeChange(modeId)}
            className={cn(
              "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150",
              activeMode === modeId
                ? "bg-white text-black"
                : "bg-neutral-800/60 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
            )}
          >
            <ModeIcon className="w-3 h-3" />
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}

interface ModeGroup {
  modeId: string;
  label: string;
  icon: typeof RENDER_MODES[number]["icon"];
  images: GalleryListImage[];
}

export function GalleryClient() {
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("album");
  const [images, setImages] = useState<GalleryListImage[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [previewImage, setPreviewImage] = useState<GalleryListImage | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const hasFetchedRef = useRef(false);
  const loadedCountRef = useRef(0);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    async function fetchInitial() {
      try {
        const result = await getUserOutputsPaginated(0, 24);
        if ("error" in result) {
          console.error("Failed to load images:", result.error);
          setIsLoading(false);
          return;
        }

        const converted: GalleryListImage[] = result.images.map((img) => ({
          id: img.id,
          url: img.url,
          createdAt: new Date(img.createdAt),
          projectId: img.projectId,
          mode: img.mode,
          prompt: img.prompt,
        }));

        setImages(converted);
        setHasMore(result.hasMore);
        setTotalCount(result.totalCount);
        loadedCountRef.current = converted.length;
      } catch (error) {
        console.error("Failed to load images:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInitial();
  }, []);

  const sortedImages = useMemo(() => {
    const result = [...images];
    result.sort((a, b) =>
      sortBy === "newest"
        ? b.createdAt.getTime() - a.createdAt.getTime()
        : a.createdAt.getTime() - b.createdAt.getTime()
    );
    return result;
  }, [images, sortBy]);

  const filteredImages = useMemo(() => {
    if (!activeFilter) return sortedImages;
    return sortedImages.filter((img) => img.mode === activeFilter);
  }, [sortedImages, activeFilter]);

  const availableModes = useMemo(() => {
    const modes = new Set(images.map((img) => img.mode).filter(Boolean) as string[]);
    return Array.from(modes);
  }, [images]);

  const modeGroups = useMemo((): ModeGroup[] => {
    const groups = new Map<string, GalleryListImage[]>();
    const uncategorized: GalleryListImage[] = [];

    for (const img of sortedImages) {
      if (activeFilter && img.mode !== activeFilter) continue;
      if (img.mode) {
        const existing = groups.get(img.mode) ?? [];
        existing.push(img);
        groups.set(img.mode, existing);
      } else {
        uncategorized.push(img);
      }
    }

    const result: ModeGroup[] = [];

    for (const [modeId, modeImages] of groups) {
      const mode = RENDER_MODES.find((m) => m.id === modeId);
      if (mode) {
        result.push({
          modeId,
          label: mode.label,
          icon: mode.icon,
          images: modeImages,
        });
      }
    }

    if (uncategorized.length > 0) {
      result.push({
        modeId: "_uncategorized",
        label: "Other",
        icon: RENDER_MODES[0].icon,
        images: uncategorized,
      });
    }

    return result;
  }, [sortedImages, activeFilter]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const result = await getUserOutputsPaginated(loadedCountRef.current, 24);
      if ("error" in result) {
        console.error("Failed to load more:", result.error);
        return;
      }

      const newImages: GalleryListImage[] = result.images.map((img) => ({
        id: img.id,
        url: img.url,
        createdAt: new Date(img.createdAt),
        projectId: img.projectId,
        mode: img.mode,
        prompt: img.prompt,
      }));

      setImages((prev) => [...prev, ...newImages]);
      setHasMore(result.hasMore);
      setTotalCount(result.totalCount);
      loadedCountRef.current += newImages.length;
    } catch (error) {
      console.error("Failed to load more images:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore]);

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoadingMore, isLoading]);

  const handleDownload = useCallback(async (image: GalleryListImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `brickex-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  }, []);

  const handleDelete = useCallback(
    async (image: GalleryListImage) => {
      const result = await deleteUserOutput(image.id);
      if ("success" in result) {
        setImages((prev) => prev.filter((img) => img.id !== image.id));
        setTotalCount((prev) => prev - 1);
        if (previewImage?.id === image.id) {
          setPreviewOpen(false);
        }
      } else {
        console.error("Delete failed:", result.error);
      }
    },
    [previewImage?.id]
  );

  const handleShare = useCallback((image: GalleryListImage) => {
    navigator.clipboard.writeText(image.url);
  }, []);

  const handleImageClick = useCallback((image: GalleryListImage) => {
    setPreviewImage(image);
    setPreviewOpen(true);
  }, []);

  const currentIndex = previewImage
    ? filteredImages.findIndex((img) => img.id === previewImage.id)
    : -1;

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setPreviewImage(filteredImages[currentIndex - 1]);
    }
  }, [currentIndex, filteredImages]);

  const handleNext = useCallback(() => {
    if (currentIndex < filteredImages.length - 1) {
      setPreviewImage(filteredImages[currentIndex + 1]);
    }
  }, [currentIndex, filteredImages]);

  const isEmpty = !isLoading && images.length === 0;

  return (
    <div className="h-full w-full bg-black text-white flex flex-col overflow-hidden">
      {isEmpty ? (
        <GalleryEmpty />
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Filters */}
          <GalleryFilters
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            totalCount={totalCount}
          />

          {/* Mode filter pills */}
          {availableModes.length > 1 && (
            <ModeFilterBar
              activeMode={activeFilter}
              onModeChange={setActiveFilter}
              availableModes={availableModes}
            />
          )}

          {/* Gallery Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
            {viewMode === "list" ? (
              <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24 md:pb-6">
                {isLoading ? (
                  <div className="space-y-3 sm:space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                ) : modeGroups.length === 0 ? (
                  <div className="text-center py-16 text-neutral-500 text-sm">
                    No renders match this filter.
                  </div>
                ) : (
                  <div className="space-y-8">
                    {modeGroups.map((group) => {
                      const ModeIcon = group.icon;
                      return (
                        <div key={group.modeId}>
                          <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-7 h-7 rounded-lg bg-neutral-800/60 flex items-center justify-center">
                              <ModeIcon className="w-3.5 h-3.5 text-neutral-400" />
                            </div>
                            <h3 className="text-sm font-medium text-neutral-300">
                              {group.label}
                            </h3>
                            <span className="text-[10px] text-neutral-600 ml-1">
                              {group.images.length}
                            </span>
                          </div>
                          <div className="space-y-3">
                            {group.images.map((image, index) => (
                              <GalleryListCard
                                key={image.id}
                                image={image}
                                onDownload={handleDownload}
                                onDelete={handleDelete}
                                onShare={handleShare}
                                onClick={handleImageClick}
                                priority={index < 2}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="px-3 sm:px-6 py-4 sm:py-6 pb-24 md:pb-6">
                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div
                        key={i}
                        className="aspect-square bg-neutral-800 rounded-lg animate-pulse"
                      />
                    ))}
                  </div>
                ) : modeGroups.length === 0 ? (
                  <div className="text-center py-16 text-neutral-500 text-sm">
                    No renders match this filter.
                  </div>
                ) : (
                  <div className="space-y-8">
                    {modeGroups.map((group) => {
                      const ModeIcon = group.icon;
                      return (
                        <div key={group.modeId}>
                          <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-7 h-7 rounded-lg bg-neutral-800/60 flex items-center justify-center">
                              <ModeIcon className="w-3.5 h-3.5 text-neutral-400" />
                            </div>
                            <h3 className="text-sm font-medium text-neutral-300">
                              {group.label}
                            </h3>
                            <span className="text-[10px] text-neutral-600 ml-1">
                              {group.images.length}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                            {group.images.map((image, index) => (
                              <GridCard
                                key={image.id}
                                image={image}
                                onClick={handleImageClick}
                                priority={index < 4}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Load more trigger */}
            {!isLoading && (
              <div ref={loadMoreRef} className="flex justify-center py-8">
                {isLoadingMore && (
                  <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      <ImagePreviewModal
        image={
          previewImage
            ? {
                id: previewImage.id,
                url: previewImage.url,
                createdAt: previewImage.createdAt,
                projectId: previewImage.projectId,
              }
            : null
        }
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onDownload={() => previewImage && handleDownload(previewImage)}
        onShare={() => previewImage && handleShare(previewImage)}
        onPrevious={handlePrevious}
        onNext={handleNext}
        hasPrevious={currentIndex > 0}
        hasNext={currentIndex < filteredImages.length - 1}
      />
    </div>
  );
}
