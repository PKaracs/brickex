import { allPosts } from "@/.content-collections/generated";
import { MdxComponents } from "@/components/mdx-components";
import BlogNavbar from "@/components/landing/BlogNavbar";
import BlogFooter from "@/components/landing/BlogFooter";
import BlogTableOfContents from "@/components/landing/BlogTableOfContents";
import RelatedArticles from "@/components/landing/RelatedArticles";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";
import "@/styles/mdx.css";
import { MDXContent } from "@content-collections/mdx/react";
import { Metadata } from "next";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const SITE_URL = "https://richflex.co";
const AUTHOR_NAME = "Ace Rothstein";

// Calculate reading time
function getReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// Extract H2 headings from MDX content for TOC
function extractHeadings(
  content: string
): { id: string; text: string; level: number }[] {
  const headingRegex = /^## (.+)$/gm;
  const headings: { id: string; text: string; level: number }[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const text = match[1].replace(/\*\*/g, "").trim(); // Remove bold markers
    const id = text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    headings.push({ id, text, level: 2 });
  }

  return headings;
}

interface BlogPageItemProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateMetadata({
  params,
}: BlogPageItemProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = allPosts.find((post) => post._meta.path === slug.join("/"));

  if (!blog) {
    return {};
  }

  const canonicalUrl = `${SITE_URL}/blog/${slug.join("/")}`;

  return {
    title: `${blog.title} | Richflex Blog`,
    description: blog.description,
    authors: [{ name: AUTHOR_NAME, url: SITE_URL }],
    creator: AUTHOR_NAME,
    publisher: AUTHOR_NAME,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: blog.title,
      description: blog.description,
      type: "article",
      publishedTime: blog.publishedAt,
      modifiedTime: blog.publishedAt,
      authors: [AUTHOR_NAME],
      url: canonicalUrl,
      siteName: "Richflex",
      locale: "en_US",
      images: [
        {
          url: blog.image,
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.description,
      images: [blog.image],
      creator: "@richflexco",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function BlogPageItem({ params }: BlogPageItemProps) {
  const { slug } = await params;
  const blog = allPosts.find((post) => post._meta.path === slug.join("/"));

  if (!blog) {
    return notFound();
  }

  // Calculate reading time from MDX content
  const readingTime = getReadingTime(blog.content || "");

  // Extract headings for TOC (server-side)
  const tocHeadings = extractHeadings(blog.content || "");

  // Get all articles for related section
  const allArticles = allPosts
    .filter((post) => post.isPosted)
    .map((post) => ({
      slug: post._meta.path,
      title: post.title,
      description: post.description,
      image: post.image,
    }));

  // JSON-LD Structured Data for SEO
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    description: blog.description,
    image: blog.image,
    datePublished: blog.publishedAt,
    dateModified: blog.publishedAt,
    author: {
      "@type": "Person",
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: AUTHOR_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${slug.join("/")}`,
    },
  };

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: blog.title,
        item: `${SITE_URL}/blog/${slug.join("/")}`,
      },
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="min-h-screen bg-white">
        <BlogNavbar />
        <div className="container relative max-w-7xl px-4 sm:px-6 py-6 sm:py-8 mt-8 sm:mt-16 lg:py-14 mx-auto">
          <div className="flex justify-center gap-10 xl:gap-16">
            {/* Table of Contents - Left Sidebar */}
            <BlogTableOfContents
              className="order-first"
              headings={tocHeadings}
            />

            {/* Main Article - Centered */}
            <article className="w-full max-w-3xl">
              <header className="mb-8 sm:mb-10">
                {/* Back button */}
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>All articles</span>
                </Link>

                {/* Meta info row with author byline */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                  <span className="font-medium text-gray-700">
                    {AUTHOR_NAME}
                  </span>
                  <span className="text-gray-300">•</span>
                  {blog.publishedAt && (
                    <time dateTime={blog.publishedAt}>
                      {formatDate(blog.publishedAt)}
                    </time>
                  )}
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {readingTime} min read
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-bold leading-tight text-gray-900 mb-4 sm:mb-6">
                  {blog.title}
                </h1>

                {/* Article description for SEO */}
                <p className="text-lg text-gray-600 leading-relaxed">
                  {blog.description}
                </p>
              </header>

              {blog.image && (
                <figure className="w-full my-6 sm:my-8">
                  <Image
                    src={blog.image}
                    alt={`Featured image for ${blog.title} - ${blog.description.slice(0, 100)}`}
                    width={720}
                    height={405}
                    priority
                    className="w-full h-auto rounded-xl border border-gray-200 bg-gray-50 transition-colors shadow-sm"
                    sizes="(max-width: 768px) 100vw, 720px"
                    style={
                      blog._meta.path === "how-people-signal-wealth-online"
                        ? { maxHeight: "500px", objectFit: "cover" }
                        : { maxHeight: "360px", objectFit: "cover" }
                    }
                  />
                </figure>
              )}

              {/* Mobile Table of Contents */}
              <div className="xl:hidden mb-6">
                <BlogTableOfContents variant="inline" headings={tocHeadings} />
              </div>

              <div className="prose prose-base sm:prose-lg max-w-none text-gray-900 mdx-content blog-prose">
                <MDXContent components={MdxComponents} code={blog.mdx} />
              </div>
            </article>

            {/* Empty space for balance on right */}
            <div className="hidden xl:block w-56 shrink-0" />
          </div>

          {/* Related Articles - Hidden for pillar posts */}
          {blog._meta.path !== "how-people-signal-wealth-online" && (
            <RelatedArticles
              articles={allArticles}
              currentSlug={blog._meta.path}
              className="mt-8 border-t border-gray-100 pt-8"
            />
          )}

          {/* Back Button */}
          <div className="flex justify-center py-6 lg:py-10">
            <Link
              href="/blog"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "text-gray-700 hover:bg-gray-100"
              )}
            >
              <ChevronLeft className="mr-2 size-4" />
              Back to all articles
            </Link>
          </div>
        </div>
        <BlogFooter />
      </div>
    </>
  );
}
