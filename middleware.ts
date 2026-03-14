import { NextRequest, NextResponse } from "next/server";

// Blocked countries (ISO 3166-1 alpha-2 codes)
// Add country codes here to block access
const BLOCKED_COUNTRIES = [
  "AO", // Angola
];

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

// Auth routes - don't need auth, redirect authenticated users to dashboard
const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Geo-blocking: Block requests from banned countries (Vercel provides this header)
  const country = req.headers.get("x-vercel-ip-country");
  if (country && BLOCKED_COUNTRIES.includes(country)) {
    return new NextResponse("Access Denied", { status: 403 });
  }

  // IMPORTANT: Skip ALL API routes - let them pass through without any rewriting
  if (url.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
  const rawHostname = req.headers.get("host") || "localhost:3000";
  let hostname = rawHostname.replace(".localhost:3000", `.brickex.com`);

  // special case for Vercel preview deployment URLs
  if (
    hostname.includes("---") &&
    hostname.endsWith(`.${process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX}`)
  ) {
    hostname = `${hostname.split("---")[0]}.brickex.com`;
  }

  const searchParams = req.nextUrl.searchParams.toString();
  // Get the pathname of the request (e.g. /, /about, /blog/first-post)
  const path = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;

  // Check if this is the app subdomain (app.richflex.co or app.localhost:3000)
  const isAppSubdomain =
    hostname === "app.brickex.com" || rawHostname.startsWith("app.localhost");

  // Server actions posted from the app subdomain still need the /app rewrite.
  if (req.method === "POST" && req.headers.get("next-action") && !isAppSubdomain) {
    return NextResponse.next();
  }

  // is maintenance mode
  if (isAppSubdomain && process.env.MAINTENANCE_MODE === "true") {
    return NextResponse.rewrite(new URL("/app/maintenance", req.url));
  }

  // rewrites for app pages
  if (isAppSubdomain) {
    // Just rewrite - let pages handle auth checks
    const normalizedPath = path.startsWith("/app")
      ? path
      : `/app${path === "/" ? "" : path}`;

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-pathname", url.pathname);

    const response = NextResponse.rewrite(new URL(normalizedPath, req.url), {
      request: {
        headers: requestHeaders,
      },
    });
    return response;
  }

  // rewrite root application to `/home` folder
  if (hostname === "localhost:3000" || hostname === "brickex.com") {
    return NextResponse.rewrite(
      new URL(`/landing${path === "/" ? "" : path}`, req.url)
    );
  }

  // rewrite everything else to `/[domain]/[slug] dynamic route
  return NextResponse.rewrite(new URL(`/${hostname}${path}`, req.url));
}
