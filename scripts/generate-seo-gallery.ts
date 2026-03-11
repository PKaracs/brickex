/**
 * SEO Gallery Image Generation Pipeline
 *
 * Two-model pipeline:
 *   1. OpenAI GPT-4o generates pro-level photography prompts
 *   2. Gemini 3 Pro generates the images
 *   3. Uploads to Supabase public bucket
 *   4. Writes manifest file for the app to consume
 *
 * Usage:
 *   npx tsx scripts/generate-seo-gallery.ts --slug bugatti-chiron-mansion
 *   npx tsx scripts/generate-seo-gallery.ts --all
 *   npx tsx scripts/generate-seo-gallery.ts --all --skip-existing
 */

import { config } from "dotenv";
config({ path: ".env" });

import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// ─── Config ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = "objects";
const GALLERY_PREFIX = "seo-gallery";
const IMAGES_PER_SCENE = 8;
const IMAGE_DELAY_MS = 2000;

const GEMINI_ASPECT_RATIOS: Record<string, string> = {
  cinema: "16:9",
  portrait: "4:5",
  square: "1:1",
};

// ─── Clients ─────────────────────────────────────────────────────────────────

let _openai: OpenAI;
function getOpenAI() {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_OPENAI_API_KEY,
    });
  }
  return _openai;
}

let _genai: GoogleGenAI;
function getGenAI() {
  if (!_genai) {
    _genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY! });
  }
  return _genai;
}

let _supabase: ReturnType<typeof createClient>;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  }
  return _supabase;
}

// ─── Scene Data ──────────────────────────────────────────────────────────────

interface SceneForGen {
  slug: string;
  category: string;
  templateDescription: string;
  headline: string;
  keywords: string[];
}

function loadScenes(): SceneForGen[] {
  const dataDir = path.join(__dirname, "../data/seo-pages");
  const allPages: any[] = [];
  const files = fs
    .readdirSync(dataDir)
    .filter((f: string) => f.endsWith(".json"));
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf-8"));
    if (Array.isArray(data)) allPages.push(...data);
  }

  return allPages.map((page: any) => ({
    slug: page.slug,
    category: page.category,
    templateDescription:
      page.content?.paragraphs?.[0] || page.content?.headline || "",
    headline: page.content?.headline || page.slug,
    keywords: page.seo?.keywords || [],
  }));
}

// ─── OpenAI Prompt Generation ────────────────────────────────────────────────

interface GeneratedPrompt {
  filename: string;
  aspectRatio: "cinema" | "portrait" | "square";
  prompt: string;
  altText: string;
  description: string;
}

