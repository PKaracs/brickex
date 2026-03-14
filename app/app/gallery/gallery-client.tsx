"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Layers3, Loader2 } from "lucide-react";

import {
  GalleryEmpty,
  GalleryFilters,
  ImagePreviewModal,
  SortOption,
  ViewMode,
} from "@/components/gallery";
import { GalleryListCard } from "@/components/gallery/gallery-list-card";
import {
  GalleryProjectStack,
  GalleryProjectVariation,
  getGalleryProjectItems,
} from "@/components/gallery/gallery-types";
import { Card } from "@/components/ui/card";
import {
  deleteUserOutput,
  getUserProjectStacksPaginated,
} from "@/lib/actions/get-user-outputs";
import { RENDER_MODES } from "@/lib/constants/render-modes";
import { cn } from "@/lib/utils";

const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkOAMAAPMASTyq3tQAAAAASUVORK5CYII=";

interface RawGalleryProjectOriginal {
  id: string;
  url: string;
  createdAt: string;
  filename?: string;
}

interface RawGalleryProjectVariation {
  id: string;
  url: string;
  createdAt: string;
  projectId: string;
  mode?: string;
  prompt?: string;
  title?: string;
}

interface RawGalleryProjectStack {
  projectId: string;
  title: string;
  slug: string;
  latestCreatedAt: string;
  variationCount: number;
  modeIds: string[];
  original: RawGalleryProjectOriginal | null;
  variations: RawGalleryProjectVariation[];
}

function toClientProject(project: RawGalleryProjectStack): GalleryProjectStack {
  return {
    ...project,
    latestCreatedAt: new Date(project.latestCreatedAt),
    original: project.original
      ? {
          ...project.original,
          createdAt: new Date(project.original.createdAt),
        }
      : null,
    variations: project.variations.map((variation) => ({
      ...variation,
      createdAt: new Date(variation.createdAt),
    })),
  };
}

function formatProjectDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getPrimaryItemId(project: GalleryProjectStack) {
  return project.variations[0]?.id ?? project.original?.id ?? null;
}

function rebuildProjectAfterDeletion(
  project: GalleryProjectStack,
  variationId: string,
): GalleryProjectStack | null {
  const nextVariations = project.variations.filter(
    (variation) => variation.id !== variationId,
  );

  if (nextVariations.length === 0) {
    return null;
  }

  return {
    ...project,
    variations: nextVariations,
    variationCount: nextVariations.length,
    latestCreatedAt: nextVariations[0]?.createdAt ?? project.latestCreatedAt,
    modeIds: Array.from(
      new Set(nextVariations.map((variation) => variation.mode).filter(Boolean)),
    ) as string[],
  };
}

