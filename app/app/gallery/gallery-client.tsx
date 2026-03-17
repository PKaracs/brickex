"use client";

import { memo, type ComponentType, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Box,
  Building2,
  Layers3,
  Loader2,
  MoreHorizontal,
  Pencil,
  Play,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  GalleryEmpty,
  GalleryFilters,
  ImagePreviewModal,
  SortOption,
  ViewMode,
} from "@/components/gallery";
import { GalleryListCard } from "@/components/gallery/gallery-list-card";
import {
  GalleryProjectCollection,
  GalleryProjectStack,
  GalleryProjectVariation,
  getGalleryProjectCollection,
  getGalleryProjectCollectionLabel,
  getGalleryProjectItems,
  getGalleryProjectPrimaryDescriptor,
} from "@/components/gallery/gallery-types";
import {
  GalleryImagePreview,
  GalleryModelPreview,
  GalleryVideoPreview,
} from "@/components/gallery/gallery-media-preview";
import { getToolById } from "@/lib/constants/tools";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteProject } from "@/lib/actions/delete-project";
import {
  deleteUserOutput,
  getUserProjectStacksPaginated,
} from "@/lib/actions/get-user-outputs";
import { updateProject } from "@/lib/actions/update-project";
import { RENDER_MODES } from "@/lib/constants/render-modes";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type GalleryCollectionFilter = "all" | "exterior" | "interior" | "video" | "tool";

const GALLERY_SECTION_ORDER: GalleryProjectCollection[] = [
  "video",
  "interior",
  "exterior",
  "tool",
];

const GALLERY_SECTION_META: Record<
  GalleryProjectCollection,
  {
    eyebrow: string;
    title: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
  }
> = {
  video: {
    eyebrow: "Motion Library",
    title: "Video Generations",
    description:
      "Walkthroughs, transitions, and cinematic motion studies grouped in one place.",
    icon: Play,
  },
  interior: {
    eyebrow: "Interior Collection",
    title: "Interior Renders",
    description:
      "Rooms, moods, and styling directions with a cleaner editorial presentation.",
    icon: Layers3,
  },
  exterior: {
    eyebrow: "Exterior Collection",
    title: "Exterior Renders",
    description:
      "Facade concepts, curb appeal, and polished hero shots separated from the rest.",
    icon: Building2,
  },
  tool: {
    eyebrow: "Tool Outputs",
    title: "Tool Generations",
    description:
      "Edits, utility generations, and everything that does not belong in the render stacks.",
    icon: Sparkles,
  },
};

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
  mediaType?: string;
  toolId?: string;
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

function GridCoverAsset({
  asset,
  title,
  priority = false,
  fallbackImageUrl,
}: {
  asset: GalleryProjectVariation | null;
  title: string;
  priority?: boolean;
  fallbackImageUrl?: string | null;
}) {
  if (!asset) {
    return <div className="absolute inset-0 bg-neutral-900" />;
  }

  if (asset.mediaType === "video") {
    return (
      <>
        <GalleryVideoPreview
          src={asset.url}
          alt={title}
          posterSrc={fallbackImageUrl}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
          videoClassName="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur-sm">
            <Play className="h-5 w-5 fill-white" />
          </div>
        </div>
      </>
    );
  }

  if (asset.mediaType === "model_3d") {
    return (
      <>
        <GalleryModelPreview
          alt={title}
          posterSrc={fallbackImageUrl}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur-sm">
            <Box className="h-5 w-5" />
          </div>
        </div>
      </>
    );
  }

  return (
    <GalleryImagePreview
      src={asset.url}
      alt={title}
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      priority={priority}
      imageClassName="transition-transform duration-500 group-hover:scale-[1.03]"
    />
  );
}