const SYSTEM_PROMPT = `You are an elite luxury lifestyle photographer and creative director for Richflex, an AI luxury photo generator. Your job is to write extremely detailed, photorealistic AI image generation prompts that scream ULTRA-LUXURY and WEALTHY LIFESTYLE.

EVERY image must drip with wealth, exclusivity, and aspirational lifestyle. Think: the kind of photos that make people stop scrolling. The kind that get posted on luxury Instagram accounts with millions of followers. The kind where someone looks at it and thinks "I want that life."

LUXURY ELEMENTS TO WEAVE INTO EVERY PROMPT:
- Designer clothing: Tom Ford suits, Loro Piana cashmere, Brunello Cucinelli, Hermès, Gucci, Louis Vuitton — never cheap-looking outfits
- Luxury accessories: Rolex, Patek Philippe, Cartier jewelry, Hermès Birkin bags, designer sunglasses (Oliver Peoples, Tom Ford)
- Premium materials everywhere: marble, leather, brushed gold, polished chrome, exotic wood, crystal glassware
- Wealth signals: champagne (Dom Pérignon, Cristal), fine wine, cigars, fresh flowers (white roses, orchids)
- Immaculate grooming: perfect hair, flawless skin, manicured nails, confident posture
- Environments that cost money: private terminals, yacht clubs, penthouse terraces, members-only lounges, Michelin-star restaurants

Each prompt MUST specify ALL of the following:
- Camera: exact camera body + lens (e.g. "Canon EOS R5 with RF 24-70mm f/2.8L IS USM")
- Settings: aperture, ISO, shutter speed
- Angle: exact camera angle and height (low angle, eye level, overhead, dutch tilt, worm's eye, etc.)
- Lighting: time of day, light source, quality (golden hour, overcast, neon, studio strobes, etc.)
- Person: a WEALTHY, stylishly dressed person naturally integrated into the scene. They should look like they OWN everything in frame. Describe their designer outfit, luxury accessories, confident pose, body language, and expression. Vary gender across the set. The person is the HERO.
- Environment: ultra-detailed luxury scene — specific materials, textures, brands, and wealth indicators
- Mood: rich, cinematic color grading. Think: Vogue, Architectural Digest, Robb Report
- Composition: rule of thirds, leading lines, framing, negative space, shallow depth of field

IMPORTANT RULES:
- At least 6 out of 8 images MUST include a person as the main subject
- The remaining 1-2 can be establishing/detail shots showcasing luxury objects (a watch on marble, champagne on a yacht railing, car key on a leather surface)
- NEVER reference "the reference image" or "the person from the reference" — these are standalone scenes with generic ultra-wealthy people
- Vary the shots dramatically: wide establishing, medium, close-up details, different angles, different times of day
- Each prompt should produce a visually DISTINCT image from the others
- Prompts should be 200-300 words each — be extremely specific about luxury details
- The images must look like they belong in a luxury lifestyle magazine editorial spread
- AVOID anything that looks cheap, generic, or stock-photo-ish — every detail should signal wealth

You MUST return a JSON object with a single key "prompts" containing an array of exactly ${IMAGES_PER_SCENE} objects. Each object has these fields:
- filename: descriptive kebab-case filename (e.g. "wide-golden-hour-establishing")
- aspectRatio: one of "cinema", "portrait", or "square". Use a MIX across the set (at least 2 cinema, 2 portrait, and 2 square)
- prompt: the full detailed generation prompt
- altText: SEO-optimized alt text (50-80 chars) describing the image for Google Image Search, incorporating the scene keywords
- description: A 1-2 sentence visible caption (100-180 chars) for the image that will be displayed on the page. Must be keyword-rich, descriptive, and read naturally. Include the scene name and relevant luxury/lifestyle keywords. This is shown as a figcaption under each image and is a critical Google Image Search ranking signal.

Example response structure:
{"prompts": [{"filename": "...", "aspectRatio": "cinema", "prompt": "...", "altText": "...", "description": "..."}, ...]}`;

async function generatePrompts(scene: SceneForGen): Promise<GeneratedPrompt[]> {
  const userMsg = `Generate ${IMAGES_PER_SCENE} ultra-luxury photography prompts for this scene:

SCENE: ${scene.headline}
CATEGORY: ${scene.category}
DESCRIPTION: ${scene.templateDescription}
SEO KEYWORDS: ${scene.keywords.join(", ")}

Create a diverse gallery that screams wealth and exclusivity. Every image should make the viewer think "this person is rich." Include specific luxury brands, premium materials, and affluent environments. Vary angles, times of day, and compositions — but the common thread is EXTREME LUXURY in every frame.`;

  console.log(`  [OpenAI] Generating ${IMAGES_PER_SCENE} prompts...`);

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMsg },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenAI");

  const parsed = JSON.parse(content);

  let prompts: GeneratedPrompt[];
  if (Array.isArray(parsed)) {
    prompts = parsed;
  } else if (typeof parsed === "object" && parsed !== null) {
    const arrayValue = Object.values(parsed).find((v) => Array.isArray(v));
    if (arrayValue) {
      prompts = arrayValue as GeneratedPrompt[];
    } else if (parsed.filename && parsed.prompt) {
      // GPT returned a single prompt object — wrap it
      prompts = [parsed as GeneratedPrompt];
    } else {
      throw new Error(
        `Unexpected OpenAI response shape: ${content.slice(0, 300)}`,
      );
    }
  } else {
    throw new Error(
      `Unexpected OpenAI response shape: ${content.slice(0, 300)}`,
    );
  }

  if (prompts.length === 0) {
    throw new Error("OpenAI returned empty prompts array");
  }

  console.log(`  [OpenAI] Got ${prompts.length} prompts`);
  return prompts;
}

