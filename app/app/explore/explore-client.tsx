"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  getExploreCategories,
  getExploreImages,
  getExploreCategoryImages,
  type ExploreCategory,
  type ExploreCategoryId,
  type ExploreImage,
} from "@/lib/actions/get-explore-images";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { X, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Constants ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

function getOptimizedUrl(url: string, width: number) {
  if (url.includes("/storage/v1/object/public/")) {
    return (
      url.replace(
        "/storage/v1/object/public/",
        "/storage/v1/render/image/public/"
      ) + `?width=${width}&resize=cover&quality=75`
    );
  }

  return url;
}

// ─── Category Card ───────────────────────────────────────────────────────────

const CategoryCard = memo(function CategoryCard({
  category,
  isActive,
  onClick,
}: {
  category: ExploreCategory;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex-shrink-0 w-32 sm:w-40 md:w-44 overflow-hidden rounded-2xl transition-all duration-200 active:scale-95",
        isActive
          ? "ring-2 ring-white ring-offset-2 ring-offset-black shadow-lg shadow-white/5"
          : "opacity-60 hover:opacity-90"
      )}
    >
      <div className="relative aspect-[3/4] w-full bg-neutral-800">
        <Image
          src={category.cover}
          alt={category.label}
          fill
          sizes="(max-width: 640px) 128px, 176px"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3 text-left">
          <span className="block text-sm sm:text-base font-bold text-white tracking-wide drop-shadow-lg">
            {category.label}
          </span>
          <span className="mt-1 block text-[11px] uppercase tracking-[0.16em] text-neutral-300">
            {category.count} images
          </span>
        </div>
      </div>
    </button>
  );
});

// ─── Masonry Grid Card ──────────────────────────────────────────────────────
// Uses a raw <img> for speed — images are served from Supabase CDN already
// optimised. next/image adds an extra proxy round-trip we don't need here.

