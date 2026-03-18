import "dotenv/config";

import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";

import { enhancePrompt } from "../lib/generation/prompt-enhancer";

type AspectRatio = "16:9" | "4:5" | "1:1";

interface ScenePrompt {
  filename: string;
  aspectRatio: AspectRatio;
  alt: string;
  caption: string;
  prompt: string;
}

const MODEL = "gemini-3.1-flash-image-preview";
const OUTPUT_DIR = path.join(
  process.cwd(),
  "public",
  "blog",
  "render-ideas-that-win-inquiries",
);
const MAX_RETRIES = 2;
const IMAGE_DELAY_MS = 3000;

const SCENES: ScenePrompt[] = [
  {
    filename: "hero-luxury-render-command-center.png",
    aspectRatio: "16:9",
    alt: "Luxury real estate render review studio with model, mood board, and cinematic visuals",
    caption:
      "A luxury render command center with maquettes, material samples, and polished visual direction for premium developments.",
    prompt:
      "Aesthetic luxury real estate creative direction scene inside an architecture studio, expansive walnut table with a refined residential maquette, travertine and bronze material samples, beautifully arranged render printouts, large display in background showing a photorealistic luxury residence, quiet-luxury mood, warm directional morning light, tactile surfaces, no people, no text overlay, no watermark, premium editorial realism.",
  },
  {
    filename: "arrival-sequence-porte-cochere.png",
    aspectRatio: "16:9",
    alt: "Luxury residential porte cochere arrival render with cinematic evening mood",
    caption:
      "Arrival-sequence visualization for a premium residential project with hospitality-grade entry experience.",
    prompt:
      "Photorealistic luxury real estate arrival render, ultra-premium residential porte cochere with sculptural canopy, limestone paving, reflective water feature, warm evening lighting, palm-lined forecourt, subtle luxury vehicle presence, elegant architectural landscaping, cinematic perspective from the driveway approach, no people as subjects, no text, no watermark, high-end developer marketing aesthetic.",
  },
  {
    filename: "district-context-waterfront-aerial.png",
    aspectRatio: "16:9",
    alt: "Waterfront luxury district context render with marina and premium residential towers",
    caption:
      "A district-scale context image that sells both the building and the location around it.",
    prompt:
      "Photorealistic aerial oblique render of a luxury waterfront district with marina, promenade, boutique retail frontage, premium residential towers, landscaped public realm, soft golden-hour light, sophisticated urban design, rich water reflections, high-end architectural visualization quality, no text, no watermark, no exaggerated sci-fi forms.",
  },
  {
    filename: "rooftop-amenity-club-sunset.png",
    aspectRatio: "16:9",
    alt: "Luxury rooftop amenity deck with infinity pool and sunset skyline atmosphere",
    caption:
      "A rooftop club scene designed to sell lifestyle, status, and amenity value in one frame.",
    prompt:
      "Photorealistic luxury rooftop amenity render for a branded residential tower, infinity pool edge, lounge seating, sculptural fire feature, layered planting, champagne-ready hospitality styling, sunset skyline in the distance, soft amber lighting, premium quiet-luxury palette, no visible branding, no text, no watermark, cinematic real estate visualization.",
  },
  {
    filename: "interior-skyline-living-room-twilight.png",
    aspectRatio: "16:9",
    alt: "Twilight penthouse living room render with skyline view and sculptural interior styling",
    caption:
      "An interior visualization that feels inhabited, specific, and materially rich rather than empty.",
    prompt:
      "Photorealistic luxury penthouse living room render at twilight, full-height glazing with skyline view, linen seating, sculptural stone coffee table, bronze accents, layered lamp glow, curated art and books, refined interior styling, premium residential atmosphere, no people, no text, no watermark, ultra-real high-end visualization.",
  },
  {
    filename: "weather-variant-presentation-wall.png",
    aspectRatio: "16:9",
    alt: "Luxury architecture presentation wall showing multiple lighting variants of the same render",
    caption:
      "A presentation format that shows sunrise, overcast, twilight, and night variants without changing the core composition.",
    prompt:
      "Elegant architectural presentation wall in a luxury design studio, showing the same residence visualized across multiple lighting conditions such as sunrise, overcast, twilight, and night, mounted as a clean curated grid of large art boards, sophisticated gallery lighting, premium interior materials, no readable text, no people, no watermark, photorealistic editorial quality.",
  },
  {
    filename: "asset-library-material-board.png",
    aspectRatio: "16:9",
    alt: "Luxury render asset library with material board, thumbnails, and curated visual system",
    caption:
      "An organized visual system for render assets, material references, and campaign-ready image packs.",
    prompt:
      "Photorealistic luxury real estate asset library scene on a large studio table, carefully organized render contact sheets, material swatches in stone wood and metal, swan-neck task lamp, leather notebook, polished sample boards, quiet-luxury editorial styling, no readable text, no people, no watermark, architectural digest quality.",
  },
  {
    filename: "gallery-funnel-storyboard.png",
    aspectRatio: "16:9",
    alt: "Luxury real estate gallery storyboard showing hero, arrival, amenity, interior, and twilight sequence",
    caption:
      "A sequential image storyboard that moves the buyer from attraction to proof to desire.",
    prompt:
      "Photorealistic luxury real estate sales storyboard scene, curated sequence of premium render boards laid out on a long oak table showing hero exterior, arrival, district context, rooftop amenity, interior lifestyle, twilight facade, and detail vignette, warm studio side lighting, magazine-grade styling, no readable text, no people, no watermark, premium architectural visualization editorial aesthetic.",
  },
];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateImage(
  genai: GoogleGenAI,
  scene: ScenePrompt,
): Promise<Buffer | null> {
  const enhancedPrompt = await enhancePrompt(scene.prompt);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      console.log(
        `[Gemini] Retry ${attempt}/${MAX_RETRIES} for ${scene.filename}`,
      );
      await sleep(3000 * attempt);
    }

    try {
      const response = await genai.models.generateContent({
        model: MODEL,
        contents: [{ role: "user", parts: [{ text: enhancedPrompt }] }],
        config: {
          responseModalities: ["IMAGE", "TEXT"],
          imageConfig: {
            aspectRatio: scene.aspectRatio,
            imageSize: "2K",
          },
        },
      });

      if (!response.candidates || response.candidates.length === 0) {
        console.log(`[Gemini] Empty candidates for ${scene.filename}`);
        continue;
      }

      const candidate = response.candidates[0];
      if (candidate.finishReason === "SAFETY") {
        console.log(`[Gemini] Safety blocked: ${scene.filename}`);
        return null;
      }

      const parts = candidate.content?.parts;
      if (!parts) {
        console.log(`[Gemini] No content parts for ${scene.filename}`);
        continue;
      }

      for (const part of parts) {
        if ("inlineData" in part && part.inlineData?.data) {
          return Buffer.from(part.inlineData.data, "base64");
        }
      }
    } catch (error: any) {
      const message = error?.message || String(error);
      console.log(`[Gemini] Error for ${scene.filename}: ${message}`);
      if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) {
        await sleep(12000);
      }
    }
  }

  return null;
}

