import { NextRequest, NextResponse } from "next/server";

const STORAGE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-assets`;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const segments = (await params).path;
  return NextResponse.redirect(`${STORAGE_BASE}/${segments.join("/")}`, 301);
}