const ExploreCard = memo(function ExploreCard({
  image,
  index,
  onClick,
}: {
  image: ExploreImage;
  index: number;
  onClick: (image: ExploreImage) => void;
}) {
  const aspectVariants = [
    "aspect-[3/4]",
    "aspect-[4/5]",
    "aspect-square",
    "aspect-[3/4]",
    "aspect-[2/3]",
    "aspect-[4/5]",
    "aspect-[3/4]",
    "aspect-square",
    "aspect-[4/5]",
    "aspect-[3/4]",
  ];
  const aspectClass = aspectVariants[index % aspectVariants.length];

  return (
    <button
      onClick={() => onClick(image)}
      className="group relative w-full overflow-hidden rounded-xl bg-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 break-inside-avoid mb-2 sm:mb-3"
    >
      <div
        className={cn(
          "relative w-full overflow-hidden bg-neutral-800",
          aspectClass
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getOptimizedUrl(image.url, 720)}
          alt={image.name}
          loading={index < 4 ? "eager" : "lazy"}
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 group-active:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3 text-left">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-300">
            {image.categoryLabel}
          </p>
          <p className="mt-1 line-clamp-2 text-sm font-medium text-white">
            {image.name}
          </p>
          <p className="mt-1 line-clamp-1 text-xs text-neutral-400">
            {image.packTitle}
          </p>
        </div>
      </div>
    </button>
  );
});

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonCard({ index }: { index: number }) {
  const aspects = [
    "aspect-[3/4]",
    "aspect-[4/5]",
    "aspect-square",
    "aspect-[3/4]",
    "aspect-[2/3]",
  ];
  return (
    <div
      className={cn(
        "w-full rounded-xl bg-neutral-800/50 animate-pulse break-inside-avoid mb-2 sm:mb-3",
        aspects[index % aspects.length]
      )}
    />
  );
}

// ─── Image Modal ─────────────────────────────────────────────────────────────

function ExploreImageModal({
  image,
  open,
  onOpenChange,
}: {
  image: ExploreImage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  if (!image) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full p-0 bg-transparent border-none shadow-none gap-0 [&>button]:hidden max-h-[95dvh] md:max-h-[90vh]">
        <VisuallyHidden>
          <DialogTitle>Image preview</DialogTitle>
        </VisuallyHidden>
        <div className="flex flex-col bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800/50">
          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-3 right-3 z-20 h-8 w-8 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Image — uses next/image here because single large image benefits from optimisation */}
          <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] md:aspect-[3/4] max-h-[65dvh] md:max-h-[70vh] bg-neutral-900">
            <Image
              src={image.url}
              alt={image.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 700px"
              className="object-cover"
            />
          </div>

          {/* CTA Section */}
          <div className="p-5 sm:p-6 space-y-4 bg-neutral-950">
            <div className="space-y-2 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                {image.categoryLabel}
              </p>
              <h3 className="text-lg sm:text-xl font-semibold text-white">
                {image.name}
              </h3>
              <p className="text-sm text-neutral-400">{image.packTitle}</p>
              <p className="text-sm text-neutral-500">{image.description}</p>
            </div>
            <Button
              onClick={() => {
                onOpenChange(false);
                router.push("/dashboard/new");
              }}
              className="w-full h-12 sm:h-13 bg-white hover:bg-neutral-200 text-black font-semibold text-base rounded-xl transition-all active:scale-[0.98]"
            >
              <Sparkles className="h-4.5 w-4.5 mr-2" />
              Generate yours
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ExploreClient() {
  const [categories, setCategories] = useState<ExploreCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<ExploreCategoryId>("all");
  const [images, setImages] = useState<ExploreImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [selectedImage, setSelectedImage] = useState<ExploreImage | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const hasFetchedRef = useRef(false);
  const offsetRef = useRef(0);

  const activeCategoryMeta =
    categories.find((category) => category.id === activeCategory) ?? null;

  // Fetch images
  const fetchImages = useCallback(
    async (category: ExploreCategoryId, offset: number, append: boolean) => {
      try {
        const result =
          category === "all"
            ? await getExploreImages(offset, PAGE_SIZE)
            : await getExploreCategoryImages(category, offset, PAGE_SIZE);

        if (append) {
          setImages((prev) => [...prev, ...result.images]);
        } else {
          setImages(result.images);
        }
        setHasMore(result.hasMore);
        setTotal(result.total);
        offsetRef.current = offset + result.images.length;
      } catch (error) {
        console.error("Failed to load explore images:", error);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    (async () => {
      setIsLoading(true);
      const loadedCategories = await getExploreCategories();
      setCategories(loadedCategories);
      await fetchImages("all", 0, false);
      setIsLoading(false);
    })();
  }, [fetchImages]);

  // Category change
  const handleCategoryChange = useCallback(
    async (category: ExploreCategoryId) => {
      if (category === activeCategory) return;
      setActiveCategory(category);
      setIsLoading(true);
      offsetRef.current = 0;
      await fetchImages(category, 0, false);
      setIsLoading(false);
    },
    [activeCategory, fetchImages]
  );

  // Infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoading &&
          !isLoadingMore
        ) {
          setIsLoadingMore(true);
          await fetchImages(activeCategory, offsetRef.current, true);
          setIsLoadingMore(false);
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, activeCategory, fetchImages]);

  // Image click
  const handleImageClick = useCallback((image: ExploreImage) => {
    setSelectedImage(image);
    setModalOpen(true);
  }, []);

  return (
    <div className="h-full bg-black overflow-y-auto">
      {/* Everything in one scroll container — nothing sticky */}
      <div className="px-4 sm:px-6 pt-6 sm:pt-8 pb-24 md:pb-8">
        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Explore
          </h1>
          <p className="text-sm text-neutral-500">
            Tap any picture to recreate it for yourself
          </p>
        </div>

        {/* ── Category Image Cards ─────────────────────────────────────── */}
        <div className="mt-6">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide py-1">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                isActive={activeCategory === cat.id}
                onClick={() => handleCategoryChange(cat.id)}
              />
            ))}
          </div>
        </div>

        {/* ── Separator ────────────────────────────────────────────────── */}
        <div className="mt-6 border-t border-neutral-800/70" />

        {/* ── Image count ──────────────────────────────────────────────── */}
        <div className="mt-4 mb-3">
          <p className="text-xs text-neutral-600">
            {isLoading
              ? ""
              : activeCategory === "all"
                ? `${total} architecture images across BrickEx`
                : `${total} images in ${activeCategoryMeta?.label ?? "this category"}`}
          </p>
        </div>

        {/* ── Masonry Grid ─────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="columns-2 sm:columns-2 md:columns-3 gap-2 sm:gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
            <Sparkles className="h-12 w-12 mb-4 opacity-40" />
            <p className="text-lg font-medium">No images in this pack yet</p>
            <p className="text-sm">Pick another idea category to keep browsing</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-2 md:columns-3 gap-2 sm:gap-3">
            {images.map((image, index) => (
              <ExploreCard
                key={image.id}
                image={image}
                index={index}
                onClick={handleImageClick}
              />
            ))}
          </div>
        )}

        {/* Load more trigger */}
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {isLoadingMore && (
            <Loader2 className="h-5 w-5 animate-spin text-neutral-600" />
          )}
        </div>
      </div>

      {/* Image Modal */}
      <ExploreImageModal
        image={selectedImage}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