// ─── Nano Banana 2 Image Generation (gemini-3.1-flash-image-preview) ─────────

async function generateImage(
  prompt: string,
  aspectRatio: string,
): Promise<Buffer | null> {
  const ratio = GEMINI_ASPECT_RATIOS[aspectRatio] || "16:9";
  const MAX_RETRIES = 2;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      console.log(`    [NanoBanana2] Retry ${attempt}/${MAX_RETRIES}...`);
      await sleep(3000 * attempt);
    }

    try {
      const response = await getGenAI().models.generateContent({
        model: "gemini-3.1-flash-image-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseModalities: ["IMAGE", "TEXT"],
          imageConfig: {
            aspectRatio: ratio,
            imageSize: "2K",
          },
        },
      });

      if (!response.candidates || response.candidates.length === 0) {
        console.log(`    [NanoBanana2] Empty response`);
        if (attempt < MAX_RETRIES) continue;
        return null;
      }

      const candidate = response.candidates[0];

      if (candidate.finishReason === "SAFETY") {
        console.log(`    [NanoBanana2] Blocked by safety filter`);
        return null;
      }

      if (candidate.content?.parts) {
        for (const part of candidate.content.parts) {
          if ("inlineData" in part && part.inlineData?.data) {
            return Buffer.from(part.inlineData.data, "base64");
          }
        }
      }

      if (attempt < MAX_RETRIES) continue;
      return null;
    } catch (error: any) {
      const msg = error?.message || String(error);
      // Rate limit — wait longer and retry
      if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
        console.log(`    [NanoBanana2] Rate limited, waiting 30s...`);
        await sleep(30000);
        if (attempt < MAX_RETRIES) continue;
      }
      console.error(`    [NanoBanana2] Error: ${msg.slice(0, 200)}`);
      if (error?.status === 401 || error?.status === 400) throw error;
      if (attempt < MAX_RETRIES) continue;
      return null;
    }
  }

  return null;
}

// ─── Supabase Upload ─────────────────────────────────────────────────────────

async function uploadImage(
  slug: string,
  filename: string,
  buffer: Buffer,
): Promise<string> {
  const storagePath = `${GALLERY_PREFIX}/${slug}/${filename}.png`;
  const contentType = "image/png";
  const MAX_UPLOAD_RETRIES = 3;

  for (let attempt = 0; attempt < MAX_UPLOAD_RETRIES; attempt++) {
    if (attempt > 0) {
      console.log(`    [Upload] Retry ${attempt}/${MAX_UPLOAD_RETRIES - 1}...`);
      await sleep(2000 * attempt);
    }

    const { error } = await getSupabase()
      .storage.from(BUCKET)
      .upload(storagePath, buffer, { contentType, upsert: true });

    if (!error) {
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
      return publicUrl;
    }

    // If it's a transient error (HTML response, timeout), retry
    if (error.message.includes("DOCTYPE") || error.message.includes("fetch")) {
      if (attempt < MAX_UPLOAD_RETRIES - 1) continue;
    }

    throw new Error(
      `Upload failed after ${MAX_UPLOAD_RETRIES} attempts: ${error.message}`,
    );
  }

  throw new Error("Upload failed: exhausted retries");
}

async function listExistingImages(slug: string): Promise<Set<string>> {
  const prefix = `${GALLERY_PREFIX}/${slug}`;
  const { data } = await getSupabase()
    .storage.from(BUCKET)
    .list(prefix, { limit: 100 });
  return new Set((data || []).map((f) => f.name.replace(/\.png$/, "")));
}

// ─── Manifest ────────────────────────────────────────────────────────────────