function GridPreviewBubble({
  asset,
  title,
}: {
  asset: GalleryProjectVariation;
  title: string;
}) {
  if (asset.mediaType === "video") {
    return (
      <div className="relative h-9 w-9 overflow-hidden rounded-full border border-neutral-900 bg-neutral-900 shadow-[0_6px_18px_rgba(0,0,0,0.35)]">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-700 to-neutral-950" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Play className="h-3.5 w-3.5 fill-white text-white" />
        </div>
      </div>
    );
  }

  if (asset.mediaType === "model_3d") {
    return (
      <div className="relative h-9 w-9 overflow-hidden rounded-full border border-neutral-900 bg-neutral-950 shadow-[0_6px_18px_rgba(0,0,0,0.35)]">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-700 to-neutral-950" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Box className="h-3.5 w-3.5 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-9 w-9 overflow-hidden rounded-full border border-neutral-900 bg-neutral-800 shadow-[0_6px_18px_rgba(0,0,0,0.35)]">
      <Image
        src={asset.url}
        alt={title}
        fill
        unoptimized
        sizes="36px"
        loading="lazy"
        className="object-cover"
      />
    </div>
  );
}

function CollectionFilterBar({
  activeCollection,
  onCollectionChange,
  counts,
}: {
  activeCollection: GalleryCollectionFilter;
  onCollectionChange: (collection: GalleryCollectionFilter) => void;
  counts: Record<GalleryCollectionFilter, number>;
}) {
  const options: Array<{
    value: GalleryCollectionFilter;
    label: string;
    count: number;
  }> = [
    { value: "all", label: "All", count: counts.all },
    { value: "exterior", label: "Exterior", count: counts.exterior },
    { value: "interior", label: "Interior", count: counts.interior },
    { value: "video", label: "Videos", count: counts.video },
    { value: "tool", label: "Tools", count: counts.tool },
  ].filter(
    (option): option is {
      value: GalleryCollectionFilter;
      label: string;
      count: number;
    } => option.value === "all" || option.count > 0,
  );

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none border-b border-neutral-800/50 px-3 py-3 sm:px-6">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onCollectionChange(option.value)}
          className={cn(
            "flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150",
            activeCollection === option.value
              ? "bg-white text-black"
              : "bg-neutral-800/60 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200",
          )}
        >
          {option.label}
          <span className={cn("ml-1.5 text-[11px]", activeCollection === option.value ? "text-black/65" : "text-neutral-500")}>
            {option.count}
          </span>
        </button>
      ))}
    </div>
  );
}

function CollectionSectionHeader({
  collection,
  onFocus,
}: {
  collection: GalleryProjectCollection;
  onFocus: (collection: GalleryCollectionFilter) => void;
}) {
  const meta = GALLERY_SECTION_META[collection];
  const SectionIcon = meta.icon;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-500">
          <SectionIcon className="h-3.5 w-3.5" />
          {meta.eyebrow}
        </div>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-[2.3rem]">
          {meta.title}
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-400 sm:text-[15px]">
          {meta.description}
        </p>
      </div>

      <button
        onClick={() => onFocus(collection)}
        className="self-start rounded-full border border-neutral-800 bg-neutral-950 px-4 py-2 text-xs font-medium text-neutral-200 transition-colors hover:bg-neutral-900 hover:text-white"
      >
        Show Only
      </button>
    </div>
  );
}

function CollectionSection({
  collection,
  children,
  onFocus,
}: {
  collection: GalleryProjectCollection;
  children: ReactNode;
  onFocus: (collection: GalleryCollectionFilter) => void;
}) {
  return (
    <section className="space-y-5">
      <CollectionSectionHeader
        collection={collection}
        onFocus={onFocus}
      />
      <div>{children}</div>
      <div className="h-px bg-neutral-900" />
    </section>
  );
}

