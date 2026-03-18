import { allPosts } from "@/.content-collections/generated";
import BlogNavbar from "@/components/landing/BlogNavbar";
import BlogFooter from "@/components/landing/BlogFooter";
import { formatDate } from "@/lib/utils";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog | BrickEx",
  description:
    "Tactical SEO, rendering, and real estate marketing playbooks for developers, architects, and visualization teams.",
  alternates: {
    canonical: "https://brickex.co/blog",
  },
  openGraph: {
    title: "BrickEx Blog",
    description:
      "SEO, rendering, and architectural storytelling strategies built for real estate demand capture.",
    type: "website",
    url: "https://brickex.co/blog",
    siteName: "BrickEx",
  },
};

export default function BlogPage() {
  // Filter only published posts
  const posts = allPosts.filter((post) => post.isPosted === true);

  // Get featured post
  const featuredPost = posts.find((post) => post.isFeatured === true);

  // Get remaining posts sorted by date (newest first)
  const remainingPosts = posts
    .filter((post) => post.isFeatured !== true)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

  return (
    <div className="min-h-screen bg-white">
      <BlogNavbar />
      <main className="pt-4">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Blog
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Search-led content, rendering systems, and visual strategy for
              real estate launches that need traffic and qualified inquiries.
            </p>
          </div>

          {/* Featured Post */}
          {featuredPost && (
            <section className="mb-16">
              <Link
                href={`/blog/${featuredPost._meta.path}`}
                className="group block"
              >
                <article className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white hover:border-gray-400 transition-all duration-300 shadow-sm hover:shadow-md">
                  <div className="grid md:grid-cols-2 gap-0">
                    {/* Image */}
                    <div className="relative aspect-[16/10] md:aspect-auto md:h-full overflow-hidden">
                      <Image
                        src={featuredPost.image}
                        alt={featuredPost.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent md:bg-gradient-to-r" />
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 w-fit mb-4">
                        Featured
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 group-hover:text-gray-600 transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {featuredPost.description}
                      </p>
                      <time
                        dateTime={featuredPost.publishedAt}
                        className="text-sm text-gray-500"
                      >
                        {formatDate(featuredPost.publishedAt)}
                      </time>
                    </div>
                  </div>
                </article>
              </Link>
            </section>
          )}

          {/* Posts Grid */}
          {remainingPosts.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-8">
                {featuredPost ? "More Articles" : "All Articles"}
              </h2>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {remainingPosts.map((post) => (
                  <Link
                    key={post._meta.path}
                    href={`/blog/${post._meta.path}`}
                    className="group block"
                  >
                    <article className="h-full rounded-xl border border-gray-200 bg-white overflow-hidden hover:border-gray-400 hover:shadow-lg transition-all duration-300">
                      {/* Image */}
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-600 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {post.description}
                        </p>
                        <time
                          dateTime={post.publishedAt}
                          className="text-xs text-gray-500"
                        >
                          {formatDate(post.publishedAt)}
                        </time>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {posts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-600">
                No blog posts yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </main>
      <BlogFooter />
    </div>
  );
}
