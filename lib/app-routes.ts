const APP_ROUTE_PREFIX = "/app";

const AUTH_ROUTE_PREFIXES = [
  "/app/login",
  "/app/register",
  "/app/forgot-password",
  "/app/reset-password",
];

const APP_ROUTE_SEGMENTS = new Set([
  "dashboard",
  "explore",
  "forgot-password",
  "gallery",
  "login",
  "pricing",
  "register",
  "reset-password",
  "tools",
  "unsubscribe",
  "video",
  "welcome",
]);

function stripQuery(pathname: string) {
  return pathname.split("?")[0]?.split("#")[0] ?? pathname;
}

export function toCanonicalAppPathname(pathname: string | null) {
  if (!pathname) return null;

  const cleanPathname = stripQuery(pathname);
  if (
    cleanPathname === APP_ROUTE_PREFIX ||
    cleanPathname.startsWith(`${APP_ROUTE_PREFIX}/`)
  ) {
    return cleanPathname;
  }

  const firstSegment = cleanPathname.split("/").filter(Boolean)[0] ?? "";
  if (APP_ROUTE_SEGMENTS.has(firstSegment)) {
    return `${APP_ROUTE_PREFIX}${cleanPathname}`;
  }

  if (cleanPathname === "/") {
    return APP_ROUTE_PREFIX;
  }

  return cleanPathname;
}

export function isAppAuthRoute(pathname: string | null) {
  const canonicalPathname = toCanonicalAppPathname(pathname);
  if (!canonicalPathname) return false;

  return AUTH_ROUTE_PREFIXES.some(
    (prefix) =>
      canonicalPathname === prefix ||
      canonicalPathname.startsWith(`${prefix}/`),
  );
}