interface ManifestEntry {
  slug: string;
  images: Array<{
    url: string;
    filename: string;
    aspectRatio: string;
    altText: string;
    description?: string;
  }>;
}

const MANIFEST_PATH = path.join(
  __dirname,
  "../lib/constants/seo-gallery-manifest.ts",
);

function readManifest(): Record<string, ManifestEntry> {
  if (!fs.existsSync(MANIFEST_PATH)) return {};

  const content = fs.readFileSync(MANIFEST_PATH, "utf-8");
  const match = content.match(
    /export const seoGalleryManifest[^=]*=\s*(\{[\s\S]*\}) as const/,
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
  const content = `// Auto-generated by scripts/generate-seo-gallery.ts
// Do not edit manually — re-run the script to update.

export interface GalleryImage {
  url: string;
  filename: string;
  aspectRatio: string;
  altText: string;
  description?: string;
}

export interface GalleryManifestEntry {
  slug: string;
  images: readonly GalleryImage[];
}

export const seoGalleryManifest = ${json} as const;

export function getGalleryImages(slug: string): GalleryImage[] {
  const entry = (seoGalleryManifest as unknown as Record<string, GalleryManifestEntry>)[slug];
  return entry?.images ? [...entry.images] : [];
}
`;
  fs.writeFileSync(MANIFEST_PATH, content, "utf-8");
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function processScene(scene: SceneForGen, skipExisting: boolean) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`SCENE: ${scene.headline} (${scene.slug})`);
  console.log(`${"═".repeat(60)}`);

  const existing = await listExistingImages(scene.slug);
  if (skipExisting && existing.size >= IMAGES_PER_SCENE) {
    console.log(`  Skipping — already has ${existing.size} images`);
    return;
  }

  // Step 1: Generate prompts via OpenAI
  const prompts = await generatePrompts(scene);

  // Step 2: Generate images via Gemini + upload (saves manifest after EACH image)
  let manifest = readManifest();
  const existingImages = manifest[scene.slug]?.images || [];
  const images: ManifestEntry["images"] = [...existingImages];

  for (let i = 0; i < prompts.length; i++) {
    const p = prompts[i];
    const filename = p.filename || `variant-${i + 1}`;

    if (skipExisting && existing.has(filename)) {
      console.log(
        `  [${i + 1}/${prompts.length}] ${filename} — exists, skipping`,
      );
      if (!images.find((img) => img.filename === filename)) {
        const existingImg = existingImages.find(
          (img) => img.filename === filename,
        );
        if (existingImg) images.push(existingImg);
      }
      continue;
    }

    console.log(
      `  [${i + 1}/${prompts.length}] ${filename} (${p.aspectRatio})`,
    );
    console.log(`    Prompt: ${p.prompt.slice(0, 120)}...`);

    const buffer = await generateImage(p.prompt, p.aspectRatio);

    if (!buffer) {
      console.log(`    FAILED — no image generated`);
      continue;
    }

    console.log(`    Generated ${(buffer.length / 1024).toFixed(0)}KB`);

    try {
      const url = await uploadImage(scene.slug, filename, buffer);
      console.log(`    Uploaded: ${url}`);

      images.push({
        url,
        filename,
        aspectRatio: p.aspectRatio,
        altText: p.altText,
        ...(p.description && { description: p.description }),
      });

      // Save manifest after each successful image so partial galleries are preserved
      manifest = readManifest();
      manifest[scene.slug] = { slug: scene.slug, images: [...images] };
      writeManifest(manifest);
    } catch (uploadErr: any) {
      console.log(`    UPLOAD FAILED: ${uploadErr.message} — continuing`);
    }

    // Rate limit between Gemini calls
    if (i < prompts.length - 1) {
      await sleep(IMAGE_DELAY_MS);
    }
  }

  // Final manifest write
  manifest = readManifest();
  manifest[scene.slug] = { slug: scene.slug, images };
  writeManifest(manifest);

  console.log(`\n  Done: ${images.length} images for ${scene.slug}`);
  console.log(`  Public URLs:`);
  images.forEach((img) => console.log(`    ${img.url}`));
}

