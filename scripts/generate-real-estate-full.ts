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
const OUTPUT_DIR = path.join(process.cwd(), "public", "real-estate-full");

const PROPERTIES = [
  {
    name: "modern-glass-villa",
    desc: "A sleek two-story modern villa with an all-glass front facade, white concrete frame, flat roof, infinity pool in front, manicured lawn, palm trees. Mediterranean coast.",
  },
  {
    name: "malibu-beach-mansion",
    desc: "A sprawling single-story Malibu beach mansion with horizontal lines, weathered wood and glass, wide covered patio, sandy beach foreground, Pacific Ocean behind.",
  },
  {
    name: "luxury-glass-skyscraper",
    desc: "A 50-story luxury residential glass skyscraper, sleek curtain wall, balconies with plants, the entire tower visible from base to rooftop against a blue sky with wispy clouds.",
  },
  {
    name: "classic-white-mansion",
    desc: "A grand neoclassical white mansion with columns, symmetrical wings, circular driveway with fountain in center, manicured hedges, oak trees framing the property.",
  },
  {
    name: "desert-modern-house",
    desc: "A low-profile desert modern house in Scottsdale, rammed earth and corten steel, floor-to-ceiling glass, flat roof with deep overhang, saguaro cacti, desert landscape.",
  },
  {
    name: "swiss-mountain-chalet",
    desc: "A traditional Swiss chalet with dark timber upper floors and stone base, large balcony with flower boxes, peaked roof, Alpine meadow foreground, snow-capped peaks behind.",
  },
  {
    name: "miami-condo-tower",
    desc: "A curved 40-story luxury condo tower in Miami, white facade with flowing balconies, the full building from ground to top, palm-lined boulevard in foreground, blue sky.",
  },
  {
    name: "tuscan-villa-estate",
    desc: "A symmetrical Tuscan villa with honey stone walls, green shutters, terracotta roof, cypress trees flanking the entrance, gravel path leading to arched front door, vineyard behind.",
  },
  {
    name: "japanese-minimalist-home",
    desc: "A single-story Japanese minimalist residence with clean horizontal lines, dark timber and white plaster, zen rock garden in front, precisely trimmed trees, slate pathway to entrance.",
  },
  {
    name: "tropical-overwater-villa",
    desc: "A luxury overwater villa on stilts over crystal turquoise water, thatched roof, wooden deck with plunge pool, the entire structure visible including stilts and water below, Maldives.",
  },
];

const PROMPT_SYSTEM = `You are a world-class architectural photographer shooting for Architectural Digest and Wallpaper*.

Generate a prompt for an image of a property exterior. THE ENTIRE BUILDING MUST BE VISIBLE — from the ground/foundation all the way to the rooftop/peak. Nothing cropped. The full structure in frame.

ABSOLUTE NON-NEGOTIABLE RULES:
1. THE FULL BUILDING must be visible — roof to ground, left edge to right edge. NO CROPPING of any part of the structure.
2. FRONTAL VIEW — camera directly in front of the building, looking straight at the facade. Centered, symmetrical.
3. GENEROUS FRAMING — leave breathing room above the roof (sky visible) and below the base (ground/landscaping visible). The building should occupy roughly 50-70% of the frame height, NOT edge-to-edge.
4. BEAUTIFUL DAYTIME — bright blue sky, golden-warm daylight (late morning or golden hour), the front facade well-lit by the sun.
5. NO PEOPLE in the image.

CAMERA SPECS (always include):
- Camera: Phase One XF IQ4 150MP or Hasselblad X2D 100C
- Lens: tilt-shift (Canon TS-E 24mm f/3.5L II or similar) for corrected verticals
- Settings: f/8-f/11, ISO 100, tripod
- For skyscrapers: step far back, use 24-35mm to fit the full tower
- For houses/villas: position at a distance that shows the whole building with space around it

COMPOSITION:
- Camera on the center axis of the building
- Foreground: path, lawn, driveway, water, or landscaping leading toward the entrance
- Middle: the full building, symmetrically framed
- Background: sky, mountains, ocean, or landscape — always visible above the roofline
- The entrance/front door should be roughly centered

LIGHTING & ATMOSPHERE:
- Warm, directional sunlight on the facade
- Rich blue sky with a few elegant clouds
- Material textures: stone grain, wood warmth, glass reflections of sky
- Lush, well-maintained landscaping

OUTPUT: Only the prompt text. Under 350 words. No markdown, no labels.`;