async function main() {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    console.error("Missing GOOGLE_GENAI_API_KEY in .env");
    process.exit(1);
  }

  const genai = new GoogleGenAI({ apiKey });

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`Output dir: ${OUTPUT_DIR}`);

  const promptsPath = path.join(OUTPUT_DIR, "prompts.json");
  fs.writeFileSync(promptsPath, JSON.stringify(SCENES, null, 2), "utf-8");
  console.log(`Saved prompts: ${promptsPath}`);

  let successCount = 0;

  for (let i = 0; i < SCENES.length; i++) {
    const scene = SCENES[i];
    const outPath = path.join(OUTPUT_DIR, scene.filename);
    const progress = `[${i + 1}/${SCENES.length}]`;

    if (fs.existsSync(outPath)) {
      console.log(`${progress} Skip existing ${scene.filename}`);
      successCount += 1;
      continue;
    }

    console.log(`${progress} Generating ${scene.filename}`);
    const imageBuffer = await generateImage(genai, scene);

    if (!imageBuffer) {
      console.log(`${progress} Failed ${scene.filename}`);
    } else {
      fs.writeFileSync(outPath, imageBuffer);
      console.log(
        `${progress} Saved ${scene.filename} (${(imageBuffer.length / 1024 / 1024).toFixed(1)} MB)`,
      );
      successCount += 1;
    }

    if (i < SCENES.length - 1) {
      await sleep(IMAGE_DELAY_MS);
    }
  }

  console.log(`Done: ${successCount}/${SCENES.length} images.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
