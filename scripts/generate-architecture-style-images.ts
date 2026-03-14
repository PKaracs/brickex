/**
 * Generate architecture style preview images for the Exterior Render dropdown.
 *
 * Flow:
 *   1. GPT generates a front-facing, beautiful building prompt for each style
 *   2. Gemini 3.1 Flash Image generates the image
 *   3. Images are saved locally and uploaded to Supabase bucket objects/styles/
 *
 * Run: npx tsx scripts/generate-architecture-style-images.ts
 * Env: GOOGLE_GENAI_API_KEY, OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";

const GOOGLE_API_KEY = process.env.GOOGLE_GENAI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!GOOGLE_API_KEY || !OPENAI_API_KEY) {
  console.error("Missing GOOGLE_GENAI_API_KEY or OPENAI_API_KEY in .env");
  process.exit(1);
}

const genai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const MODEL = "gemini-3.1-flash-image-preview";
const BUCKET = "objects";
const REMOTE_PREFIX = "styles";
const OUTPUT_DIR = path.join(process.cwd(), "public", "architecture-styles");
const MAX_STYLE_EDGE = 800; // max width/height for dropdown thumbnails

// Architecture styles from lib/constants/render-modes.ts (Exterior → Architecture Style)
const ARCHITECTURE_STYLES: { value: string; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "modern", label: "Modern" },
  { value: "mediterranean", label: "Mediterranean" },
  { value: "minimal", label: "Minimal" },
  { value: "luxury", label: "Luxury" },
  { value: "brutalist", label: "Brutalist" },
  { value: "art-deco", label: "Art Deco" },
  { value: "industrial", label: "Industrial" },
  { value: "tropical", label: "Tropical" },
  { value: "japanese", label: "Japanese" },
  { value: "scandinavian", label: "Scandinavian" },
  { value: "colonial", label: "Colonial" },
  { value: "parametric", label: "Parametric" },
  { value: "neo-classical", label: "Neo-Classical" },
  { value: "farmhouse", label: "Farmhouse" },
  { value: "contemporary", label: "Contemporary" },
];

const PROMPT_SYSTEM = `You are a world-class architectural photographer who has shot covers for Architectural Digest, Wallpaper*, and Dwell.

Generate an image generation prompt for a FRONT-FACING exterior photograph of a single building. The camera must be positioned DIRECTLY IN FRONT of the building, looking STRAIGHT AT THE FACADE — perfectly centered, symmetrical composition.

CRITICAL: The building must be photographed HEAD-ON from the front. Not from the side, not at a 3/4 angle. DEAD CENTER, STRAIGHT ON, like a formal architectural portrait of the facade.

Include:
- Camera: e.g. Phase One XF IQ4 or Canon EOS R5 with tilt-shift lens (e.g. Canon TS-E 24mm f/3.5L II), f/8–f/11, ISO 100, tripod.
- Position: center axis of the building, level, tilt-shift correction, verticals perfectly straight.
- Lighting: golden hour or soft overcast, front of facade well lit, warm tones.
- Composition: building centered, symmetrical, entrance as focal point, clear sky or subtle clouds.

Output ONLY the prompt text, no explanations. Under 350 words.`;

async function generatePromptForStyle(style: { value: string; label: string }): Promise<string> {
  const styleBrief =
    style.value === "auto"
      ? "a beautiful, timeless residential building facade that could suit any style — balanced, elegant, not strongly tied to one movement. Classic proportions, clean lines, high-end materials."
      : `a beautiful residential or small commercial building in ${style.label} architecture style. The building must be a clear, iconic example of ${style.label} design — materials, proportions, and details that are unmistakably ${style.label}.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: PROMPT_SYSTEM },
      {
        role: "user",
        content: `Generate a front-facing architectural photography prompt for:\n\n${styleBrief}\n\nGolden hour or soft daylight. Camera directly in front, straight at the facade. Symmetrical, centered. Magazine-quality, photorealistic.`,
      },
    ],
    max_completion_tokens: 1024,
  });

  const prompt = response.choices[0]?.message?.content?.trim();
  if (!prompt || prompt.length < 80) {
    return `${styleBrief}. FRONT-FACING VIEW — camera on center axis, straight at facade. Symmetrical, centered. Canon EOS R5, TS-E 24mm tilt-shift, f/8, ISO 100. Golden hour. Photorealistic architectural photography.`;
  }
  return prompt;
}

async function generateImage(prompt: string, index: number): Promise<Buffer | null> {
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      const delay = 2000 * attempt;
      console.log(`  [Gemini] Retry ${attempt}/${maxRetries} after ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }

    try {
      const response = await genai.models.generateContent({
        model: MODEL,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseModalities: ["IMAGE", "TEXT"],
          imageConfig: { aspectRatio: "1:1", imageSize: "2K" },
        },
      });

      if (!response.candidates?.length) {
        console.warn(`  [Gemini] No candidates`);
        continue;
      }

      const candidate = response.candidates[0];
      if (candidate.content?.parts) {
        for (const part of candidate.content.parts) {
          if ("inlineData" in part && part.inlineData?.data) {
            return Buffer.from(part.inlineData.data, "base64");
          }
        }
      }

      console.warn(`  [Gemini] No image data in response`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`  [Gemini] Error (attempt ${attempt + 1}):`, msg);
      if (typeof (error as { status?: number })?.status === "number" && (error as { status: number }).status === 429) {
        console.log(`  [Gemini] Rate limited, waiting 15s...`);
        await new Promise((r) => setTimeout(r, 15000));
      }
    }
  }
  return null;
}

async function uploadToSupabase(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  localPath: string,
  remoteFileName: string
): Promise<boolean> {
  const raw = await fs.promises.readFile(localPath);
  const resized = await sharp(raw)
    .resize(MAX_STYLE_EDGE, MAX_STYLE_EDGE, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();

  const remotePath = `${REMOTE_PREFIX}/${remoteFileName}`;

  const { error } = await supabase.storage.from(BUCKET).upload(remotePath, resized, {
    contentType: "image/jpeg",
    upsert: true,
  });

  if (error) {
    console.error(`  [Upload] Failed:`, error.message);
    return false;
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(remotePath);
  console.log(`  [Upload] ${remotePath} (${(resized.byteLength / 1024).toFixed(0)}KB) → ${data.publicUrl}`);
  return true;
}

async function main() {
  console.log("=== Architecture Style Image Generator ===\n");
  console.log("Flow: GPT (prompt per style) → Gemini 3.1 (image) → local + Supabase objects/styles/\n");

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created: ${OUTPUT_DIR}\n`);
  }

  const promptsPath = path.join(OUTPUT_DIR, "prompts.json");
  let prompts: string[];

  if (fs.existsSync(promptsPath)) {
    const data = JSON.parse(fs.readFileSync(promptsPath, "utf-8")) as { prompt: string }[];
    prompts = data.map((d) => d.prompt);
    console.log(`Loaded ${prompts.length} prompts from prompts.json\n`);
  } else {
    console.log("[GPT] Generating prompts for each architecture style...\n");
    prompts = [];
    const batchSize = 4;
    for (let i = 0; i < ARCHITECTURE_STYLES.length; i += batchSize) {
      const batch = ARCHITECTURE_STYLES.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(async (style, idx) => {
          const globalIdx = i + idx;
          console.log(`[GPT] ${globalIdx + 1}/${ARCHITECTURE_STYLES.length}: ${style.label}`);
          return generatePromptForStyle(style);
        })
      );
      prompts.push(...results);
      if (i + batchSize < ARCHITECTURE_STYLES.length) {
        await new Promise((r) => setTimeout(r, 400));
      }
    }
    fs.writeFileSync(
      promptsPath,
      JSON.stringify(
        ARCHITECTURE_STYLES.map((s, i) => ({ value: s.value, label: s.label, prompt: prompts[i] })),
        null,
        2
      )
    );
    console.log(`\n[Saved] ${promptsPath}\n`);
  }

  console.log("=== Generating images with Gemini 3.1 Flash ===\n");

  let generated = 0;
  for (let i = 0; i < ARCHITECTURE_STYLES.length; i++) {
    const style = ARCHITECTURE_STYLES[i];
    const fileName = `${style.value}.jpg`;
    const localPath = path.join(OUTPUT_DIR, fileName);

    if (fs.existsSync(localPath)) {
      console.log(`[Skip] ${fileName} (already exists)`);
      generated++;
      continue;
    }

    console.log(`[${i + 1}/${ARCHITECTURE_STYLES.length}] ${style.label} (${style.value})`);
    console.log(`  [Prompt] ${(prompts[i] ?? "").slice(0, 100)}...`);

    const buf = await generateImage(prompts[i] ?? "", i);

    if (buf) {
      await sharp(buf).jpeg({ quality: 90, mozjpeg: true }).toFile(localPath);
      console.log(`  [Saved] ${localPath} (${(buf.length / 1024).toFixed(0)}KB)`);
      generated++;
    } else {
      console.error(`  [FAILED] ${fileName}`);
    }

    if (i < ARCHITECTURE_STYLES.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log(`\n=== Generated ${generated}/${ARCHITECTURE_STYLES.length} images ===`);
  console.log(`Local: ${OUTPUT_DIR}\n`);

  if (SUPABASE_URL && SUPABASE_KEY) {
    console.log("=== Uploading to Supabase objects/styles/ ===\n");
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const files = (await fs.promises.readdir(OUTPUT_DIR)).filter((f) => f.endsWith(".jpg"));
    let uploaded = 0;
    for (const file of files) {
      const localPath = path.join(OUTPUT_DIR, file);
      if (await uploadToSupabase(supabase, localPath, file)) uploaded++;
    }
    console.log(`\nUploaded ${uploaded}/${files.length} to ${BUCKET}/${REMOTE_PREFIX}/`);
  } else {
    console.log("Skipping upload: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to upload to bucket.");
  }

  console.log("\nDone.");
}

main().catch(console.error);