async function generatePrompts(): Promise<string[]> {
  console.log("[GPT] Generating 10 full-building prompts...\n");
  const prompts: string[] = [];

  const batch1 = PROPERTIES.slice(0, 5);
  const batch2 = PROPERTIES.slice(5, 10);

  for (const [batchIdx, batch] of [batch1, batch2].entries()) {
    const results = await Promise.all(
      batch.map(async (prop, idx) => {
        const i = batchIdx * 5 + idx;
        console.log(`[GPT] ${i + 1}/10: ${prop.name}`);
        const res = await openai.chat.completions.create({
          model: "gpt-5-mini",
          messages: [
            { role: "system", content: PROMPT_SYSTEM },
            {
              role: "user",
              content: `Property: ${prop.desc}\n\nTHE ENTIRE BUILDING MUST BE VISIBLE — roof to ground, nothing cropped. Frontal view, symmetrical, beautiful daytime. Step back far enough to show the complete structure with sky above and ground below.`,
            },
          ],
          max_completion_tokens: 16000,
        });
        const text = res.choices[0]?.message?.content?.trim();
        console.log(`[GPT] ${i + 1} done (${text?.length ?? 0} chars)`);
        if (!text || text.length < 100) {
          return `${prop.desc}. THE ENTIRE BUILDING MUST BE VISIBLE from ground to rooftop, nothing cropped. Frontal symmetrical view, camera centered on building axis. Shot on Hasselblad X2D 100C with Canon TS-E 24mm f/3.5L II tilt-shift, f/8, ISO 100, tripod. Beautiful warm daytime light, blue sky with clouds above the roofline, landscaping visible below. Photorealistic architectural photography, magazine quality.`;
        }
        return text;
      })
    );
    prompts.push(...results);
    if (batchIdx === 0) await new Promise((r) => setTimeout(r, 500));
  }

  return prompts;
}

async function generateImage(prompt: string, idx: number): Promise<Buffer | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, 2000 * attempt));
      console.log(`[Gemini] Retry ${attempt}/3 for image ${idx + 1}`);
    }
    try {
      const res = await genai.models.generateContent({
        model: MODEL,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseModalities: ["IMAGE", "TEXT"],
          imageConfig: { aspectRatio: "16:9", imageSize: "2K" },
        },
      });
      const parts = res.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const p of parts) {
          if ("inlineData" in p && p.inlineData?.data) {
            return Buffer.from(p.inlineData.data, "base64");
          }
        }
      }
      console.warn(`[Gemini] No image data for ${idx + 1}`);
    } catch (e: any) {
      console.error(`[Gemini] Error ${idx + 1}:`, e?.message);
      if (e?.status === 429) await new Promise((r) => setTimeout(r, 15000));
    }
  }
  return null;
}

async function main() {
  console.log("=== Full-Building Real Estate Generator ===\n");

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created: ${OUTPUT_DIR}\n`);
  }

  const prompts = await generatePrompts();

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "prompts.json"),
    JSON.stringify(prompts.map((p, i) => ({ index: i + 1, name: PROPERTIES[i].name, prompt: p })), null, 2)
  );
  console.log(`\n[Saved] prompts.json\n`);

  let ok = 0;
  for (let i = 0; i < prompts.length; i++) {
    const name = PROPERTIES[i].name;
    const out = path.join(OUTPUT_DIR, `${name}.png`);

    if (fs.existsSync(out)) {
      console.log(`[Skip] ${name}.png exists`);
      ok++;
      continue;
    }

    console.log(`\n[${i + 1}/10] ${name}`);
    const buf = await generateImage(prompts[i], i);
    if (buf) {
      fs.writeFileSync(out, buf);
      console.log(`[Saved] ${name}.png (${(buf.length / 1024 / 1024).toFixed(1)}MB)`);
      ok++;
    } else {
      console.error(`[FAIL] ${name}`);
    }
    if (i < prompts.length - 1) await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`\n=== Done! ${ok}/${prompts.length} ===`);
  console.log(`Output: ${OUTPUT_DIR}`);
}

main().catch(console.error);
