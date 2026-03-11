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
const OUTPUT_DIR = path.join(process.cwd(), "public", "real-estate-presets");

const PROPERTY_TYPES = [
  "Modern minimalist villa with infinity pool overlooking the Mediterranean Sea, white concrete and glass facade, Santorini-inspired palette",
  "Beachfront luxury mansion in Malibu with floor-to-ceiling windows, Pacific Ocean view, contemporary California architecture",
  "Tropical Balinese-style resort villa surrounded by rice terraces, teak wood and volcanic stone, lush vegetation",
  "Swiss alpine chalet with massive panoramic windows facing snow-capped mountains, warm timber and stone exterior",
  "Floating overwater bungalow in the Maldives, turquoise lagoon, thatched roof with modern interior, wooden deck",
  "Modernist hillside house in the Hollywood Hills, cantilevered design, city lights panorama at dusk",
  "Provence countryside stone farmhouse with lavender fields, terracotta roof, rustic luxury renovation",
  "Coastal cliffside villa in Amalfi Coast, Mediterranean architecture, terraced gardens cascading toward the sea",
  "Japanese-inspired minimalist house with zen garden, Kyoto aesthetic, clean lines, natural materials, koi pond",
  "Desert modern retreat in Joshua Tree, rammed earth walls, expansive glass, desert landscape with boulders and cacti",
  "Scandinavian lakeside cabin with black timber cladding, floor-to-ceiling glass, birch forest and still lake",
  "Ultra-modern Miami penthouse rooftop terrace, downtown skyline view, sleek furniture, rooftop infinity pool",
  "Caribbean colonial plantation house restored as luxury estate, palm-lined driveway, coral stone, ocean backdrop",
  "Tuscan hilltop villa with cypress tree-lined approach, honey-colored stone, vineyard views, Renaissance proportions",
  "Luxury Airstream-style modern mobile home in Big Sur, polished aluminum, redwood forest setting, elevated deck platform",
  "Cape Town clifftop residence with Atlantic Ocean panorama, contemporary African design, fynbos landscaping, Table Mountain backdrop",
  "Greek island cycladic house on Mykonos, whitewashed walls, cobalt blue accents, Aegean Sea view, bougainvillea",
  "Norwegian fjord glass house, dramatic cliff setting, mirrored facade reflecting water, aurora-ready design",
  "Tulum jungle treehouse villa, sustainable bamboo and concrete, cenote pool, dense tropical canopy",
  "Lake Como Italian palazzo with private dock, ornate balustrades, manicured gardens, Alps reflected in the lake",
];

const PROMPT_SYSTEM = `You are a world-class architectural photographer who has shot for Architectural Digest, Wallpaper*, Dwell, and Elle Decor. 

Generate an image generation prompt for a stunning real estate property exterior photograph. The image must look like it was taken by a top-tier photographer for a luxury property listing or magazine spread.

YOU MUST SPECIFY ALL OF THE FOLLOWING IN EVERY PROMPT:

CAMERA & LENS:
- Exact camera body (e.g., Phase One XF IQ4 150MP, Hasselblad X2D 100C, Sony A7R V, Canon EOS R5, Fuji GFX 100S II)
- Exact lens (e.g., Schneider 55mm f/2.8, XCD 21mm f/4, Sony FE 16-35mm f/2.8 GM II)
- Pick wide-angle (16-35mm) for sweeping exterior shots, medium (45-55mm) for balanced perspective, tilt-shift for corrected verticals

CAMERA SETTINGS:
- Aperture (f/5.6-f/11 for sharp architecture, f/2.8 for dramatic bokeh on details)
- ISO (100-200 for clean medium format quality)
- Shutter speed appropriate for the scene

LIGHTING — THIS IS CRITICAL:
- Time of day: golden hour (warm directional light with long shadows)
- Exact sun position and light direction
- How light interacts with the architecture (reflections on glass, shadows on texture, warm light on stone)
- Any supplementary lighting (hidden uplighting on facade, pool lights, interior glow through windows)
- Sky conditions (clear with wispy clouds for drama, not overcast)

COMPOSITION:
- Exact camera position and height (low angle for grandeur, eye-level for inviting, elevated for context)
- Leading lines, foreground elements, framing devices
- Rule of thirds placement of the main structure
- Depth layers (foreground landscaping, mid-ground architecture, background sky/landscape)

ATMOSPHERE & MOOD:
- Color palette and grading (warm golden tones, cool blue shadows, rich earth tones)
- Air quality (slight golden haze, crystal clear, morning mist)
- Bokeh quality on out-of-focus elements
- Micro-details: water reflections, material textures (grain of wood, veining in stone, glass clarity)

STYLE RULES:
- Photorealistic, NOT a render or CGI — it must look like a real photograph
- Magazine-quality — belongs on the cover of AD or Wallpaper*
- NO people in the frame
- The property should look aspirational but real, lived-in luxury
- Include landscaping, outdoor furniture, or vehicles only if they enhance the composition
- All text output must be ONLY the prompt, no explanations or labels

Keep the prompt under 400 words. Output ONLY the prompt text.`;

