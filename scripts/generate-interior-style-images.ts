/**
 * Generate interior style preview images for the Interior Render dropdown.
 *
 * Flow:
 *   1. GPT-5-mini generates a luxurious interior room prompt for each style
 *   2. Gemini 3.1 Flash Image generates the image
 *   3. Images are saved locally and uploaded to Supabase bucket objects/styles/
 *
 * Run: npx tsx scripts/generate-interior-style-images.ts
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
const OUTPUT_DIR = path.join(process.cwd(), "public", "interior-styles");
const MAX_STYLE_EDGE = 800;

// Interior styles — "auto" excluded (uses Lucide icon in UI, no image needed)
const INTERIOR_STYLES: { value: string; label: string; file: string }[] = [
  { value: "scandinavian", label: "Scandinavian", file: "scandinavian-int.jpg" },
  { value: "modern", label: "Modern", file: "modern-int.jpg" },
  { value: "luxury", label: "Luxury", file: "luxury-int.jpg" },
  { value: "minimal", label: "Minimal", file: "minimal-int.jpg" },
  { value: "industrial", label: "Industrial", file: "industrial-int.jpg" },
  { value: "bohemian", label: "Bohemian", file: "bohemian-int.jpg" },
  { value: "japandi", label: "Japandi", file: "japandi-int.jpg" },
  { value: "mid-century", label: "Mid-Century", file: "mid-century-int.jpg" },
  { value: "art-deco", label: "Art Deco", file: "art-deco-int.jpg" },
  { value: "coastal", label: "Coastal", file: "coastal-int.jpg" },
  { value: "rustic", label: "Rustic", file: "rustic-int.jpg" },
];

const STYLE_BRIEFS: Record<string, string> = {
  scandinavian:
    "Scandinavian living room. Light oak floors, white walls, sheepskin throws, muted pastels. Hay and Muuto furniture. Hygge warmth, candles, knit textures. Clean but cozy — AD Nordic edition.",
  modern:
    "Modern luxury living room. Clean geometric lines, monochromatic palette with warm accents. Polished concrete or dark hardwood floors, floor-to-ceiling glass, sculptural furniture. B&B Italia or Minotti sofa. Statement lighting. Feels like a penthouse in a Richard Meier building.",
  luxury:
    "Ultra-luxury living room in a $50M penthouse. Marble floors, gold accents, velvet upholstery, crystal chandelier. Fendi Casa or Versace Home furniture. Double-height ceilings, panoramic city views at golden hour. Opulent but tasteful — like the cover of Robb Report.",
  minimal:
    "Minimal living room. White plaster walls, seamless built-ins, one statement sofa in warm linen. Negative space is the design. John Pawson meets Axel Vervoordt. Single sculptural ceramic, nothing else. Serene, monastic calm. Light flooding through sheer curtains.",
  industrial:
    "Industrial loft living room. Exposed brick walls, steel beams, polished concrete floor. Worn leather Chesterfield, vintage factory lighting, raw metal shelving. Warm Edison bulbs. Persian rug grounding the space. Feels like a converted SoHo warehouse — editorial, lived-in, character.",
  bohemian:
    "Bohemian living room. Layered textiles — kilim rugs, macramé wall hangings, embroidered cushions. Rattan peacock chair, low wooden coffee table covered in books and candles. Hanging plants everywhere. Warm terracotta and jewel tones. Sunset light through arched windows. Free-spirited, maximalist, curated chaos.",
  japandi:
    "Japandi living room. Japanese wabi-sabi meets Scandinavian minimalism. Low-profile oak furniture, shōji screen in background, tatami-inspired rug, matte ceramic vessels. Neutral palette — warm whites, charcoal, natural wood. Ikebana branch in a handmade vase. Contemplative, serene, perfectly balanced.",
  "mid-century":
    "Mid-Century Modern living room. Iconic Eames lounge chair, Noguchi coffee table, walnut credenza with sunburst clock. Mustard, teal, and burnt orange accents. Tapered legs on everything. Terrazzo planter with fiddle leaf fig. Warm wood tones, brass arc lamp. 1960s Palm Springs meets Architectural Digest.",
  "art-deco":
    "Art Deco living room. Geometric patterns, velvet in emerald and navy, brass and gold everywhere. Lacquered surfaces, mirrored furniture, fan-shaped motifs. Chevron marble floor. Statement chandelier with crystal drops. Feels like The Great Gatsby's living room — glamorous, theatrical, maximal elegance.",
  coastal:
    "Coastal luxury living room. White shiplap walls, light oak floors, ocean view through floor-to-ceiling windows. Slipcovered linen sofa, driftwood coffee table, woven rattan accents. Palette: crisp whites, soft blues, warm sand. Potted palm, brass nautical lamp. Feels like a Malibu beach house — relaxed but expensive.",
  rustic:
    "Rustic luxury living room. Exposed timber beams, stone fireplace as the centerpiece. Reclaimed wood floors, oversized leather armchairs, chunky knit throws. Antler chandelier, stacked firewood, vintage brass accessories. Warm amber lighting. Feels like an Aspen mountain lodge — rugged elegance, warm and enveloping.",
};

const PROMPT_SYSTEM = `You are a world-class interior photographer and set designer who has shot covers for Architectural Digest, Elle Decor, Wallpaper*, and Dwell. You have an extraordinary eye for luxury, materiality, and light.

Generate an image generation prompt for an INCREDIBLY LUXURIOUS, ASPIRATIONAL interior photograph. This is for a thumbnail that needs to look STUNNING even at small sizes — so the style must be IMMEDIATELY RECOGNIZABLE at a glance.

Requirements:
- Camera: Phase One IQ4 or Canon EOS R5 with 24mm tilt-shift, f/5.6, ISO 100, tripod. Perfect verticals.
- Perspective: eye-level, slightly off-center, showing depth. Like you're standing in the room.
- Lighting: GOLDEN HOUR. Warm natural light flooding through windows, creating beautiful highlights and soft shadows. Complemented by warm ambient interior lighting.
- Quality: Photorealistic, 8K, magazine cover quality. Rich textures, visible material quality.
- The image must look EXPENSIVE. Every material should feel tactile — you should want to touch the surfaces.
- Mood: aspirational, warm, inviting. Like you want to live there.
- Color: rich, warm tones. No flat or washed-out colors.

CRITICAL for small thumbnail readability:
- ONE clear hero composition with strong contrast
- Bold, recognizable style markers (don't be subtle — the style must be obvious)
- Rich colors and strong value contrast
- Clean framing with a clear focal point

Output ONLY the prompt text. No explanations, no headers. 200-350 words. Make it specific — name exact furniture pieces, materials, textures, colors.`;

async function generatePromptForStyle(style: { value: string; label: string }): Promise<string> {
  const brief = STYLE_BRIEFS[style.value] ?? `${style.label} interior design living room.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: PROMPT_SYSTEM },
      {
        role: "user",
        content: `Generate an interior photography prompt for this style:\n\n${brief}\n\nMake it look like a $10M home. Golden hour light. The style must be INSTANTLY recognizable even as a small thumbnail. Rich, warm, luxurious.`,
      },
    ],
    max_completion_tokens: 2048,
  });

  const prompt = response.choices[0]?.message?.content?.trim();
  if (!prompt || prompt.length < 100) {
    return `${brief} Golden hour light, eye-level perspective. Phase One IQ4, 24mm tilt-shift, f/5.6, ISO 100. Ultra-luxurious, photorealistic, 8K, Architectural Digest cover quality. Rich warm tones, stunning materials, immediately recognizable ${style.label} style.`;
  }
  return prompt;
}

async function generateImage(prompt: string): Promise<Buffer | null> {
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
  console.log("=== Interior Style Image Generator ===\n");
  console.log("Flow: GPT-5-mini (prompt per style) → Gemini 3.1 Flash (image) → local + Supabase objects/styles/\n");

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
    console.log("[GPT] Generating luxurious prompts for each interior style...\n");
    prompts = [];
    const batchSize = 4;
    for (let i = 0; i < INTERIOR_STYLES.length; i += batchSize) {
      const batch = INTERIOR_STYLES.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(async (style, idx) => {
          const globalIdx = i + idx;
          console.log(`[GPT] ${globalIdx + 1}/${INTERIOR_STYLES.length}: ${style.label}`);
          return generatePromptForStyle(style);
        })
      );
      prompts.push(...results);
      if (i + batchSize < INTERIOR_STYLES.length) {
        await new Promise((r) => setTimeout(r, 400));
      }
    }
    fs.writeFileSync(
      promptsPath,
      JSON.stringify(
        INTERIOR_STYLES.map((s, i) => ({ value: s.value, label: s.label, file: s.file, prompt: prompts[i] })),
        null,
        2
      )
    );
    console.log(`\n[Saved] ${promptsPath}\n`);
  }

  console.log("=== Generating images with Gemini 3.1 Flash ===\n");

  let generated = 0;
  for (let i = 0; i < INTERIOR_STYLES.length; i++) {
    const style = INTERIOR_STYLES[i];
    const localName = `${style.value}.jpg`;
    const localPath = path.join(OUTPUT_DIR, localName);

    if (fs.existsSync(localPath)) {
      console.log(`[Skip] ${localName} (already exists)`);
      generated++;
      continue;
    }

    console.log(`[${i + 1}/${INTERIOR_STYLES.length}] ${style.label} (${style.value})`);
    console.log(`  [Prompt] ${(prompts[i] ?? "").slice(0, 120)}...`);

    const buf = await generateImage(prompts[i] ?? "");

    if (buf) {
      await sharp(buf).jpeg({ quality: 90, mozjpeg: true }).toFile(localPath);
      console.log(`  [Saved] ${localPath} (${(buf.length / 1024).toFixed(0)}KB)`);
      generated++;
    } else {
      console.error(`  [FAILED] ${localName}`);
    }

    if (i < INTERIOR_STYLES.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log(`\n=== Generated ${generated}/${INTERIOR_STYLES.length} images ===`);
  console.log(`Local: ${OUTPUT_DIR}\n`);

  if (SUPABASE_URL && SUPABASE_KEY) {
    console.log("=== Uploading to Supabase objects/styles/ ===\n");
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    let uploaded = 0;
    for (const style of INTERIOR_STYLES) {
      const localName = `${style.value}.jpg`;
      const localPath = path.join(OUTPUT_DIR, localName);
      if (!fs.existsSync(localPath)) {
        console.log(`  [Skip upload] ${localName} (not generated)`);
        continue;
      }
      if (await uploadToSupabase(supabase, localPath, style.file)) uploaded++;
    }
    console.log(`\nUploaded ${uploaded}/${INTERIOR_STYLES.length} to ${BUCKET}/${REMOTE_PREFIX}/`);
  } else {
    console.log("Skipping upload: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to upload to bucket.");
  }

  console.log("\nDone.");
}

main().catch(console.error);
