"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Article {
  slug: string;
  title: string;
  description: string;
  image: string;
}

interface RelatedArticlesProps {
  articles: Article[];
  currentSlug: string;
  className?: string;
}

export default function RelatedArticles({
  articles,
  currentSlug,
  className,
}: RelatedArticlesProps) {
  // Filter out current article and get exactly 3 related articles
  const relatedArticles = articles
    .filter((article) => article.slug !== currentSlug)
    .slice(0, 3);

  if (relatedArticles.length === 0) {
    return null;
  }

  return (
    <section className={cn("py-12 sm:py-16", className)} aria-labelledby="related-articles-heading">
      <div className="mb-8">
        <h2 id="related-articles-heading" className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Sigue leyendo
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Mas articulos que podrian interesarte
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedArticles.map((article) => (
          <Link
            key={article.slug}
            href={`/blog/${article.slug}`}
            className="group"
          >
            <article className="relative h-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-200 hover:-translate-y-1">
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              
              {/* Content */}
              <div className="p-5">
                <h3 className="mb-2 line-clamp-2 text-base font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                  {article.title}
                </h3>
                <p className="line-clamp-2 text-sm text-gray-500">
                  {article.description}
                </p>
                
                {/* Read more indicator */}
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600">
                  <span>Leer articulo</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
