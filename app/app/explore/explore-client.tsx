"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  getExploreImages,
  getExploreCategoryImages,
  type ExploreImage,
} from "@/lib/actions/get-explore-images";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { X, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Constants ───────────────────────────────────────────────────────────────

/** Category cards with cover images from the explore bucket */
const CATEGORIES = [
  {
    id: "all",
    label: "All",
    cover: `https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/explore/johnny/output-adu6w97xyuyqyqutxgkcqhfz.png`,
  },
  {
    id: "luxury",
    label: "Luxury",
    cover: `https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/explore/johnny/output-zpumpiz47xtlrz7inu2oyeqe.png`,
  },
  {
    id: "travel",
    label: "Travel",
    cover: `https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/explore/johnny/output-cf5hyr7rqmutm54zcfiolv9r.png`,
  },
  {
    id: "lifestyle",
    label: "Lifestyle",
    cover: `https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/explore/johnny/output-a8kt0or378cjqsqiczwac0b7.png`,
  },
  {
    id: "cars",
    label: "Cars & Jets",
    cover: `https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/explore/johnny/output-wvd0505qqfdpzx7dqogduz1v.png`,
  },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

const PAGE_SIZE = 20;

// ─── Category Card ───────────────────────────────────────────────────────────

const CategoryCard = memo(function CategoryCard({
  category,
  isActive,
  onClick,
}: {
  category: (typeof CATEGORIES)[number];
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
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        {/* Label */}
        <span className="absolute bottom-3 left-0 right-0 text-center text-sm sm:text-base font-bold text-white tracking-wide drop-shadow-lg">
          {category.label}
        </span>
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
          src={image.url}
          alt=""
          loading={index < 4 ? "eager" : "lazy"}
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 group-active:scale-[1.02]"
        />
        {/* Hover gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
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
              alt="Explore image preview"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 700px"
              className="object-cover"
            />
          </div>

          {/* CTA Section */}
          <div className="p-5 sm:p-6 space-y-4 bg-neutral-950">
            <div className="text-center space-y-1.5">
              <h3 className="text-lg sm:text-xl font-semibold text-white">
                Create your own version
              </h3>
              <p className="text-sm text-neutral-400">
                Upload a selfie and recreate this look with AI
              </p>
            </div>
            <Button
              onClick={() => {
                onOpenChange(false);
                router.push("/dashboard");
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
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
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

  // Fetch images
  const fetchImages = useCallback(
    async (category: CategoryId, offset: number, append: boolean) => {
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
      await fetchImages("all", 0, false);
      setIsLoading(false);
    })();
  }, [fetchImages]);

  // Category change
  const handleCategoryChange = useCallback(
    async (category: CategoryId) => {
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
            {CATEGORIES.map((cat) => (
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
            {isLoading ? "" : `${total} images to explore`}
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
            <p className="text-lg font-medium">No images yet</p>
            <p className="text-sm">Check back soon for inspiration</p>
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
