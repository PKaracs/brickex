import { NextRequest, NextResponse } from "next/server";

const DEFAULT_SUPABASE_URL = "https://fgqxhvrvzrzqhofqbmdp.supabase.co";
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL;

const STORAGE_BASE = `${supabaseUrl}/storage/v1/object/public/public-assets`;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const segments = (await params).path;
  return NextResponse.redirect(`${STORAGE_BASE}/${segments.join("/")}`, 301);
}
