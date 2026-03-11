import { STORAGE_CONFIG } from "@/lib/constants/storage";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

/**
 * Get public URL for static assets (objects, templates, logos)
 * These are public and should be cached aggressively via Next.js Image optimization
 * 
 * NOTE: This does NOT affect user-generated content quality or generation pipeline
 */
export function getPublicAssetUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_CONFIG.PUBLIC_ASSETS_BUCKET}/${path}`;
}

