const LEGACY_PROD_APP_HOST = "app.brickex.co";
const PROD_SITE_HOST = "www.brickex.co";
const APP_ROUTE_PREFIX = "/app";

const APP_ROUTE_SEGMENTS = new Set([
  "dashboard",
  "explore",
  "gallery",
  "login",
  "pricing",
  "tools",
  "unsubscribe",
  "video",
  "welcome",
]);

function parseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

export function normalizeBrickexSiteOrigin(url: string): string {
  const parsed = parseUrl(url);
  if (!parsed) {
    return stripTrailingSlash(url);
  }

  if (parsed.hostname === LEGACY_PROD_APP_HOST) {
    parsed.hostname = PROD_SITE_HOST;
  }

  parsed.pathname = "/";
  parsed.search = "";
  parsed.hash = "";

  return stripTrailingSlash(parsed.toString());
}

export function normalizeBrickexAppPageUrl(url: string): string {
  const parsed = parseUrl(url);
  if (!parsed) {
    return stripTrailingSlash(url);
  }

  if (parsed.hostname === LEGACY_PROD_APP_HOST) {
    parsed.hostname = PROD_SITE_HOST;
  }

  const firstSegment = parsed.pathname.split("/").filter(Boolean)[0] ?? "";
  const isAppPagePath =
    parsed.pathname === APP_ROUTE_PREFIX ||
    parsed.pathname.startsWith(`${APP_ROUTE_PREFIX}/`) ||
    APP_ROUTE_SEGMENTS.has(firstSegment);

  if (
    isAppPagePath &&
    parsed.pathname !== APP_ROUTE_PREFIX &&
    !parsed.pathname.startsWith(`${APP_ROUTE_PREFIX}/`)
  ) {
    parsed.pathname = `${APP_ROUTE_PREFIX}${parsed.pathname}`;
  }

  return stripTrailingSlash(parsed.toString());
}

export function buildBrickexAppUrl(siteOrigin: string, pathname: string): string {
  const normalizedOrigin = normalizeBrickexSiteOrigin(siteOrigin);
  const normalizedPathname =
    pathname.length === 0 ? "" : pathname.startsWith("/") ? pathname : `/${pathname}`;

  return `${normalizedOrigin}${APP_ROUTE_PREFIX}${normalizedPathname}`;
}
