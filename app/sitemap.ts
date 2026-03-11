import { allPosts } from "@/.content-collections/generated";
import { allSeoPages } from "@/lib/constants/seo-pages-loader";
import { getGalleryImages } from "@/lib/constants/seo-gallery-manifest";
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://richflex.co";

  const CONTENT_LAST_UPDATED = "2026-03-02";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: CONTENT_LAST_UPDATED,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: CONTENT_LAST_UPDATED,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ai-photos`,
      lastModified: CONTENT_LAST_UPDATED,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/legal/privacy`,
      lastModified: "2026-01-01",
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/terms`,
      lastModified: "2026-01-01",
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Blog posts - only published ones
  const blogPosts: MetadataRoute.Sitemap = allPosts
    .filter((post) => post.isPosted === true)
    .map((post) => {
      const lastModifiedDate = post.lastModified 
        ? new Date(post.lastModified) 
        : new Date(post.publishedAt);
      return {
        url: `${baseUrl}/blog/${post._meta.path}`,
        lastModified: lastModifiedDate,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      };
    });

  const scenePages: MetadataRoute.Sitemap = allSeoPages.map((scene) => {
    const gallery = getGalleryImages(scene.slug);
    return {
      url: `${baseUrl}/ai-photos/${scene.slug}`,
      lastModified: CONTENT_LAST_UPDATED,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      ...(gallery.length > 0 && {
        images: gallery.map((img) => img.url),
      }),
    };
  });

  return [...staticPages, ...blogPosts, ...scenePages];
}
