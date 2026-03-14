/**
 * Generate input/output preview images for each tool card.
 *
 * Flow:
 *   1. GPT generates paired prompts (input + output) for each tool
 *   2. Gemini 3.1 Flash Image generates images
 *   3. Upload to Supabase public-assets/tools/
 *
 * Run: npx tsx scripts/generate-tool-previews.ts
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
const BUCKET = "public-assets";
const REMOTE_PREFIX = "tools";
const OUTPUT_DIR = path.join(process.cwd(), "public", "tool-previews");
const MAX_EDGE = 1200;

interface ToolSpec {
  id: string;
  label: string;
  inputBrief: string;
  outputBrief: string;
}

const TOOLS_TO_GENERATE: ToolSpec[] = [
  {
    id: "floorplan-to-furnished",
    label: "Empty Floorplan to Furnished",
    inputBrief:
      "A clean, professional 2D architectural floor plan of a modern 2-bedroom apartment. Black lines on white background, CAD-style, showing walls, doors, windows, room labels. Empty rooms with no furniture. Technical drawing style.",
    outputBrief:
      "The same 2-bedroom apartment floor plan, now populated with furniture drawn in CAD architectural style — beds, sofas, dining table, kitchen cabinets, bathroom fixtures. Top-down view, architectural drawing style with furniture symbols and layouts. Clean lines, professional interior design floor plan.",
  },
  {
    id: "upholstery-change",
    label: "Upholstery Change",
    inputBrief:
      "A beautiful modern living room interior photograph showing a large L-shaped sofa with plain grey fabric upholstery. Minimalist Scandinavian interior, wooden floor, soft natural light from large windows. Professional interior photography, photorealistic.",
    outputBrief:
      "The exact same modern living room interior photograph, identical composition and angle, but the L-shaped sofa now has rich emerald green velvet upholstery instead of grey. Everything else in the room remains identical — same wooden floor, same windows, same lighting. Only the sofa fabric changed.",
  },
  {
    id: "render-to-isometric",
    label: "Render to Isometric Diagram",
    inputBrief:
      "A photorealistic 3D render of a modern mixed-use commercial building — glass facade, multiple floors, ground-floor retail, rooftop terrace. Shot from a slight elevated angle, dramatic golden hour lighting. Architectural visualization quality.",
    outputBrief:
      "An isometric technical diagram of the same modern mixed-use commercial building. Clean vector-style illustration, isometric 30-degree projection, with labeled annotations pointing to key features (glass facade, retail level, rooftop terrace). Navy blue and warm beige color palette, architectural diagram style with clean lines and flat shading.",
  },
  {
    id: "floorplan-to-3d",
    label: "Floorplan to 3D Diagram",
    inputBrief:
      "A clean 2D architectural floor plan of a modern open-plan office space. Black lines on white background, CAD style, showing walls, columns, meeting rooms, open desk areas, kitchen, reception. Technical architectural drawing.",
    outputBrief:
      "A 3D axonometric cutaway diagram of the same open-plan office space, viewed from above at a 45-degree angle. Walls shown at half-height to reveal interior layout — desks, meeting rooms with glass partitions, kitchen area. Soft colors, architectural model style with subtle shadows. Clean, professional 3D spatial diagram.",
  },
  {
    id: "landscape-generator",
    label: "Landscape Generator",
    inputBrief:
      "A rough hand-drawn pencil sketch of a residential backyard landscape design on white paper. Shows a patio area, winding garden path, tree outlines, a small pond shape, and flower bed borders. Sketchy, loose architectural drawing style with annotations.",
    outputBrief:
      "A photorealistic aerial view of the same residential backyard landscape — now fully realized with a stone patio, winding flagstone path through lush green garden beds, mature trees, a small reflective koi pond, and colorful flowering borders. Golden hour sunlight, professional landscape photography quality. The layout matches the sketch exactly.",
  },
];

const PROMPT_SYSTEM = `You are a world-class image prompt engineer specializing in architectural and interior design visualization.

Your task: Generate a detailed image generation prompt based on a brief. The prompt must produce a photorealistic, professional-quality image.

Include specific details about:
- Camera/lens specs where appropriate (e.g. Canon EOS R5, 24mm tilt-shift, f/8)
- Lighting conditions (golden hour, soft daylight, studio)
- Composition (centered, symmetrical, aerial, etc.)
- Materials, textures, and colors
- Style and mood

Output ONLY the prompt text, no explanations. Under 300 words.`;

async function refinePromptWithGPT(brief: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: PROMPT_SYSTEM },
      {
        role: "user",
        content: `Generate a detailed image generation prompt based on this brief:\n\n${brief}\n\nThe image should be high quality, photorealistic where appropriate, and look like it belongs on a professional SaaS product page.`,
      },
    ],
    max_completion_tokens: 1024,
  });

  const prompt = response.choices[0]?.message?.content?.trim();
  if (!prompt || prompt.length < 50) {
    return brief;
  }
  return prompt;
}

async function generateImage(prompt: string): Promise<Buffer | null> {
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      const delay = 3000 * attempt;
      console.log(`  [Gemini] Retry ${attempt}/${maxRetries} after ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }

    try {
      const response = await genai.models.generateContent({
        model: MODEL,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseModalities: ["IMAGE", "TEXT"],
          imageConfig: { aspectRatio: "5:3", imageSize: "2K" },
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
      if (
        typeof (error as { status?: number })?.status === "number" &&
        (error as { status: number }).status === 429
      ) {
        console.log(`  [Gemini] Rate limited, waiting 15s...`);
        await new Promise((r) => setTimeout(r, 15000));
      }
    }
  }
  return null;
}

async function uploadToSupabase(
  supabase: ReturnType<typeof createClient>,
  localPath: string,
  remoteFileName: string
): Promise<string | null> {
  const raw = await fs.promises.readFile(localPath);
  const resized = await sharp(raw)
    .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
    .png({ quality: 90 })
    .toBuffer();

  const remotePath = `${REMOTE_PREFIX}/${remoteFileName}`;

  const { error } = await supabase.storage.from(BUCKET).upload(remotePath, resized, {
    contentType: "image/png",
    upsert: true,
  });

  if (error) {
    console.error(`  [Upload] Failed:`, error.message);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(remotePath);
  console.log(
    `  [Upload] ${remotePath} (${(resized.byteLength / 1024).toFixed(0)}KB) → ${data.publicUrl}`
  );
  return data.publicUrl;
}

async function main() {
  console.log("=== Tool Preview Image Generator ===\n");
  console.log(
    "Flow: GPT (refine prompts) → Gemini 3.1 (generate images) → Supabase public-assets/tools/\n"
  );

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created: ${OUTPUT_DIR}\n`);
  }

  const promptsPath = path.join(OUTPUT_DIR, "prompts.json");
  let refinedPrompts: Record<string, { input: string; output: string }>;

  if (fs.existsSync(promptsPath)) {
    refinedPrompts = JSON.parse(fs.readFileSync(promptsPath, "utf-8"));
    console.log(`Loaded cached prompts from prompts.json\n`);
  } else {
    console.log("[GPT] Refining prompts for each tool...\n");
    refinedPrompts = {};

    for (const tool of TOOLS_TO_GENERATE) {
      console.log(`[GPT] ${tool.label} — input prompt...`);
      const inputPrompt = await refinePromptWithGPT(tool.inputBrief);
      console.log(`[GPT] ${tool.label} — output prompt...`);
      const outputPrompt = await refinePromptWithGPT(tool.outputBrief);
      refinedPrompts[tool.id] = { input: inputPrompt, output: outputPrompt };
      await new Promise((r) => setTimeout(r, 300));
    }

    fs.writeFileSync(promptsPath, JSON.stringify(refinedPrompts, null, 2));
    console.log(`\n[Saved] ${promptsPath}\n`);
  }

  console.log("=== Generating images with Gemini 3.1 Flash ===\n");

  const results: Record<string, { inputUrl?: string; outputUrl?: string }> = {};
  let generated = 0;
  const total = TOOLS_TO_GENERATE.length * 2;

  for (const tool of TOOLS_TO_GENERATE) {
    const prompts = refinedPrompts[tool.id];
    if (!prompts) {
      console.error(`[Skip] No prompts for ${tool.id}`);
      continue;
    }

    results[tool.id] = {};

    for (const kind of ["input", "output"] as const) {
      const fileName = `${tool.id}-${kind}.png`;
      const localPath = path.join(OUTPUT_DIR, fileName);

      if (fs.existsSync(localPath)) {
        console.log(`[Skip] ${fileName} (already exists)`);
        generated++;
        continue;
      }

      console.log(`[${generated + 1}/${total}] ${tool.label} — ${kind}`);
      console.log(`  [Prompt] ${prompts[kind].slice(0, 120)}...`);

      const buf = await generateImage(prompts[kind]);

      if (buf) {
        await sharp(buf).png({ quality: 90 }).toFile(localPath);
        console.log(`  [Saved] ${fileName} (${(buf.length / 1024).toFixed(0)}KB)`);
        generated++;
      } else {
        console.error(`  [FAILED] ${fileName}`);
      }

      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  console.log(`\n=== Generated ${generated}/${total} images ===\n`);

  if (SUPABASE_URL && SUPABASE_KEY) {
    console.log("=== Uploading to Supabase public-assets/tools/ ===\n");
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    for (const tool of TOOLS_TO_GENERATE) {
      for (const kind of ["input", "output"] as const) {
        const fileName = `${tool.id}-${kind}.png`;
        const localPath = path.join(OUTPUT_DIR, fileName);

        if (!fs.existsSync(localPath)) {
          console.log(`[Skip upload] ${fileName} (not generated)`);
          continue;
        }

        const url = await uploadToSupabase(supabase, localPath, fileName);
        if (url) {
          if (!results[tool.id]) results[tool.id] = {};
          if (kind === "input") results[tool.id].inputUrl = url;
          else results[tool.id].outputUrl = url;
        }
      }
    }

    console.log("\n=== Upload URLs for tools.ts ===\n");
    for (const tool of TOOLS_TO_GENERATE) {
      const r = results[tool.id];
      if (r?.inputUrl || r?.outputUrl) {
        console.log(`  // ${tool.label}`);
        if (r.inputUrl) console.log(`  inputPreview: "${r.inputUrl}",`);
        if (r.outputUrl) console.log(`  outputPreview: "${r.outputUrl}",`);
        console.log();
      }
    }
  }

  console.log("Done.");
}

main().catch(console.error);
