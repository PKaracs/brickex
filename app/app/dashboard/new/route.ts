import { NextRequest, NextResponse } from "next/server";

import { getOrCreateDraftProject } from "@/lib/actions/create-project";
import { getSession } from "@/lib/auth-session";

// A route handler (instead of a page) issues a real HTTP redirect before any
// HTML streams. The previous page-based redirect() ran after the layout shell
// had flushed, so Next.js fell back to a delayed <meta http-equiv="refresh">,
// which raced hydration and aborted in-flight requests right after login.
export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/app/login", request.url), 307);
  }

  const result = await getOrCreateDraftProject();

  if ("error" in result) {
    return NextResponse.redirect(new URL("/app/gallery", request.url), 307);
  }

  const destination = new URL(
    `/app/dashboard/${result.projectId}`,
    request.url,
  );
  const checkout = request.nextUrl.searchParams.get("checkout");
  if (checkout) {
    destination.searchParams.set("checkout", checkout);
  }
  const auth = request.nextUrl.searchParams.get("auth");
  if (auth) {
    destination.searchParams.set("auth", auth);
  }

  return NextResponse.redirect(destination, 307);
}
