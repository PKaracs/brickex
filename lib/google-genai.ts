import { GoogleGenAI } from "@google/genai";

if (!process.env.GOOGLE_GENAI_API_KEY) {
  throw new Error("GOOGLE_GENAI_API_KEY environment variable is required");
}

export const genai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

// Primary model, with fallback if quota is exhausted (429)
export const GEMINI_IMAGE_MODEL = "gemini-3.1-flash-image-preview";
export const GEMINI_IMAGE_MODEL_FALLBACK = "gemini-3-pro-image-preview";

// Aspect ratio to resolution mapping for Gemini 3.1 Flash Image (Nano Banana 2) at 2K resolution
// Supported: "1:1", "1:4", "1:8", "2:3", "3:2", "3:4", "4:1", "4:3", "4:5", "5:4", "8:1", "9:16", "16:9", "21:9"
export const ASPECT_RATIOS = {
  square: { ratio: "1:1", width: 2048, height: 2048 },
  portrait: { ratio: "4:5", width: 1856, height: 2304 },
  story: { ratio: "9:16", width: 1536, height: 2752 },
  cinema: { ratio: "16:9", width: 2752, height: 1536 },
  ultrawide: { ratio: "21:9", width: 3168, height: 1344 },
  tallBanner: { ratio: "1:4", width: 1024, height: 4096 },
  wideBanner: { ratio: "4:1", width: 4096, height: 1024 },
  ultraTall: { ratio: "1:8", width: 768, height: 6144 },
  ultraWideBanner: { ratio: "8:1", width: 6144, height: 768 },
} as const;

export type AspectRatioKey = keyof typeof ASPECT_RATIOS;
