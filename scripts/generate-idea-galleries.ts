import { config } from "dotenv";
config({ path: ".env" });

import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import {
  ideaTopicSeeds,
  type IdeaTopicSeed,
} from "../lib/constants/idea-topic-seeds";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.NEXT_OPENAI_API_KEY;
const GOOGLE_GENAI_API_KEY = process.env.GOOGLE_GENAI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET_PUBLIC_ASSETS || "objects";

if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY");
  process.exit(1);
}

if (!GOOGLE_GENAI_API_KEY) {
  console.error("Missing GOOGLE_GENAI_API_KEY");
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const genai = new GoogleGenAI({ apiKey: GOOGLE_GENAI_API_KEY });
const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;

const MODEL = "gemini-3.1-flash-image-preview";
const IMAGES_PER_TOPIC = 8;
const IMAGE_DELAY_MS = 2500;
const OUTPUT_ROOT = path.join(process.cwd(), "public", "ideas-generated");
const REMOTE_ROOT = "ideas-generated";
const MANIFEST_PATH = path.join(
  process.cwd(),
  "data",
  "ideas",
  "idea-gallery-manifest.json",
);

type AspectRatio = "cinema" | "portrait" | "square";

interface GeneratedPrompt {
  filename: string;
  title: string;
  aspectRatio: AspectRatio;
  prompt: string;
  altText: string;
  description: string;
}

interface ManifestImage {
  id: string;
  src: string;
  aspectRatio: AspectRatio;
  title: string;
  altText: string;
  description: string;
  prompt: string;
  promptLabel: string;
}

interface ManifestEntry {
  slug: string;
  images: ManifestImage[];
}

const GEMINI_ASPECT_RATIOS: Record<AspectRatio, string> = {
  cinema: "16:9",
  portrait: "4:5",
  square: "1:1",
};

const SYSTEM_PROMPT = `You are an expert architectural visualization director and luxury real estate image prompt engineer working for BrickEx.

Your job is to create photorealistic luxury architecture and interior image prompts for architecture students, developers, interior designers, and real estate marketers.

CRITICAL GOALS:
- Keep every gallery tightly coherent around a single search intent
- Make every image useful as either a precedent image, presentation-board reference, interior design reference, or real estate marketing visual
- The result must look like premium architectural photography or top-tier photorealistic luxury visualization

PROMPT REQUIREMENTS FOR EVERY IMAGE:
- Specify camera body and lens
- Specify aperture, ISO, and shutter speed
- Specify exact camera height or angle
- Specify time of day and lighting direction
- Specify composition strategy, foreground/midground/background, and framing
- Specify key materials, textures, and environmental details
- For interior-leaning shots, specify furniture, decor, artwork, rugs, textiles, styling objects, and lighting fixtures
- Describe mood, color palette, and level of realism
- Explicitly state: no text, no watermark, no logo

CONTENT RULES:
- Focus on architecture and real estate, not fashion or luxury lifestyle flexing
- At most 2 of the 8 images may include people, and only for scale or light lifestyle context
- Every gallery must include at least 2 interior or semi-interior frames
- Most images should be clean exterior shots, arrival shots, terrace shots, luxury living-room compositions, styled amenities, or contextual views
- If you include a tighter or more intimate frame, it must be a beautiful luxury vignette: styled living room corners, sculptural vases, paintings, rugs, stone coffee tables, fireplaces, shelving, dining setups, chandeliers, spa bathrooms, or poolside styling
- Avoid technical construction closeups like hinges, sealant joints, mullions, door knobs, facade fixings, or dry material-junction studies unless the topic explicitly demands it
- Vary the set across hero, arrival, context, dusk, mood, styled interior, and luxury vignette studies
- Keep the visuals photorealistic and commercially usable
- Avoid generic prompts and avoid repetitive shot structures
- Titles and descriptions must sound editorial and aspirational, not technical
- Avoid using words like "detail", "junction", "mullion", "hardware", or "close-up" in titles unless the topic explicitly requires it

OUTPUT RULES:
- Return strict JSON with one top-level key: "prompts"
- Return exactly 8 prompt objects
- Use at least 4 "cinema", at least 2 "portrait", and at least 2 "square" aspect ratios
- Each object must have:
  - filename: kebab-case
  - title: short human-readable title
  - aspectRatio: "cinema" | "portrait" | "square"
  - prompt: detailed image generation prompt, 140-260 words
  - altText: SEO-friendly alt text, 60-110 chars
  - description: visible caption, 100-180 chars`;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sanitizeFilename(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function readManifest(): Record<string, ManifestEntry> {
  if (!fs.existsSync(MANIFEST_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8")) as Record<
      string,
      ManifestEntry
    >;
  } catch {
    return {};
  }
}

function writeManifest(manifest: Record<string, ManifestEntry>) {
  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf-8");
}

function contentTypeFor(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".json":
      return "application/json";
    default:
      return "application/octet-stream";
  }
}

function buildPublicUrl(remotePath: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${remotePath}`;
}

async function uploadFileToSupabase(localPath: string, remotePath: string) {
  if (!supabase) {
    throw new Error("Missing Supabase credentials for auto-upload");
  }

  const buffer = fs.readFileSync(localPath);
  const { error } = await supabase.storage.from(SUPABASE_BUCKET).upload(remotePath, buffer, {
    contentType: contentTypeFor(localPath),
    upsert: true,
  });

  if (error) {
    throw new Error(error.message);
  }
}

async function generatePrompts(seed: IdeaTopicSeed): Promise<GeneratedPrompt[]> {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Create an 8-image gallery for this BrickEx idea page.

Topic:
- slug: ${seed.slug}
- title seed: ${seed.titleSeed}
- primary keyword: ${seed.primaryKeyword}
- supporting keywords: ${seed.supportingKeywords.join(", ")}
- audience: ${seed.searchAudience.join("; ")}
- creative angle: ${seed.angle}

The gallery should feel like a coherent search-intent pack that architecture students and real estate marketers would both find useful.

The image set should include a mix of:
- one strong hero exterior
- one arrival or approach view
- one context or elevated view
- one dusk or twilight shot
- one styled luxury interior or semi-interior living composition
- one beautiful luxury styling vignette based on decor, art, rugs, tables, lighting, or lounge styling
- one mood or weather study
- one terrace, courtyard, or amenities angle if relevant
- one additional commercially useful variation

Return strict JSON only.`,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 5000,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      if (attempt === maxAttempts) {
        throw new Error("Empty response from OpenAI");
      }
      console.log(`  [OpenAI] Empty prompt response, retrying (${attempt}/${maxAttempts})...`);
      continue;
    }

    const parsed = JSON.parse(content) as { prompts?: GeneratedPrompt[] };
    const prompts = parsed.prompts;

    if (!Array.isArray(prompts) || prompts.length !== IMAGES_PER_TOPIC) {
      if (attempt === maxAttempts) {
        throw new Error(
          `Expected ${IMAGES_PER_TOPIC} prompts, got ${prompts?.length ?? 0}`,
        );
      }
      console.log(
        `  [OpenAI] Invalid prompt payload, retrying (${attempt}/${maxAttempts})...`,
      );
      continue;
    }

    return prompts.map((prompt, index) => ({
      filename: sanitizeFilename(prompt.filename || `image-${index + 1}`),
      title: prompt.title?.trim() || `Render Idea ${index + 1}`,
      aspectRatio: prompt.aspectRatio,
      prompt: prompt.prompt?.trim(),
      altText: prompt.altText?.trim(),
      description: prompt.description?.trim(),
    }));
  }

  throw new Error("Unable to generate prompts");
}

