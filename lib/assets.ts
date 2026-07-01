const DEFAULT_SUPABASE_URL = "https://fgqxhvrvzrzqhofqbmdp.supabase.co";
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL;

export const STORAGE_BASE =
  `${supabaseUrl}/storage/v1/object/public/public-assets` as const;

export function assetUrl(path: string): string {
  return `${STORAGE_BASE}/${path}`;
}
