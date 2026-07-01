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
     * 4. landing media folders inside /public
     * 5. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|ingest(?:/|$)|_next/|_static/|_vercel|videos/|architecture-styles/|textures/|[\\w-]+\\.\\w+).*)",
  ],
};

// Auth routes - don't need auth, redirect authenticated users to dashboard
const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

const legacyAppRoutePrefixes = [
  ...authRoutes,
  "/dashboard",
  "/explore",
  "/gallery",
  "/tools",
  "/video",
  "/pricing",
  "/unsubscribe",
];

function matchesRoutePrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function isLegacyAppRoute(pathname: string) {
  return legacyAppRoutePrefixes.some((prefix) =>
    matchesRoutePrefix(pathname, prefix),
  );
}

function isCanonicalAppRoute(pathname: string) {
  return pathname === "/app" || pathname.startsWith("/app/");
}

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Geo-blocking: Block requests from banned countries (Vercel provides this header)
  const country = req.headers.get("x-vercel-ip-country");
  if (country && BLOCKED_COUNTRIES.includes(country)) {
    return new NextResponse("Access Denied", { status: 403 });
  }

  // IMPORTANT: Skip ALL API routes - let them pass through without any rewriting
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname === "/ingest" ||
    url.pathname.startsWith("/ingest/")
  ) {
    return NextResponse.next();
  }

  // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
  const rawHostname = req.headers.get("host") || "localhost:3000";
  let hostname = rawHostname.replace(".localhost:3000", `.brickex.co`);

  // special case for Vercel preview deployment URLs
  if (
    hostname.includes("---") &&
    hostname.endsWith(`.${process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX}`)
  ) {
    hostname = `${hostname.split("---")[0]}.brickex.co`;
  }

  const searchParams = req.nextUrl.searchParams.toString();
  // Get the pathname of the request (e.g. /, /about, /blog/first-post)
  const path = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;

  // Check if this is the app subdomain
  const isAppSubdomain =
    hostname === "app.brickex.co" || rawHostname.startsWith("app.localhost");
  const isPublicSiteHost =
    hostname === "localhost:3000" ||
    hostname === "brickex.co" ||
    hostname === "www.brickex.co";

  // Server actions posted from the app subdomain still need the /app rewrite.
  if (
    req.method === "POST" &&
    req.headers.get("next-action") &&
    !isAppSubdomain
  ) {
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
  if (isPublicSiteHost) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-pathname", url.pathname);

    // Align with the production host Vercel is already enforcing.
    if (hostname === "brickex.co") {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.hostname = "www.brickex.co";
      return NextResponse.redirect(redirectUrl, 308);
    }

    if (url.pathname === "/landing" || url.pathname.startsWith("/landing/")) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = url.pathname.replace(/^\/landing/, "") || "/";
      return NextResponse.redirect(redirectUrl, 308);
    }

    if (isCanonicalAppRoute(url.pathname)) {
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    if (isLegacyAppRoute(url.pathname)) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = `/app${url.pathname}`;
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.rewrite(
      new URL(`/landing${path === "/" ? "" : path}`, req.url),
    );
  }

  // rewrite everything else to `/[domain]/[slug] dynamic route
  return NextResponse.rewrite(new URL(`/${hostname}${path}`, req.url));
}
