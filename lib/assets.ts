export const STORAGE_BASE =
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-assets` as const;

export function assetUrl(path: string): string {
  return `${STORAGE_BASE}/${path}`;
}