async function generateImage(
  prompt: string,
  aspectRatio: AspectRatio,
): Promise<Buffer | null> {
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      const delay = 3000 * attempt;
      console.log(`    [Gemini] Retry ${attempt}/${maxRetries - 1} after ${delay}ms`);
      await sleep(delay);
    }

    try {
      const response = await genai.models.generateContent({
        model: MODEL,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseModalities: ["IMAGE", "TEXT"],
          imageConfig: {
            aspectRatio: GEMINI_ASPECT_RATIOS[aspectRatio],
            imageSize: "2K",
          },
        },
      });

      const candidate = response.candidates?.[0];
      const parts = candidate?.content?.parts;

      if (!parts) {
        continue;
      }

      for (const part of parts) {
        if ("inlineData" in part && part.inlineData?.data) {
          return Buffer.from(part.inlineData.data, "base64");
        }
      }
    } catch (error: any) {
      const message = error?.message || String(error);
      console.error(`    [Gemini] ${message.slice(0, 200)}`);

      if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) {
        console.log("    [Gemini] Rate limited, waiting 20s...");
        await sleep(20000);
      }
    }
  }

  return null;
}

async function processTopic(
  seed: IdeaTopicSeed,
  skipExisting: boolean,
  overwrite: boolean,
  autoUpload: boolean,
) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`${seed.titleSeed} (${seed.slug})`);
  console.log(`${"═".repeat(60)}`);

  const outputDir = path.join(OUTPUT_ROOT, seed.slug);
  fs.mkdirSync(outputDir, { recursive: true });

  const manifest = readManifest();
  const existingImages = manifest[seed.slug]?.images ?? [];

  if (overwrite) {
    if (fs.existsSync(outputDir)) {
      for (const file of fs.readdirSync(outputDir)) {
        fs.rmSync(path.join(outputDir, file), { force: true });
      }
    }
    delete manifest[seed.slug];
    writeManifest(manifest);
  }

  if (skipExisting && existingImages.length >= IMAGES_PER_TOPIC) {
    console.log(`  Skipping — manifest already has ${existingImages.length} images`);
    return;
  }

  console.log(`  [OpenAI] Generating prompts...`);
  const prompts = await generatePrompts(seed);
  const promptsPath = path.join(outputDir, "prompts.json");
  fs.writeFileSync(promptsPath, JSON.stringify(prompts, null, 2), "utf-8");
  if (autoUpload) {
    await uploadFileToSupabase(promptsPath, `${REMOTE_ROOT}/${seed.slug}/prompts.json`);
    console.log("  [Supabase] Uploaded prompts.json");
  }
  console.log(`  [OpenAI] Saved ${prompts.length} prompts`);

  const images: ManifestImage[] = [];

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    const fileBase = prompt.filename || `image-${i + 1}`;
    const fileName = `${fileBase}.png`;
    const localPath = path.join(outputDir, fileName);

    if (skipExisting && fs.existsSync(localPath)) {
      console.log(`  [${i + 1}/${prompts.length}] ${fileName} — exists, skipping`);
      const remotePath = `${REMOTE_ROOT}/${seed.slug}/${fileName}`;
      if (autoUpload) {
        await uploadFileToSupabase(localPath, remotePath);
      }
      images.push({
        id: `${seed.slug}:${fileBase}`,
        src: autoUpload
          ? buildPublicUrl(remotePath)
          : `/ideas-generated/${seed.slug}/${fileName}`,
        aspectRatio: prompt.aspectRatio,
        title: prompt.title,
        altText: prompt.altText,
        description: prompt.description,
        prompt: prompt.prompt,
        promptLabel: "Prompt recipe",
      });
      continue;
    }

    console.log(`  [${i + 1}/${prompts.length}] ${fileBase} (${prompt.aspectRatio})`);
    console.log(`    ${prompt.title}`);
    console.log(`    Prompt: ${prompt.prompt.slice(0, 140)}...`);

    const buffer = await generateImage(prompt.prompt, prompt.aspectRatio);
    if (!buffer) {
      console.log("    FAILED — no image returned");
      continue;
    }

    fs.writeFileSync(localPath, buffer);
    console.log(`    Saved ${fileName} (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`);
    const remotePath = `${REMOTE_ROOT}/${seed.slug}/${fileName}`;
    if (autoUpload) {
      await uploadFileToSupabase(localPath, remotePath);
      console.log("    [Supabase] Uploaded");
    }

    images.push({
      id: `${seed.slug}:${fileBase}`,
      src: autoUpload
        ? buildPublicUrl(remotePath)
        : `/ideas-generated/${seed.slug}/${fileName}`,
      aspectRatio: prompt.aspectRatio,
      title: prompt.title,
      altText: prompt.altText,
      description: prompt.description,
      prompt: prompt.prompt,
      promptLabel: "Prompt recipe",
    });

    const nextManifest = readManifest();
    nextManifest[seed.slug] = {
      slug: seed.slug,
      images: [...images],
    };
    writeManifest(nextManifest);

    if (i < prompts.length - 1) {
      await sleep(IMAGE_DELAY_MS);
    }
  }

  const nextManifest = readManifest();
  nextManifest[seed.slug] = {
    slug: seed.slug,
    images,
  };
  writeManifest(nextManifest);

  console.log(`  Done: ${images.length}/${prompts.length} images written`);
}