const GridStackCard = memo(function GridStackCard({
  project,
  onClick,
  priority = false,
}: {
  project: GalleryProjectStack;
  onClick: (project: GalleryProjectStack) => void;
  priority?: boolean;
}) {
  const previewImages = project.variations.slice(0, 3);
  const primaryMode = project.modeIds[0]
    ? RENDER_MODES.find((mode) => mode.id === project.modeIds[0])
    : null;
  const PrimaryModeIcon = primaryMode?.icon;

  return (
    <Card
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50 p-3 hover:border-neutral-700"
      onClick={() => onClick(project)}
    >
      <div className="relative aspect-square">
        {previewImages
          .slice()
          .reverse()
          .map((image, index) => {
            const offset = index * 10;
            const zIndex = index + 1;
            return (
              <div
                key={image.id}
                className="absolute inset-0 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-[0_20px_80px_rgba(0,0,0,0.55)]"
                style={{
                  transform: `translate(${offset}px, ${offset}px) scale(${1 - index * 0.05})`,
                  zIndex,
                }}
              >
                <Image
                  src={image.url}
                  alt={project.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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

        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black via-black/70 to-transparent p-3 pt-10">
          <p className="truncate text-sm font-medium text-white">{project.title}</p>
          <div className="mt-1 flex items-center justify-between text-[10px] text-neutral-300">
            <span>
              {project.variationCount} {project.variationCount === 1 ? "variation" : "variations"}
            </span>
            <span>{formatProjectDate(project.latestCreatedAt)}</span>
          </div>
          {primaryMode && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[10px] text-neutral-200 backdrop-blur-sm">
              {PrimaryModeIcon && <PrimaryModeIcon className="h-3 w-3" />}
              {primaryMode.label}
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
      <div className="w-24 h-24 sm:w-36 sm:h-28 bg-neutral-800 rounded-xl animate-pulse" />
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
            : "bg-neutral-800/60 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200",
        )}
      >
        All
      </button>
      {availableModes.map((modeId) => {
        const mode = RENDER_MODES.find((item) => item.id === modeId);
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
                : "bg-neutral-800/60 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200",
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

export function GalleryClient() {
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("album");
  const [projects, setProjects] = useState<GalleryProjectStack[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalProjectCount, setTotalProjectCount] = useState(0);
  const [totalRenderCount, setTotalRenderCount] = useState(0);
  const [previewProject, setPreviewProject] = useState<GalleryProjectStack | null>(null);
  const [previewItemId, setPreviewItemId] = useState<string | null>(null);
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
        const result = await getUserProjectStacksPaginated(0, 12);
        if ("error" in result) {
          console.error("Failed to load project stacks:", result.error);
          setIsLoading(false);
          return;
        }

        const converted = result.projects.map((project) =>
          toClientProject(project as RawGalleryProjectStack),
        );

        setProjects(converted);
        setHasMore(result.hasMore);
        setTotalProjectCount(result.totalProjectCount);
        setTotalRenderCount(result.totalRenderCount);
        loadedCountRef.current = converted.length;
      } catch (error) {
        console.error("Failed to load project stacks:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInitial();
  }, []);

  const sortedProjects = useMemo(() => {
    const nextProjects = [...projects];
    nextProjects.sort((a, b) =>
      sortBy === "newest"
        ? b.latestCreatedAt.getTime() - a.latestCreatedAt.getTime()
        : a.latestCreatedAt.getTime() - b.latestCreatedAt.getTime(),
    );
    return nextProjects;
  }, [projects, sortBy]);

  const filteredProjects = useMemo(() => {
    if (!activeFilter) return sortedProjects;
    return sortedProjects.filter((project) =>
      project.variations.some((variation) => variation.mode === activeFilter),
    );
  }, [activeFilter, sortedProjects]);

  const availableModes = useMemo(() => {
    const modes = new Set(
      projects.flatMap((project) => project.modeIds).filter(Boolean),
    );
    return Array.from(modes);
  }, [projects]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const result = await getUserProjectStacksPaginated(loadedCountRef.current, 12);
      if ("error" in result) {
        console.error("Failed to load more project stacks:", result.error);
        return;
      }

      const nextProjects = result.projects.map((project) =>
        toClientProject(project as RawGalleryProjectStack),
      );

      setProjects((prev) => [...prev, ...nextProjects]);
      setHasMore(result.hasMore);
      setTotalProjectCount(result.totalProjectCount);
      setTotalRenderCount(result.totalRenderCount);
      loadedCountRef.current += nextProjects.length;
    } catch (error) {
      console.error("Failed to load more project stacks:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore]);

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          loadMore();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, loadMore]);

  useEffect(() => {
    if (!previewProject) return;

    const refreshedProject = projects.find(
      (project) => project.projectId === previewProject.projectId,
    );

    if (!refreshedProject) {
      setPreviewOpen(false);
      setPreviewProject(null);
      setPreviewItemId(null);
      return;
    }

    if (refreshedProject !== previewProject) {
      setPreviewProject(refreshedProject);
      const itemIds = new Set(getGalleryProjectItems(refreshedProject).map((item) => item.id));
      if (previewItemId && !itemIds.has(previewItemId)) {
        setPreviewItemId(getPrimaryItemId(refreshedProject));
      }
    }
  }, [previewItemId, previewProject, projects]);

  const handleDownload = useCallback(async (image: { id: string; url: string }) => {
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

  const handleShare = useCallback(async (image: { url: string }) => {
    await navigator.clipboard.writeText(image.url);
  }, []);

  const openProject = useCallback((project: GalleryProjectStack, itemId?: string | null) => {
    setPreviewProject(project);
    setPreviewItemId(itemId ?? getPrimaryItemId(project));
    setPreviewOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (image: GalleryProjectVariation) => {
      const result = await deleteUserOutput(image.id);
      if (!("success" in result)) {
        console.error("Delete failed:", result.error);
        return;
      }

      const affectedProject = projects.find((project) =>
        project.variations.some((variation) => variation.id === image.id),
      );

      if (!affectedProject) {
        return;
      }

      const nextProject = rebuildProjectAfterDeletion(affectedProject, image.id);
      setProjects((prev) =>
        prev.flatMap((project) => {
          if (project.projectId !== affectedProject.projectId) {
            return [project];
          }

          return nextProject ? [nextProject] : [];
        }),
      );
      setTotalRenderCount((prev) => Math.max(0, prev - 1));
      if (!nextProject) {
        setTotalProjectCount((prev) => Math.max(0, prev - 1));
      }

      if (previewProject?.projectId === affectedProject.projectId) {
        if (!nextProject) {
          setPreviewOpen(false);
          setPreviewProject(null);
          setPreviewItemId(null);
          return;
        }

        setPreviewProject(nextProject);
        if (previewItemId === image.id) {
          const remainingItems = getGalleryProjectItems(nextProject);
          const previousItems = getGalleryProjectItems(previewProject);
          const removedIndex = previousItems.findIndex((item) => item.id === image.id);
          const nextIndex = Math.min(
            removedIndex >= 0 ? removedIndex : 0,
            remainingItems.length - 1,
          );
          setPreviewItemId(remainingItems[nextIndex]?.id ?? getPrimaryItemId(nextProject));
        }
      }
    },
    [previewItemId, previewProject, projects],
  );

  const isEmpty = !isLoading && projects.length === 0;

  return (
    <div className="h-full w-full bg-black text-white flex flex-col overflow-hidden">
      {isEmpty ? (
        <GalleryEmpty />
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <GalleryFilters
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            totalCount={totalProjectCount}
            totalRenderCount={totalRenderCount}
          />

          {availableModes.length > 1 && (
            <ModeFilterBar
              activeMode={activeFilter}
              onModeChange={setActiveFilter}
              availableModes={availableModes}
            />
          )}

          <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
            {viewMode === "list" ? (
              <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24 md:pb-6">
                {isLoading ? (
                  <div className="space-y-3 sm:space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                ) : filteredProjects.length === 0 ? (
                  <div className="py-16 text-center text-sm text-neutral-500">
                    No project stacks match this filter.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredProjects.map((project, index) => (
                      <GalleryListCard
                        key={project.projectId}
                        project={project}
                        onDownload={handleDownload}
                        onDelete={handleDelete}
                        onShare={handleShare}
                        onClick={openProject}
                        priority={index < 2}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="px-3 sm:px-6 py-4 sm:py-6 pb-24 md:pb-6">
                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="aspect-square rounded-2xl bg-neutral-800 animate-pulse" />
                    ))}
                  </div>
                ) : filteredProjects.length === 0 ? (
                  <div className="py-16 text-center text-sm text-neutral-500">
                    No project stacks match this filter.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {filteredProjects.map((project, index) => (
                      <GridStackCard
                        key={project.projectId}
                        project={project}
                        onClick={openProject}
                        priority={index < 4}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

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

      <ImagePreviewModal
        project={previewProject}
        selectedItemId={previewItemId}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onSelectedItemChange={setPreviewItemId}
        onDownload={handleDownload}
        onShare={handleShare}
        onDelete={(item) => {
          if (item.kind === "variation") {
            handleDelete(item);
          }
        }}
      />
    </div>
  );
}
