export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp;
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "127.0.0.1";
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  challenged?: boolean;
}

export async function checkMagicLinkSendLimit(
  request: Request,
  email: string
): Promise<RateLimitResult> {
  return { success: true, limit: 999, remaining: 999, reset: Date.now() + 60000 };
}

export async function checkAuthVerifyLimit(
  request: Request
): Promise<RateLimitResult> {
  return { success: true, limit: 999, remaining: 999, reset: Date.now() + 60000 };
}

export async function checkGeneralAuthLimit(
  request: Request
): Promise<RateLimitResult> {
  return { success: true, limit: 999, remaining: 999, reset: Date.now() + 60000 };
}

export function createRateLimitResponse(
  result: RateLimitResult,
  message?: string
): Response {
  return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429 });
}

export async function enforceUserRateLimit(
  userId: string,
  type: "read" | "heavy"
): Promise<{ error: string; status: 429 } | null> {
  return null;
}

export async function isIpChallenged(ip: string): Promise<boolean> {
  return false;
}

export async function recordAuthFailure(ip: string): Promise<boolean> {
  return false;
}
