/**
 * Rebuild the gallery manifest from what's actually in Supabase storage.
 * Preserves existing alt texts from the manifest. Only generates generic
 * alt texts for truly new images.
 *
 * Usage:
 *   npx tsx scripts/rebuild-gallery-manifest.ts                # rebuild, preserve alt texts
 *   npx tsx scripts/rebuild-gallery-manifest.ts --fix-alts     # also regenerate generic alt texts via GPT
 */

import { config } from "dotenv";
config({ path: ".env" });

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = "objects";
const GALLERY_PREFIX = "seo-gallery";
const MANIFEST_PATH = path.join(__dirname, "../lib/constants/seo-gallery-manifest.ts");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface ImageEntry {
  url: string;
  filename: string;
  aspectRatio: string;
  altText: string;
}

function readExistingManifest(): Record<string, { slug: string; images: ImageEntry[] }> {
  if (!fs.existsSync(MANIFEST_PATH)) return {};
  const content = fs.readFileSync(MANIFEST_PATH, "utf-8");
  const match = content.match(
    /export const seoGalleryManifest\s*=\s*(\{[\s\S]*?\})\s*as\s*const/
  );
  if (!match) return {};
  try {
    return JSON.parse(match[1]);
  } catch {
    return {};
  }
}

async function main() {
  console.log("Scanning Supabase bucket for gallery images...\n");

  // Read existing manifest to preserve alt texts
  const existingManifest = readExistingManifest();
  const existingLookup = new Map<string, ImageEntry>();
  for (const entry of Object.values(existingManifest)) {
    for (const img of entry.images) {
      existingLookup.set(`${entry.slug}/${img.filename}`, img);
    }
  }
  console.log(`Existing manifest has ${existingLookup.size} images with alt texts to preserve\n`);

  // List all folders under seo-gallery/
  const { data: folders, error: folderErr } = await supabase.storage
    .from(BUCKET)
    .list(GALLERY_PREFIX, { limit: 1000 });

  if (folderErr) {
    console.error("Failed to list folders:", folderErr.message);
    process.exit(1);
  }

  const slugFolders = (folders || []).filter((f) => f.id === null || f.metadata === null);
  console.log(`Found ${slugFolders.length} scene folders\n`);

  const manifest: Record<string, { slug: string; images: ImageEntry[] }> = {};

  let totalImages = 0;
  let preservedAltTexts = 0;
  let genericAltTexts = 0;

  for (const folder of slugFolders) {
    const slug = folder.name;
    const { data: files } = await supabase.storage
      .from(BUCKET)
      .list(`${GALLERY_PREFIX}/${slug}`, { limit: 100 });

    if (!files || files.length === 0) continue;

    const images = files
      .filter((f) => f.name.endsWith(".png") || f.name.endsWith(".jpg"))
      .map((f) => {
        const filename = f.name.replace(/\.(png|jpg)$/, "");
        const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${GALLERY_PREFIX}/${slug}/${f.name}`;

        // Try to preserve existing alt text and aspect ratio from manifest
        const existing = existingLookup.get(`${slug}/${filename}`);
        if (existing) {
          preservedAltTexts++;
          return { url, filename, aspectRatio: existing.aspectRatio, altText: existing.altText };
        }

        // Fallback for images not in the manifest
        genericAltTexts++;
        const aspectRatio = filename.includes("cinema") ? "cinema"
          : filename.includes("portrait") ? "portrait"
          : filename.includes("square") ? "square"
          : "cinema";
        const prettySlug = slug.replace(/-/g, " ").replace(/\bai\b/g, "AI");
        const prettyFilename = filename.replace(/-/g, " ");
        const altText = `${prettySlug} — ${prettyFilename} — AI luxury photo by Richflex`;
        return { url, filename, aspectRatio, altText };
      });

    if (images.length > 0) {
      manifest[slug] = { slug, images };
      totalImages += images.length;
      console.log(`  ${slug}: ${images.length} images`);
    }
  }

  console.log(`\nAlt texts: ${preservedAltTexts} preserved from manifest, ${genericAltTexts} generated fresh`);

  // Fix generic alt texts via GPT if --fix-alts flag is set
  const fixAlts = process.argv.includes("--fix-alts");
  if (fixAlts && genericAltTexts > 0) {
    console.log(`\nRegenerating ${genericAltTexts} generic alt texts via GPT...\n`);
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_OPENAI_API_KEY,
    });

    for (const entry of Object.values(manifest)) {
      const genericImages = entry.images.filter((img) =>
        img.altText.includes("AI luxury photo by Richflex")
      );
      if (genericImages.length === 0) continue;

      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Generate SEO-optimized image alt texts (50-80 chars each) for luxury lifestyle AI photos. Return a JSON object with a key 'alts' containing an array of strings.",
            },
            {
              role: "user",
              content: `Scene: ${entry.slug.replace(/-/g, " ")}\nFilenames: ${genericImages.map((i) => i.filename).join(", ")}\n\nGenerate one alt text per filename. Each should describe the luxury scene for Google Image Search.`,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
        });

        const content = response.choices[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          const alts: string[] = parsed.alts || Object.values(parsed);
          genericImages.forEach((img, i) => {
            if (alts[i]) img.altText = alts[i];
          });
          console.log(`  ${entry.slug}: fixed ${genericImages.length} alt texts`);
        }
      } catch (err: any) {
        console.log(`  ${entry.slug}: GPT failed — ${err.message}`);
      }
    }
  }

  // Write manifest
  const json = JSON.stringify(manifest, null, 2);
  const content = `// Auto-generated by scripts/rebuild-gallery-manifest.ts
// Do not edit manually — re-run the script to update.

export interface GalleryImage {
  url: string;
  filename: string;
  aspectRatio: string;
  altText: string;
}

export interface GalleryManifestEntry {
  slug: string;
  images: GalleryImage[];
}

export const seoGalleryManifest = ${json} as const;

export function getGalleryImages(slug: string): GalleryImage[] {
  const entry = (seoGalleryManifest as unknown as Record<string, GalleryManifestEntry>)[slug];
  return entry?.images || [];
}
`;
  fs.writeFileSync(MANIFEST_PATH, content, "utf-8");

  console.log(`\nDone! ${Object.keys(manifest).length} scenes, ${totalImages} total images`);
  console.log(`Manifest written to lib/constants/seo-gallery-manifest.ts`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