function parseIntArg(args: string[], flag: string): number | null {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return null;
  const val = parseInt(args[idx + 1], 10);
  return isNaN(val) ? null : val;
}

async function main() {
  const args = process.argv.slice(2);
  const slugFlag = args.indexOf("--slug");
  const allFlag = args.includes("--all");
  const skipExisting = args.includes("--skip-existing");
  const batchSize = parseIntArg(args, "--batch") || 0;
  const offsetArg = parseIntArg(args, "--offset") || 0;
  const categoryFlag =
    args.indexOf("--category") !== -1
      ? args[args.indexOf("--category") + 1]
      : null;

  if (!allFlag && slugFlag === -1) {
    console.log(`Usage:
  npx tsx scripts/generate-seo-gallery.ts --slug <scene-slug>
  npx tsx scripts/generate-seo-gallery.ts --all [--skip-existing]
  npx tsx scripts/generate-seo-gallery.ts --all --batch 5 [--skip-existing]         # 5 pages at a time
  npx tsx scripts/generate-seo-gallery.ts --all --batch 5 --offset 10               # start from page 11
  npx tsx scripts/generate-seo-gallery.ts --all --category dating --batch 5          # only dating pages

Available scenes:`);
    const scenes = loadScenes();
    scenes.forEach((s) => console.log(`  ${s.slug} (${s.category})`));
    console.log(`\nTotal: ${scenes.length}`);
    process.exit(0);
  }

  // Validate env
  if (!process.env.OPENAI_API_KEY && !process.env.NEXT_OPENAI_API_KEY) {
    console.error("ERROR: OPENAI_API_KEY not set in .env");
    process.exit(1);
  }
  if (!process.env.GOOGLE_GENAI_API_KEY) {
    console.error("ERROR: GOOGLE_GENAI_API_KEY not set in .env");
    process.exit(1);
  }
  if (!SUPABASE_SERVICE_KEY) {
    console.error("ERROR: SUPABASE_SERVICE_ROLE_KEY not set in .env");
    process.exit(1);
  }

  let scenes = loadScenes();

  // Filter by category
  if (categoryFlag) {
    scenes = scenes.filter((s) => s.category === categoryFlag);
    console.log(
      `Filtered to category "${categoryFlag}": ${scenes.length} scenes`,
    );
  }

  if (slugFlag !== -1) {
    const targetSlug = args[slugFlag + 1];
    const scene = scenes.find((s) => s.slug === targetSlug);
    if (!scene) {
      console.error(`Scene not found: ${targetSlug}`);
      console.log("Available:", scenes.map((s) => s.slug).join(", "));
      process.exit(1);
    }
    await processScene(scene, skipExisting);
  } else if (allFlag) {
    // Apply offset
    if (offsetArg > 0) {
      scenes = scenes.slice(offsetArg);
      console.log(`Skipping first ${offsetArg} scenes (--offset)`);
    }

    // Apply batch size
    if (batchSize > 0) {
      scenes = scenes.slice(0, batchSize);
      console.log(`Batch size: ${batchSize} scenes`);
    }

    console.log(`\nGenerating gallery images for ${scenes.length} scenes...\n`);

    let completed = 0;
    let failed = 0;
    for (const scene of scenes) {
      try {
        await processScene(scene, skipExisting);
        completed++;
      } catch (err: any) {
        console.error(`\n  SCENE FAILED: ${scene.slug} — ${err.message}`);
        failed++;
      }
    }

    console.log(`\n${"═".repeat(60)}`);
    console.log(
      `BATCH COMPLETE: ${completed} succeeded, ${failed} failed out of ${scenes.length}`,
    );
    if (batchSize > 0 && offsetArg + batchSize < loadScenes().length) {
      console.log(
        `\nNext batch: --all --batch ${batchSize} --offset ${offsetArg + batchSize} --skip-existing`,
      );
    }
  }

  console.log("\nManifest written to lib/constants/seo-gallery-manifest.ts");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
