import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";

const GOOGLE_API_KEY = process.env.GOOGLE_GENAI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!GOOGLE_API_KEY || !OPENAI_API_KEY) {
  console.error("Missing GOOGLE_GENAI_API_KEY or OPENAI_API_KEY in env");
  process.exit(1);
}

const genai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const MODEL = "gemini-3.1-flash-image-preview";
const OUTPUT_DIR = path.join(process.cwd(), "public", "real-estate-front");

const PROPERTIES = [
  {
    name: "modern-white-villa",
    desc: "Modern white minimalist villa, two stories, large glass windows, flat roof with subtle overhang, symmetrical facade, manicured front lawn, infinity pool visible at ground level, Mediterranean climate landscaping",
  },
  {
    name: "beach-house-timber",
    desc: "Elevated contemporary beach house on stilts, weathered timber cladding, wrap-around porch, large sliding glass doors open to reveal interior, sand dunes and ocean behind, coastal grasses in foreground",
  },
  {
    name: "luxury-mobile-home",
    desc: "Ultra-luxury modern mobile home / prefab, sleek rectangular form, dark metal and wood paneling, floor-to-ceiling glass front wall, elevated on a platform deck, desert mesa landscape, Joshua trees",
  },
  {
    name: "glass-skyscraper-penthouse",
    desc: "Modern glass residential skyscraper, 40+ floors, shot from ground level looking up at the facade, reflective curtain wall glass, balconies with greenery, evening sky reflected in the glass",
  },
  {
    name: "tuscan-stone-farmhouse",
    desc: "Restored Tuscan stone farmhouse, honey-colored facade, green wooden shutters, terracotta roof, arched doorway in the center, potted olive trees flanking the entrance, gravel courtyard in foreground, cypress trees behind",
  },
  {
    name: "alpine-chalet-front",
    desc: "Traditional alpine chalet with modern renovation, dark stained timber, stone base, large triangular balcony with glass railing, snow-capped mountain peaks behind, wildflower meadow in foreground",
  },
  {
    name: "tropical-villa-pool",
    desc: "Balinese-modern tropical villa, open-air pavilion design, thatched roof meets clean concrete, rectangular reflecting pool perfectly centered in front of the entrance, frangipani trees, lush tropical garden",
  },
  {
    name: "brownstone-townhouse",
    desc: "Classic New York brownstone townhouse row, ornate cornices, stoop with wrought-iron railings, bay windows, autumn trees lining the street, warm interior light glowing through windows",
  },
  {
    name: "concrete-brutalist-house",
    desc: "Bold brutalist concrete residence, dramatic cantilevered upper floor, board-formed concrete texture, narrow vertical windows, geometric facade, reflecting pool in front mirroring the structure, minimalist landscaping",
  },
  {
    name: "spanish-colonial-mansion",
    desc: "Grand Spanish colonial mansion, symmetrical white stucco facade, red clay tile roof, arched colonnade entrance with carved stone pillars, large wooden double doors, courtyard fountain visible, bougainvillea climbing walls",
  },
];

const PROMPT_SYSTEM = `You are a world-class architectural photographer who has shot covers for Architectural Digest, Wallpaper*, and Dwell.

Generate an image generation prompt for a FRONT-FACING exterior photograph of a property. The camera must be positioned DIRECTLY IN FRONT of the building, looking STRAIGHT AT THE FACADE — perfectly centered, symmetrical composition.

THIS IS THE MOST IMPORTANT RULE: The building must be photographed HEAD-ON from the front. Not from the side, not at a 3/4 angle, not from a corner. DEAD CENTER, STRAIGHT ON, like a formal architectural portrait of the facade.

YOU MUST SPECIFY ALL OF THE FOLLOWING:

CAMERA & LENS:
- Exact camera body (Phase One XF IQ4 150MP, Hasselblad X2D 100C, Sony A7R V, Canon EOS R5)
- Exact lens — use a TILT-SHIFT lens for corrected verticals (Canon TS-E 24mm f/3.5L II, Nikon PC-E 24mm f/3.5D, Canon TS-E 17mm f/4L) OR a wide-angle prime (Sony FE 24mm f/1.4 GM, Sigma 20mm f/1.4 Art)
- The tilt-shift is critical for keeping vertical lines perfectly straight

CAMERA SETTINGS:
- f/8 to f/11 for maximum sharpness across the entire facade
- ISO 100 for cleanest quality
- Tripod-mounted, cable release

CAMERA POSITION — CRITICAL:
- Camera positioned on the center axis of the building
- Perfectly level, no Dutch angle
- Tilt-shift correction applied for zero perspective distortion
- Straight-on, symmetrical framing — the building should be mirror-balanced in frame
- Eye level or slightly below (1.2-1.5m height) for a natural but grand perspective

LIGHTING:
- Golden hour warm light hitting the front facade
- Sun position should illuminate the FRONT of the building (not backlighting)
- Warm tones on the facade materials
- Soft fill from the sky, no harsh shadows

COMPOSITION:
- Building perfectly centered in frame
- Symmetrical balance
- Foreground element (path, lawn, pool, courtyard) leading to the entrance
- The entrance/front door should be the focal point
- Clear sky or subtle clouds behind

Keep under 400 words. Output ONLY the prompt text, no explanations.`;

