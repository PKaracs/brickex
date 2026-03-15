import { allPosts } from "@/.content-collections/generated";
import { allIdeaPages } from "@/lib/constants/idea-pages";
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://brickex.co";

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
      url: `${baseUrl}/ideas`,
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

  const scenePages: MetadataRoute.Sitemap = allIdeaPages.map((scene) => {
    return {
      url: `${baseUrl}/ideas/${scene.slug}`,
      lastModified: CONTENT_LAST_UPDATED,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      ...(scene.gallery.length > 0 && {
        images: scene.gallery.map((img) => `${baseUrl}${img.src}`),
      }),
    };
  });

  return [...staticPages, ...blogPosts, ...scenePages];
}