const GridStackCard = memo(function GridStackCard({
  project,
  onClick,
  onRenameProject,
  onDeleteProject,
  priority = false,
}: {
  project: GalleryProjectStack;
  onClick: (project: GalleryProjectStack) => void;
  onRenameProject: (project: GalleryProjectStack) => void;
  onDeleteProject: (project: GalleryProjectStack) => void;
  priority?: boolean;
}) {
  const latestVariation = project.variations[0] ?? null;
  const coverAsset = latestVariation ?? null;
  const stackedImages = project.variations.slice(1, 3);
  const previewImages = project.variations.slice(0, 3);
  const collection = getGalleryProjectCollection(project);
  const descriptor = getGalleryProjectPrimaryDescriptor(project);
  const isModel = latestVariation?.mediaType === "model_3d";

  return (
    <Card
      className="group relative cursor-pointer overflow-hidden rounded-[28px] border border-neutral-800/80 bg-neutral-950/70 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-neutral-700 hover:bg-neutral-900/80"
      onClick={() => onClick(project)}
    >
      <div className="relative aspect-[0.92]">
        {stackedImages
          .slice()
          .reverse()
          .map((image, index) => (
            <div
              key={image.id}
              className="absolute inset-0 rounded-[24px] border border-neutral-800/80 bg-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.32)]"
              style={{
                transform: `translate(${10 + index * 7}px, ${8 + index * 7}px) scale(${0.975 - index * 0.035})`,
                opacity: 0.42 - index * 0.1,
              }}
            />
          ))}

        <div className="absolute inset-0 overflow-hidden rounded-[24px] border border-neutral-800/80 bg-neutral-950 shadow-[0_30px_90px_rgba(0,0,0,0.5)]">
          <GridCoverAsset
            asset={coverAsset}
            title={project.title}
            priority={priority}
            fallbackImageUrl={project.original?.url}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_38%),linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.1)_52%,rgba(0,0,0,0.26)_100%)]" />
        </div>

        <div className="absolute left-3 top-3 z-20 inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/55 px-2.5 py-1 text-[10px] text-white backdrop-blur-sm">
          <Layers3 className="h-3 w-3" />
          {project.variationCount}
        </div>

        <div className="absolute left-3 bottom-3 z-20 inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/55 px-2.5 py-1 text-[10px] text-white backdrop-blur-sm">
          {collection === "video" && <Play className="h-3 w-3 fill-current" />}
          {isModel && <Box className="h-3 w-3" />}
          {descriptor}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3 z-20 h-9 w-9 rounded-full border border-white/10 bg-black/55 text-neutral-200 opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/75 group-hover:opacity-100"
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
                onRenameProject(project);
              }}
              className="focus:bg-neutral-800 focus:text-white"
            >
              <Pencil className="h-4 w-4" />
              Rename Project
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDeleteProject(project);
              }}
              className="text-red-400 focus:bg-neutral-800 focus:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="px-2 pb-2 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-medium text-white">
              {project.title}
            </p>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-neutral-400">
              <span>
                {project.variationCount} {project.variationCount === 1 ? "variation" : "variations"}
              </span>
              <span className="text-neutral-600">•</span>
              <span>{formatProjectDate(project.latestCreatedAt)}</span>
            </div>
          </div>
          <div className="inline-flex flex-shrink-0 items-center gap-1 text-[11px] text-neutral-300">
            <Sparkles className="h-3.5 w-3.5 text-neutral-500" />
            Open stack
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex -space-x-2">
            {previewImages
              .slice(0, 3)
              .reverse()
              .map((image) => (
                <GridPreviewBubble
                  key={image.id}
                  asset={image}
                  title={project.title}
                />
              ))}
          </div>
          <div className="rounded-full border border-neutral-800 bg-neutral-900/80 px-2.5 py-1 text-[10px] text-neutral-300">
            {getGalleryProjectCollectionLabel(collection)}
          </div>
        </div>
      </div>
    </Card>
  );
});