async function generatePrompts(): Promise<string[]> {
  console.log("[GPT] Generating 10 front-facing architectural prompts...\n");
  const prompts: string[] = [];

  const batchSize = 5;
  for (let i = 0; i < PROPERTIES.length; i += batchSize) {
    const batch = PROPERTIES.slice(i, i + batchSize);
    const batchPromises = batch.map(async (prop, idx) => {
      const globalIdx = i + idx;
      console.log(`[GPT] Generating prompt ${globalIdx + 1}/10: ${prop.name}`);

      const response = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: [
          { role: "system", content: PROMPT_SYSTEM },
          {
            role: "user",
            content: `Generate a front-facing architectural photography prompt for:\n\n${prop.desc}\n\nGolden hour daylight. The camera MUST be positioned directly in front, looking straight at the facade. Symmetrical, centered composition. This should look like the hero image on a luxury property listing.`,
          },
        ],
        max_completion_tokens: 16000,
      });

      const prompt = response.choices[0]?.message?.content?.trim();
      console.log(`[GPT] Response ${globalIdx + 1}: ${prompt?.length ?? 0} chars`);

      if (!prompt || prompt.length < 100) {
        return `${prop.desc}. FRONT-FACING VIEW — camera positioned directly in front of the building on the center axis, looking straight at the facade. Perfectly symmetrical, centered composition. Shot on Canon EOS R5 with Canon TS-E 24mm f/3.5L II tilt-shift lens, f/8, ISO 100, tripod-mounted. Tilt-shift correction for zero perspective distortion, all verticals perfectly straight. Golden hour warm light illuminating the front facade. Photorealistic, magazine-quality architectural photography.`;
      }

      return prompt;
    });

    const results = await Promise.all(batchPromises);
    prompts.push(...results);

    if (i + batchSize < PROPERTIES.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return prompts;
}

async function generateImage(prompt: string, index: number): Promise<Buffer | null> {
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      const delay = 2000 * attempt;
      console.log(`[Gemini] Retry ${attempt}/${maxRetries} for image ${index + 1} after ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }

    try {
      const response = await genai.models.generateContent({
        model: MODEL,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseModalities: ["IMAGE", "TEXT"],
          imageConfig: { aspectRatio: "16:9", imageSize: "2K" },
        },
      });

      if (!response.candidates?.length) {
        console.warn(`[Gemini] No candidates for image ${index + 1}`);
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

      console.warn(`[Gemini] No image data for image ${index + 1}`);
    } catch (error: any) {
      console.error(`[Gemini] Error image ${index + 1} (attempt ${attempt + 1}):`, error?.message);
      if (error?.status === 429) {
        console.log(`[Gemini] Rate limited, waiting 15s...`);
        await new Promise((r) => setTimeout(r, 15000));
      }
    }
  }
  return null;
}

async function main() {
  console.log("=== Front-Facing Real Estate Image Generator ===\n");

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created: ${OUTPUT_DIR}\n`);
  }

  const prompts = await generatePrompts();

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "prompts.json"),
    JSON.stringify(
      prompts.map((p, i) => ({ index: i + 1, name: PROPERTIES[i].name, desc: PROPERTIES[i].desc, prompt: p })),
      null,
      2
    )
  );
  console.log(`\n[Saved] prompts.json\n`);

  console.log("=== Generating front-facing images with Gemini 3.1 Flash ===\n");

  let success = 0;

  for (let i = 0; i < prompts.length; i++) {
    const name = PROPERTIES[i].name;
    const outputPath = path.join(OUTPUT_DIR, `${name}.png`);

    if (fs.existsSync(outputPath)) {
      console.log(`[Skip] ${name}.png already exists`);
      success++;
      continue;
    }

    console.log(`\n[${i + 1}/10] Generating: ${name}`);
    console.log(`[Prompt] ${prompts[i].slice(0, 120)}...`);

    const buf = await generateImage(prompts[i], i);

    if (buf) {
      fs.writeFileSync(outputPath, buf);
      console.log(`[Saved] ${name}.png (${(buf.length / 1024 / 1024).toFixed(1)}MB)`);
      success++;
    } else {
      console.error(`[FAILED] ${name}`);
    }

    if (i < prompts.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log(`\n=== Done! ${success}/${prompts.length} images generated ===`);
  console.log(`Output: ${OUTPUT_DIR}`);
}

main().catch(console.error);
