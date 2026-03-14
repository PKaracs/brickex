import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";
import { buildTexturePrompt } from "./interior-texture-prompt";

const MODEL = "gemini-3.1-flash-image-preview";
const OUTPUT_DIR = path.join(process.cwd(), "public", "textures");
const REFERENCE_IMAGE_PATH = path.join(
  process.cwd(),
  "scripts",
  "reference-texture-sphere.png"
);
const MAX_RETRIES = 2;
const IMAGE_DELAY_MS = 2500;

/** Texture to generate: id (filename), label (display name), and material description for the prompt */
const TEXTURES: { id: string; label: string; materialDescription: string }[] = [
  {
    id: "marble-012",
    label: "Marble 012",
    materialDescription: `Marble — soft grey-white background (Calacatta or Carrara style) with subtle grey and white veining. Natural stone look, elegant and neutral.`,
  },
  {
    id: "concrete-smooth",
    label: "Smooth Concrete",
    materialDescription: `Smooth light grey concrete — matte, uniform finish like polished floor or modern wall. Clean, minimal.`,
  },
  {
    id: "concrete-rough",
    label: "Rough Concrete",
    materialDescription: `Rough grey concrete — coarse aggregate visible, raw industrial texture. Slightly uneven surface.`,
  },
  {
    id: "oak-wood",
    label: "Oak Wood",
    materialDescription: `Light brown oak wood — natural grain, horizontal lines like stacked planks or sawn timber. Warm, natural.`,
  },
  {
    id: "brick-herringbone",
    label: "Brick Herringbone",
    materialDescription: `Reddish-brown brick in herringbone or basketweave pattern. Classic clay brick, mortar lines visible.`,
  },
  {
    id: "polished-metal",
    label: "Polished Metal",
    materialDescription: `Highly reflective polished metal — chrome or brushed steel. Clean reflections, modern.`,
  },
  {
    id: "terracotta",
    label: "Terracotta",
    materialDescription: `Terracotta — warm reddish-brown clay with subtle vertical ribs or fluting. Mediterranean, tactile.`,
  },
  {
    id: "stone-gravel",
    label: "Stone Gravel",
    materialDescription: `Dark brown or grey gravel — small granular stones, rough earth texture. Natural aggregate.`,
  },
  {
    id: "white-plaster",
    label: "White Plaster",
    materialDescription: `Smooth white or off-white plaster — matte, soft. Like a clean interior wall or lime plaster.`,
  },
  {
    id: "grey-paver",
    label: "Grey Paver",
    materialDescription: `Light grey paving or block pattern — rectangular tiles or cobbles, subtle mortar. Urban, clean.`,
  },
  {
    id: "moss-stone",
    label: "Moss Stone",
    materialDescription: `Mossy green-grey stone — organic, slightly lumpy, with soft green moss tones. Natural, aged.`,
  },
  {
    id: "rust-metal",
    label: "Rust Metal",
    materialDescription: `Rusted or oxidized metal — reddish-brown and grey patches, industrial, weathered.`,
  },
];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getReferenceImageParts(): { inlineData: { mimeType: string; data: string } }[] {
  if (!fs.existsSync(REFERENCE_IMAGE_PATH)) return [];
  const buffer = fs.readFileSync(REFERENCE_IMAGE_PATH);
  const base64 = buffer.toString("base64");
  const mimeType = REFERENCE_IMAGE_PATH.endsWith(".png") ? "image/png" : "image/jpeg";
  return [{ inlineData: { mimeType, data: base64 } }];
}

async function generateTexture(
  genai: GoogleGenAI,
  id: string,
  materialDescription: string
): Promise<Buffer | null> {
  const fullPrompt = buildTexturePrompt(materialDescription);
  const referenceParts = getReferenceImageParts();
  const promptParts =
    referenceParts.length > 0
      ? [
          {
            text: "Match this style exactly: one rounded 3D sphere (ball), material wrapped around it, studio lighting with soft highlight and shadow so it looks round, neutral background. Generate a new image in the same style with this material on the sphere:\n\n",
          },
          ...referenceParts,
          { text: "\n\nMaterial to apply on the sphere: " + materialDescription },
        ]
      : [{ text: fullPrompt }];

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      console.log(`[Gemini] Retry ${attempt}/${MAX_RETRIES} for ${id}`);
      await sleep(IMAGE_DELAY_MS * attempt);
    }

    try {
      const response = await genai.models.generateContent({
        model: MODEL,
        contents: [{ role: "user", parts: promptParts }],
        config: {
          responseModalities: ["IMAGE", "TEXT"],
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: "2K",
          },
        },
      });

      if (!response.candidates || response.candidates.length === 0) {
        console.log(`[Gemini] Empty candidates for ${id}`);
        continue;
      }

      const candidate = response.candidates[0];
      if (candidate.finishReason === "SAFETY") {
        console.log(`[Gemini] Safety blocked: ${id}`);
        return null;
      }

      const parts = candidate.content?.parts;
      if (!parts) {
        console.log(`[Gemini] No content parts for ${id}`);
        continue;
      }

      for (const part of parts) {
        if ("inlineData" in part && part.inlineData?.data) {
          return Buffer.from(part.inlineData.data, "base64");
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`[Gemini] Error for ${id}: ${message}`);
      if (
        message.includes("429") ||
        message.includes("RESOURCE_EXHAUSTED")
      ) {
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
  const hasReference = fs.existsSync(REFERENCE_IMAGE_PATH);
  console.log(`Output dir: ${OUTPUT_DIR}`);
  console.log(`Model: ${MODEL}`);
  console.log(`Reference sphere image: ${hasReference ? "yes" : "no"}\n`);

  let successCount = 0;

  for (let i = 0; i < TEXTURES.length; i++) {
    const { id, label, materialDescription } = TEXTURES[i];
    const outPath = path.join(OUTPUT_DIR, `${id}.jpg`);
    const progress = `[${i + 1}/${TEXTURES.length}]`;

    if (fs.existsSync(outPath)) {
      console.log(`${progress} Skip existing ${id}.jpg`);
      successCount += 1;
      continue;
    }

    console.log(`${progress} Generating ${label} (${id})`);
    const imageBuffer = await generateTexture(genai, id, materialDescription);

    if (!imageBuffer) {
      console.log(`${progress} Failed ${id}`);
    } else {
      fs.writeFileSync(outPath, imageBuffer);
      console.log(
        `${progress} Saved ${id}.jpg (${(imageBuffer.length / 1024).toFixed(0)} KB)`
      );
      successCount += 1;
    }

    if (i < TEXTURES.length - 1) {
      await sleep(IMAGE_DELAY_MS);
    }
  }

  console.log(`\nDone: ${successCount}/${TEXTURES.length} textures.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