function ProjectDeleteDialog({
  project,
  onOpenChange,
  onConfirm,
  isDeleting,
}: {
  project: GalleryProjectStack | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  return (
    <Dialog open={!!project} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-neutral-800 bg-neutral-950 text-white">
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription className="text-neutral-400">
            This will remove the entire stack from gallery, including all saved variations in this project.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-2xl border border-red-950/70 bg-red-950/20 p-4">
          <p className="text-sm font-medium text-white">{project?.title}</p>
          <p className="mt-1 text-sm text-neutral-400">
            {project?.variationCount ?? 0} saved {project?.variationCount === 1 ? "variation" : "variations"}
            {project?.original ? " + original source" : ""}
          </p>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-neutral-700 text-neutral-200 hover:bg-neutral-800"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            isLoading={isDeleting}
          >
            Delete Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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

function FacetFilterBar({
  activeFacet,
  onFacetChange,
  facets,
}: {
  activeFacet: string | null;
  onFacetChange: (facet: string | null) => void;
  facets: Array<{ id: string; label: string; icon?: ComponentType<{ className?: string }> }>;
}) {
  if (facets.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-3 sm:px-6 py-3 border-b border-neutral-800/50">
      <button
        onClick={() => onFacetChange(null)}
        className={cn(
          "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150",
          activeFacet === null
            ? "bg-white text-black"
            : "bg-neutral-800/60 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200",
        )}
      >
        All
      </button>
      {facets.map((facet) => {
        const FacetIcon = facet.icon;
        return (
          <button
            key={facet.id}
            onClick={() => onFacetChange(facet.id)}
            className={cn(
              "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150",
              activeFacet === facet.id
                ? "bg-white text-black"
                : "bg-neutral-800/60 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200",
            )}
          >
            {FacetIcon && <FacetIcon className="w-3 h-3" />}
            {facet.label}
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
  const [activeCollection, setActiveCollection] = useState<GalleryCollectionFilter>("all");
  const [activeFacet, setActiveFacet] = useState<string | null>(null);
  const [projectToRename, setProjectToRename] = useState<GalleryProjectStack | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isRenamingProject, setIsRenamingProject] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<GalleryProjectStack | null>(null);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

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

  const collectionCounts = useMemo(() => {
    return projects.reduce(
      (counts, project) => {
        const collection = getGalleryProjectCollection(project);
        counts.all += 1;
        counts[collection] += 1;
        return counts;
      },
      {
        all: 0,
        exterior: 0,
        interior: 0,
        video: 0,
        tool: 0,
      },
    );
  }, [projects]);

  const collectionFilteredProjects = useMemo(() => {
    if (activeCollection === "all") return sortedProjects;
    return sortedProjects.filter(
      (project) => getGalleryProjectCollection(project) === activeCollection,
    );
  }, [activeCollection, sortedProjects]);

  const availableFacets = useMemo(() => {
    if (activeCollection === "all") {
      return [];
    }

    const facets = new Map<string, { id: string; label: string; icon?: ComponentType<{ className?: string }> }>();

    if (activeCollection === "tool") {
      for (const project of collectionFilteredProjects) {
        const toolId = project.variations[0]?.toolId;
        if (!toolId) continue;
        const tool = getToolById(toolId);
        facets.set(toolId, {
          id: toolId,
          label: tool?.label ?? getGalleryProjectPrimaryDescriptor(project),
          icon: tool?.icon,
        });
      }
      return Array.from(facets.values());
    }

    for (const modeId of new Set(collectionFilteredProjects.flatMap((project) => project.modeIds).filter(Boolean))) {
      const mode = RENDER_MODES.find((item) => item.id === modeId);
      if (!mode) continue;
      facets.set(modeId, {
        id: modeId,
        label: mode.label,
        icon: mode.icon,
      });
    }

    return Array.from(facets.values());
  }, [activeCollection, collectionFilteredProjects]);

  const filteredProjects = useMemo(() => {
    if (!activeFacet) return collectionFilteredProjects;

    if (activeCollection === "tool") {
      return collectionFilteredProjects.filter(
        (project) => project.variations[0]?.toolId === activeFacet,
      );
    }

    return collectionFilteredProjects.filter((project) =>
      project.modeIds.includes(activeFacet),
    );
  }, [activeCollection, activeFacet, collectionFilteredProjects]);

  const groupedProjects = useMemo(
    () =>
      GALLERY_SECTION_ORDER.map((collection) => {
        const projects = sortedProjects.filter(
          (project) => getGalleryProjectCollection(project) === collection,
        );

        return {
          collection,
          projects,
        };
      }).filter((group) => group.projects.length > 0),
    [sortedProjects],
  );

  useEffect(() => {
    if (activeFacet && !availableFacets.some((facet) => facet.id === activeFacet)) {
      setActiveFacet(null);
    }
  }, [activeFacet, availableFacets]);

  const visibleProjectCount =
    activeCollection === "all" && activeFacet === null
      ? totalProjectCount
      : filteredProjects.length;

  const visibleRenderCount =
    activeCollection === "all" && activeFacet === null
      ? totalRenderCount
      : filteredProjects.reduce((sum, project) => sum + project.variationCount, 0);

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

  const handleDownload = useCallback(async (image: { id: string; url: string; mediaType?: string }) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const extension = blob.type.startsWith("video/")
        ? "mp4"
        : blob.type === "model/gltf-binary"
          ? "glb"
        : blob.type === "image/jpeg"
          ? "jpg"
          : blob.type === "image/webp"
            ? "webp"
            : blob.type === "image/png"
              ? "png"
              : image.mediaType === "video"
                ? "mp4"
                : image.mediaType === "model_3d"
                  ? "glb"
                : "png";
      a.download = `brickex-${image.id}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  }, []);

  const handleShare = useCallback(async (image: { id: string; url: string }) => {
    const shareUrl = `${window.location.origin}/share/${image.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "BrickEx render",
          url: shareUrl,
        });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
      }
    }

    await navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied.");
  }, []);

  const openProject = useCallback((project: GalleryProjectStack, itemId?: string | null) => {
    setPreviewProject(project);
    setPreviewItemId(itemId ?? getPrimaryItemId(project));
    setPreviewOpen(true);
  }, []);

  const handleRenameRequest = useCallback((project: GalleryProjectStack) => {
    setProjectToRename(project);
    setRenameValue(project.title);
    setPreviewProject(project);
    setPreviewItemId(getPrimaryItemId(project));
    setPreviewOpen(true);
  }, []);

  const handleRenameCancel = useCallback(() => {
    setProjectToRename(null);
    setRenameValue("");
  }, []);

  const handleDeleteRequest = useCallback((project: GalleryProjectStack) => {
    setProjectToDelete(project);
  }, []);

  const handleRenameProject = useCallback(async () => {
    if (!projectToRename) return;

    const nextTitle = renameValue.trim();
    if (!nextTitle) {
      toast.error("Project name can't be empty.");
      return;
    }

    setIsRenamingProject(true);

    try {
      const result = await updateProject(projectToRename.projectId, {
        title: nextTitle,
      });

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      setProjects((prev) =>
        prev.map((project) =>
          project.projectId === projectToRename.projectId
            ? { ...project, title: nextTitle }
            : project,
        ),
      );
      setPreviewProject((prev) =>
        prev?.projectId === projectToRename.projectId
          ? { ...prev, title: nextTitle }
          : prev,
      );
      setProjectToRename(null);
      setRenameValue("");
      toast.success("Project renamed.");
    } catch (error) {
      console.error("Failed to rename project:", error);
      toast.error("Failed to rename project.");
    } finally {
      setIsRenamingProject(false);
    }
  }, [projectToRename, renameValue]);

  const handleDeleteProject = useCallback(async () => {
    if (!projectToDelete) return;

    setIsDeletingProject(true);

    try {
      const result = await deleteProject(projectToDelete.projectId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      setProjects((prev) =>
        prev.filter((project) => project.projectId !== projectToDelete.projectId),
      );
      setTotalProjectCount((prev) => Math.max(0, prev - 1));
      setTotalRenderCount((prev) =>
        Math.max(0, prev - projectToDelete.variationCount),
      );
      loadedCountRef.current = Math.max(0, loadedCountRef.current - 1);

      if (previewProject?.projectId === projectToDelete.projectId) {
        setPreviewOpen(false);
        setPreviewProject(null);
        setPreviewItemId(null);
      }

      if (projectToRename?.projectId === projectToDelete.projectId) {
        setProjectToRename(null);
        setRenameValue("");
      }

      setProjectToDelete(null);
      toast.success("Project deleted.");
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast.error("Failed to delete project.");
    } finally {
      setIsDeletingProject(false);
    }
  }, [previewProject?.projectId, projectToDelete, projectToRename?.projectId]);

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
        loadedCountRef.current = Math.max(0, loadedCountRef.current - 1);
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

  const renderProjectCollection = (
    collectionProjects: GalleryProjectStack[],
    collection: GalleryProjectCollection,
  ) => {
    if (viewMode === "list") {
      return (
        <div className="space-y-3">
          {collectionProjects.map((project, index) => (
            <GalleryListCard
              key={project.projectId}
              project={project}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onShare={handleShare}
              onRenameProject={handleRenameRequest}
              onDeleteProject={handleDeleteRequest}
              onClick={openProject}
              priority={index < 2 && collection !== "tool"}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {collectionProjects.map((project, index) => (
          <GridStackCard
            key={project.projectId}
            project={project}
            onClick={openProject}
            onRenameProject={handleRenameRequest}
            onDeleteProject={handleDeleteRequest}
            priority={index < 4 && collection !== "tool"}
          />
        ))}
      </div>
    );
  };

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
            totalCount={visibleProjectCount}
            totalRenderCount={visibleRenderCount}
          />

          {collectionCounts.all > 0 && (
            <CollectionFilterBar
              activeCollection={activeCollection}
              onCollectionChange={setActiveCollection}
              counts={collectionCounts}
            />
          )}

          {activeCollection !== "all" && availableFacets.length > 0 && (
            <FacetFilterBar
              activeFacet={activeFacet}
              onFacetChange={setActiveFacet}
              facets={availableFacets}
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
                ) : activeCollection === "all" ? (
                  <div className="space-y-10 sm:space-y-12">
                    {groupedProjects.map((group) => (
                      <CollectionSection
                        key={group.collection}
                        collection={group.collection}
                        onFocus={setActiveCollection}
                      >
                        {renderProjectCollection(group.projects, group.collection)}
                      </CollectionSection>
                    ))}
                  </div>
                ) : (
                  renderProjectCollection(
                    filteredProjects,
                    activeCollection as GalleryProjectCollection,
                  )
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
                ) : activeCollection === "all" ? (
                  <div className="space-y-10 sm:space-y-12">
                    {groupedProjects.map((group) => (
                      <CollectionSection
                        key={group.collection}
                        collection={group.collection}
                        onFocus={setActiveCollection}
                      >
                        {renderProjectCollection(group.projects, group.collection)}
                      </CollectionSection>
                    ))}
                  </div>
                ) : (
                  renderProjectCollection(
                    filteredProjects,
                    activeCollection as GalleryProjectCollection,
                  )
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
        onOpenChange={(open) => {
          setPreviewOpen(open);
          if (!open) {
            handleRenameCancel();
          }
        }}
        onSelectedItemChange={setPreviewItemId}
        onDownload={handleDownload}
        onShare={handleShare}
        onDelete={(item) => {
          if (item.kind === "variation") {
            handleDelete(item);
          }
        }}
        onDeleteProject={handleDeleteRequest}
        isRenamingProject={projectToRename?.projectId === previewProject?.projectId}
        projectRenameValue={renameValue}
        onProjectRenameValueChange={setRenameValue}
        onProjectRenameStart={handleRenameRequest}
        onProjectRenameCancel={handleRenameCancel}
        onProjectRenameSubmit={handleRenameProject}
        isSavingProjectName={isRenamingProject}
      />

      <ProjectDeleteDialog
        project={projectToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setProjectToDelete(null);
          }
        }}
        onConfirm={handleDeleteProject}
        isDeleting={isDeletingProject}
      />
    </div>
  );
}
