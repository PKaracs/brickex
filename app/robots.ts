import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.brickex.co";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/app/", // Dashboard pages - private
          "/api/", // API routes
          "/dashboard/", // Dashboard routes
          "/gallery/", // User galleries - private
          "/leaderboard/", // Leaderboard - may want to allow this
          "/sample-landing/", // Sample/test page
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
