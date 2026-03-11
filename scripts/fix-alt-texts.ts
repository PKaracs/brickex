/**
 * Fix all generic/missing alt texts in the gallery manifest using GPT.
 * Reads the current manifest, finds images with bad alt texts, and
 * regenerates them with SEO-optimized descriptions.
 *
 * Usage: npx tsx scripts/fix-alt-texts.ts
 */

import { config } from "dotenv";
config({ path: ".env" });

import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";

const MANIFEST_PATH = path.join(__dirname, "../lib/constants/seo-gallery-manifest.ts");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_OPENAI_API_KEY,
});

interface ImageEntry {
  url: string;
  filename: string;
  aspectRatio: string;
  altText: string;
}

interface ManifestEntry {
  slug: string;
  images: ImageEntry[];
}

function readManifest(): Record<string, ManifestEntry> {
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

function writeManifest(manifest: Record<string, ManifestEntry>) {
  const json = JSON.stringify(manifest, null, 2);
  const content = `// Auto-generated — do not edit manually.

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
}

function isBadAltText(alt: string): boolean {
  return (
    alt.includes("AI luxury photo —") ||
    alt.includes("AI luxury photo by Richflex") ||
    alt.length < 30 ||
    !alt.trim()
  );
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const manifest = readManifest();
  const entries = Object.values(manifest);

  // Find all scenes with bad alt texts
  const toFix: { slug: string; images: ImageEntry[] }[] = [];
  let totalBad = 0;
  let totalGood = 0;

  for (const entry of entries) {
    const badImages = entry.images.filter((img) => isBadAltText(img.altText));
    if (badImages.length > 0) {
      toFix.push({ slug: entry.slug, images: badImages });
      totalBad += badImages.length;
    }
    totalGood += entry.images.length - badImages.length;
  }

  console.log(`Total images: ${totalBad + totalGood}`);
  console.log(`Good alt texts: ${totalGood}`);
  console.log(`Bad/generic alt texts to fix: ${totalBad}`);
  console.log(`Scenes to process: ${toFix.length}\n`);

  if (totalBad === 0) {
    console.log("All alt texts look good!");
    return;
  }

  let fixed = 0;
  let failed = 0;

  for (let i = 0; i < toFix.length; i++) {
    const { slug, images } = toFix[i];
    process.stdout.write(`[${i + 1}/${toFix.length}] ${slug} (${images.length} images)... `);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You write SEO-optimized image alt texts for a luxury AI photo generator called Richflex. Each alt text should be 50-90 characters, descriptive, keyword-rich, and unique. They should describe what's IN the image based on the filename. Include luxury keywords.

Return JSON: {"alts": ["alt text 1", "alt text 2", ...]}`,
          },
          {
            role: "user",
            content: `Scene: "${slug.replace(/-/g, " ")}"\n\nGenerate alt texts for these ${images.length} images:\n${images.map((img, j) => `${j + 1}. ${img.filename}`).join("\n")}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("Empty response");

      const parsed = JSON.parse(content);
      const alts: string[] = parsed.alts || Object.values(parsed).flat();

      let sceneFixed = 0;
      images.forEach((img, j) => {
        if (alts[j] && alts[j].length > 10) {
          // Find this image in the manifest and update it
          const manifestEntry = manifest[slug];
          const manifestImg = manifestEntry?.images.find((m) => m.filename === img.filename);
          if (manifestImg) {
            manifestImg.altText = alts[j];
            sceneFixed++;
          }
        }
      });

      fixed += sceneFixed;
      console.log(`OK (${sceneFixed} fixed)`);
    } catch (err: any) {
      console.log(`FAILED: ${err.message}`);
      failed += images.length;
    }

    if (i < toFix.length - 1) await sleep(300);
  }

  // Write updated manifest
  writeManifest(manifest);

  console.log(`\nDone! Fixed: ${fixed}, Failed: ${failed}`);
  console.log(`Manifest updated.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
