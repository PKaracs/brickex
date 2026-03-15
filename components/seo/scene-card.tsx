import Link from "next/link";
import {
  type IdeaPage,
  getIdeaHeroImage,
  IDEA_CATEGORY_LABELS,
} from "@/lib/constants/idea-pages";

interface SceneCardProps {
  scene: IdeaPage;
  priority?: boolean;
}

function getOptimizedUrl(url: string, width: number): string {
  if (url.includes("/storage/v1/object/public/")) {
    return url.replace(
      "/storage/v1/object/public/",
      "/storage/v1/render/image/public/"
    ) + `?width=${width}&resize=contain&quality=75`;
  }
  return url;
}

export function SceneCard({ scene, priority = false }: SceneCardProps) {
  const image = getIdeaHeroImage(scene);

  return (
    <Link
      href={`/ideas/${scene.slug}`}
      className="group relative block overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-900 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)] transition-all duration-300 hover:border-neutral-700/80 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
    >
      {image && (
        <div className="relative aspect-[4/3] overflow-hidden bg-neutral-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getOptimizedUrl(image, 480)}
            alt={scene.content.headline}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading={priority ? "eager" : "lazy"}
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />
        </div>
      )}
      <div className="relative p-4 sm:p-5">
        <span className="mb-2 inline-block text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          {IDEA_CATEGORY_LABELS[scene.category] || scene.category}
        </span>
        <h3 className="text-sm sm:text-base font-semibold text-white mb-1.5 group-hover:text-zinc-100 transition-colors">
          {scene.content.headline}
        </h3>
        <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed line-clamp-2">
          {scene.content.subheadline}
        </p>
      </div>
    </Link>
  );
}