async function generatePrompts(): Promise<string[]> {
  console.log("[GPT] Generating 20 architectural photography prompts...\n");
  const prompts: string[] = [];

  const batchSize = 5;
  for (let i = 0; i < PROPERTY_TYPES.length; i += batchSize) {
    const batch = PROPERTY_TYPES.slice(i, i + batchSize);
    const batchPromises = batch.map(async (property, idx) => {
      const globalIdx = i + idx;
      console.log(
        `[GPT] Generating prompt ${globalIdx + 1}/20: ${property.slice(0, 60)}...`,
      );

      const response = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: [
          { role: "system", content: PROMPT_SYSTEM },
          {
            role: "user",
            content: `Generate a stunning architectural photography prompt for this property:\n\n${property}\n\nMake it golden hour / magic hour daylight. The image should be breathtaking — the kind of photo that makes someone stop scrolling and say "I need to live there."`,
          },
        ],
        max_completion_tokens: 16000,
      });

      const msg = response.choices[0]?.message;
      const prompt = msg?.content?.trim();
      console.log(`[GPT] Response ${globalIdx + 1}: finish_reason=${response.choices[0]?.finish_reason}, content_length=${prompt?.length ?? 0}, refusal=${msg?.refusal ?? "none"}`);
      if (!prompt || prompt.length < 100) {
        console.warn(
          `[GPT] Short/empty response for ${globalIdx + 1}, using fallback. Raw content: "${prompt?.slice(0, 300)}"`,
        );
        return `${property}. Shot on Hasselblad X2D 100C with XCD 21mm f/4 at f/8, ISO 100. Golden hour light, warm directional sunlight from the left casting long dramatic shadows. Magazine-quality architectural photography, photorealistic, ultra-detailed textures.`;
      }

      console.log(
        `[GPT] Prompt ${globalIdx + 1} ready (${prompt.length} chars)`,
      );
      return prompt;
    });

    const batchResults = await Promise.all(batchPromises);
    prompts.push(...batchResults);

    if (i + batchSize < PROPERTY_TYPES.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return prompts;
}

async function generateImage(
  prompt: string,
  index: number,
): Promise<Buffer | null> {
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      const delay = 2000 * attempt;
      console.log(
        `[Gemini] Retry ${attempt}/${maxRetries} for image ${index + 1} after ${delay}ms...`,
      );
      await new Promise((r) => setTimeout(r, delay));
    }

    try {
      const response = await genai.models.generateContent({
        model: MODEL,
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        config: {
          responseModalities: ["IMAGE", "TEXT"],
          imageConfig: {
            aspectRatio: "16:9",
            imageSize: "2K",
          },
        },
      });

      if (!response.candidates || response.candidates.length === 0) {
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

      console.warn(`[Gemini] No image data in response for image ${index + 1}`);
    } catch (error: any) {
      console.error(
        `[Gemini] Error for image ${index + 1} (attempt ${attempt + 1}):`,
        error?.message,
      );

      if (error?.status === 429) {
        console.log(`[Gemini] Rate limited, waiting 15s...`);
        await new Promise((r) => setTimeout(r, 15000));
      }
    }
  }

  return null;
}

function getFilename(index: number): string {
  const names = [
    "mediterranean-villa",
    "malibu-mansion",
    "bali-resort-villa",
    "swiss-chalet",
    "maldives-overwater",
    "hollywood-hills-modern",
    "provence-farmhouse",
    "amalfi-coast-villa",
    "japanese-zen-house",
    "joshua-tree-retreat",
    "scandinavian-lakehouse",
    "miami-penthouse",
    "caribbean-plantation",
    "tuscan-hilltop-villa",
    "big-sur-mobile-home",
    "cape-town-clifftop",
    "mykonos-cycladic",
    "norwegian-fjord-glass",
    "tulum-treehouse",
    "lake-como-palazzo",
  ];
  return names[index] || `property-${index + 1}`;
}

async function main() {
  console.log("=== Real Estate Preset Image Generator ===\n");

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}\n`);
  }

  const prompts = await generatePrompts();

  const promptsFile = path.join(OUTPUT_DIR, "prompts.json");
  fs.writeFileSync(
    promptsFile,
    JSON.stringify(
      prompts.map((p, i) => ({
        index: i + 1,
        name: getFilename(i),
        property: PROPERTY_TYPES[i],
        prompt: p,
      })),
      null,
      2,
    ),
  );
  console.log(`\n[Saved] Prompts saved to ${promptsFile}\n`);

  console.log("=== Generating images with Gemini 3.1 Flash ===\n");

  let successCount = 0;

  // Generate one at a time to avoid rate limits
  for (let i = 0; i < prompts.length; i++) {
    const filename = getFilename(i);
    const outputPath = path.join(OUTPUT_DIR, `${filename}.png`);

    if (fs.existsSync(outputPath)) {
      console.log(`[Skip] ${filename}.png already exists`);
      successCount++;
      continue;
    }

    console.log(`\n[${i + 1}/20] Generating: ${filename}`);
    console.log(`[Prompt preview] ${prompts[i].slice(0, 120)}...`);

    const imageBuffer = await generateImage(prompts[i], i);

    if (imageBuffer) {
      fs.writeFileSync(outputPath, imageBuffer);
      console.log(
        `[Saved] ${filename}.png (${(imageBuffer.length / 1024 / 1024).toFixed(1)}MB)`,
      );
      successCount++;
    } else {
      console.error(`[FAILED] Could not generate ${filename}`);
    }

    // Small delay between generations to be nice to the API
    if (i < prompts.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log(
    `\n=== Done! ${successCount}/${prompts.length} images generated ===`,
  );
  console.log(`Output: ${OUTPUT_DIR}`);
}

main().catch(console.error);