function parseIntArg(args: string[], flag: string): number | null {
  const index = args.indexOf(flag);
  if (index === -1 || index + 1 >= args.length) return null;
  const value = parseInt(args[index + 1], 10);
  return Number.isNaN(value) ? null : value;
}

async function main() {
  const args = process.argv.slice(2);
  const slugIndex = args.indexOf("--slug");
  const allFlag = args.includes("--all");
  const skipExisting = args.includes("--skip-existing");
  const overwrite = args.includes("--overwrite");
  const autoUpload = !args.includes("--no-upload");
  const batchSize = parseIntArg(args, "--batch") ?? 0;
  const offset = parseIntArg(args, "--offset") ?? 0;

  if (autoUpload && !supabase) {
    console.error("Missing Supabase credentials for auto-upload. Use --no-upload to skip.");
    process.exit(1);
  }

  if (!allFlag && slugIndex === -1) {
    console.log(`Usage:
  npx tsx scripts/generate-idea-galleries.ts --slug <idea-slug>
  npx tsx scripts/generate-idea-galleries.ts --all [--skip-existing]
  npx tsx scripts/generate-idea-galleries.ts --slug <idea-slug> --overwrite
  npx tsx scripts/generate-idea-galleries.ts --all --batch 2 [--offset 0] [--skip-existing]
  npx tsx scripts/generate-idea-galleries.ts --slug <idea-slug> --no-upload

Available slugs:
${ideaTopicSeeds.map((seed) => `  - ${seed.slug}`).join("\n")}`);
    process.exit(0);
  }

  let topics = [...ideaTopicSeeds];

  if (slugIndex !== -1) {
    const slug = args[slugIndex + 1];
    const seed = topics.find((topic) => topic.slug === slug);
    if (!seed) {
      console.error(`Unknown slug: ${slug}`);
      process.exit(1);
    }
    await processTopic(seed, skipExisting, overwrite, autoUpload);
    return;
  }

  if (offset > 0) {
    topics = topics.slice(offset);
  }

  if (batchSize > 0) {
    topics = topics.slice(0, batchSize);
  }

  console.log(`Generating ${topics.length} idea galleries...`);

  for (const seed of topics) {
    try {
      await processTopic(seed, skipExisting, overwrite, autoUpload);
    } catch (error: any) {
      console.error(`  Topic failed: ${seed.slug} — ${error?.message || error}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
