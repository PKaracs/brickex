import {
  genai,
  GEMINI_IMAGE_MODEL,
  GEMINI_IMAGE_MODEL_FALLBACK,
  ASPECT_RATIOS,
  AspectRatioKey,
} from "@/lib/google-genai";
import { enhancePrompt } from "./prompt-enhancer";

type ContentPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

export interface GeminiImageConfig {
  aspectRatio?: AspectRatioKey;
  resolution?: "512px" | "1K" | "2K" | "4K";
  enableSearchGrounding?: boolean;
}

// Retry config
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

import { NsfwContentError } from "./storage";

/**
 * Sleep helper for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Call Gemini 3.1 Flash Image (Nano Banana 2) API with retry logic and optional Google Search grounding
 */
export async function callGeminiImage(
  prompt: string,
  faceImages: Buffer[],
  objectImages: Buffer[],
  config: GeminiImageConfig = {},
  locationImages: Buffer[] = [],
  isCouple: boolean = false,
  backgroundImages: Buffer[] = []
): Promise<Buffer | null> {
  const { aspectRatio = "square", resolution = "2K", enableSearchGrounding = false } = config;
  const ratioConfig = ASPECT_RATIOS[aspectRatio];

  console.log(`[Gemini] Starting generation (Nano Banana 2 / 3.1 Flash Image)`);
  console.log(`[Gemini] Face images: ${faceImages.length}`);
  console.log(`[Gemini] Object images: ${objectImages.length}`);
  console.log(`[Gemini] Location images: ${locationImages.length}`);
  console.log(`[Gemini] Background images: ${backgroundImages.length}`);
  console.log(`[Gemini] Is couple: ${isCouple}`);
  console.log(`[Gemini] Search grounding: ${enableSearchGrounding}`);
  console.log(`[Gemini] Prompt length: ${prompt.length} chars`);
  console.log(
    `[Gemini] Aspect ratio: ${ratioConfig.ratio}, Resolution: ${resolution}`
  );

  // Enhance the prompt with GPT-5-mini before sending to Nano Banana 2
  const enhancedPrompt = await enhancePrompt(prompt);
  if (enhancedPrompt !== prompt) {
    console.log(`[Gemini] Prompt enhanced by GPT-5-mini (${prompt.length} → ${enhancedPrompt.length} chars)`);
  }

  // Build parts once, reuse for retries
  const parts: ContentPart[] = [];

  // Add comprehensive instruction for face/body reference preservation
  // Use explicit isCouple flag instead of guessing from image count
  if (isCouple) {
    // Couple photo - first images are Person 1, last image is Person 2
    parts.push({
      text: `IDENTITY REFERENCE IMAGES - ROMANTIC COUPLE (FACE MATCH IS MANDATORY):

This is a couple photo. First reference image(s) = Person 1. Last reference image = Person 2 (their partner).

⚠️ FACE IDENTITY IS THE #1 PRIORITY - For EACH person:
• The face in the output MUST be IDENTICAL to their reference - not similar, IDENTICAL
• Same person, not a look-alike or approximation
• Every facial feature must match: exact eye shape, nose, lips, jawline, cheekbones, chin, forehead
• All unique identifiers: freckles, moles, dimples, wrinkles, skin texture, scars
• Exact face proportions: eye spacing, nose length, face width/height ratio
• DO NOT beautify or smooth their faces

BODY (preserve but secondary to face):
• Same body type, build, physique, weight - no modifications
• Exact hairstyle, color, texture

COUPLE POSING:
• Loving couple chemistry: holding hands, embracing, arms around each other
• Natural intimacy - the warmth of a real relationship
• Both faces clearly visible and well-lit

Both people must be immediately recognizable as themselves - they should be able to look at this image and say "that's definitely me/us."`,
    });
  } else {
    parts.push({
      text: `IDENTITY REFERENCE IMAGES (FACE MATCH IS MANDATORY):

⚠️ FACE IDENTITY IS THE #1 PRIORITY:
• The face in the output MUST be IDENTICAL to these reference photos - not similar, IDENTICAL
• This is the SAME PERSON, not a look-alike or approximation
• The subject must be able to look at the output and immediately recognize themselves
• Every facial feature must match exactly: eye shape, eye spacing, nose shape, nose size, lip shape, lip fullness, jawline, cheekbones, chin shape, forehead size
• All unique identifiers must be preserved: freckles, moles, dimples, wrinkles, skin texture, any scars or marks
• Exact face proportions: the ratio of features to each other must be identical
• DO NOT beautify, smooth, enhance, or idealize the face in ANY way

BODY (preserve but secondary to face):
• Same body type, build, physique, weight, shoulder width, silhouette
• DO NOT slim, elongate, or modify the body
• Exact hairstyle, color, texture, length
• Maintain apparent age

The output must show THIS EXACT PERSON - if they showed this image to friends/family, everyone would say "that's definitely you."`,
    });
  }

  // Nano Banana 2 supports up to 4 character reference images
  for (const buffer of faceImages.slice(0, 4)) {
    console.log(`[Gemini] Adding face image: ${buffer.length} bytes`);
    parts.push({
      inlineData: {
        mimeType: "image/png",
        data: buffer.toString("base64"),
      },
    });
  }

  // Nano Banana 2 supports up to 10 high-fidelity object reference images
  if (objectImages.length > 0) {
    parts.push({
      text: `LUXURY OBJECT REFERENCES - RENDER WITH HIGH FIDELITY:

These are the luxury items to feature in the scene. Render them with:
• Photorealistic accuracy: exact brand details, logos, materials, textures
• ALL TEXT AND LOGOS must be SHARP and LEGIBLE - correctly spelled, not blurry or garbled
• Proper reflections and lighting on metal, leather, glass surfaces
• Correct proportions and scale relative to the subject
• Prominent placement - objects should be clearly visible, not obscured`,
    });
    for (const buffer of objectImages) {
      parts.push({
        inlineData: {
          mimeType: "image/png",
          data: buffer.toString("base64"),
        },
      });
    }
  }

  // Add location reference images if any (Street View, etc.)
  if (locationImages.length > 0) {
    parts.push({
      text: `LOCATION REFERENCE - MATCH THIS EXACT SPOT:

This is the real-world location where the subject should appear. Use this reference to:
• Recreate the exact architecture, buildings, landmarks, and street features shown
• Match the lighting conditions, time of day, and atmosphere
• Ensure proper perspective - subject should be naturally integrated into this environment
• Create an authentic travel photo - like the subject actually took a picture or selfie here
• Maintain correct scale and proportions relative to the surroundings`,
    });
    for (const buffer of locationImages) {
      parts.push({
        inlineData: {
          mimeType: "image/png",
          data: buffer.toString("base64"),
        },
      });
    }
  }

  // Add background reference images if any
  if (backgroundImages.length > 0) {
    parts.push({
      text: `BACKGROUND REFERENCE IMAGE (adapt lighting to match the requested time of day):`,
    });
    for (const buffer of backgroundImages) {
      parts.push({
        inlineData: {
          mimeType: "image/png",
          data: buffer.toString("base64"),
        },
      });
    }
  }

  // Add the enhanced generation prompt
  parts.push({ text: enhancedPrompt });

  // Try primary model, then fallback on 429 quota errors
  const modelsToTry = [GEMINI_IMAGE_MODEL, GEMINI_IMAGE_MODEL_FALLBACK];

  for (const model of modelsToTry) {
    console.log(`[Gemini] Trying model: ${model}`);

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        console.log(
          `[Gemini] Retry attempt ${attempt}/${MAX_RETRIES} after ${RETRY_DELAY_MS}ms`
        );
        await sleep(RETRY_DELAY_MS * attempt);
      }

      try {
        console.log(
          `[Gemini] Calling ${model} with ${parts.length} parts (attempt ${attempt + 1})`
        );

        const requestConfig: Record<string, unknown> = {
          responseModalities: ["IMAGE", "TEXT"],
          imageConfig: {
            aspectRatio: ratioConfig.ratio,
            imageSize: resolution,
          },
        };

        if (enableSearchGrounding) {
          requestConfig.tools = [{ googleSearch: {} }];
        }

        const response = await genai.models.generateContent({
          model,
          contents: [{ role: "user", parts }],
          config: requestConfig,
        });

        console.log(`[Gemini] Response received from ${model}`);

        if (response.promptFeedback) {
          console.log(
            `[Gemini] Prompt feedback:`,
            JSON.stringify(response.promptFeedback)
          );
          const blockReason = (response.promptFeedback as any).blockReason;
          if (blockReason) {
            console.log(
              `[Gemini] Prompt blocked with reason: ${blockReason} - throwing NsfwContentError`
            );
            throw new NsfwContentError();
          }
        }

        if (!response.candidates || response.candidates.length === 0) {
          console.log(`[Gemini] NO CANDIDATES - empty response from API`);
          console.log(
            `[Gemini] Full response:`,
            JSON.stringify({
              promptFeedback: response.promptFeedback,
              usageMetadata: response.usageMetadata,
            })
          );
          if (attempt < MAX_RETRIES) continue;
          return null;
        }

        const candidate = response.candidates[0];

        if (candidate.finishReason) {
          console.log(`[Gemini] Finish reason: ${candidate.finishReason}`);
          if (candidate.finishReason === "SAFETY") {
            console.log(
              `[Gemini] Content blocked by safety filter - throwing NsfwContentError`
            );
            throw new NsfwContentError();
          }
        }

        if (candidate.safetyRatings) {
          const issues = (candidate.safetyRatings as any[]).filter(
            (r) => r.probability === "HIGH" || r.blocked
          );
          if (issues.length > 0) {
            console.log(`[Gemini] Safety flags:`, JSON.stringify(issues));
          }
        }

        if (candidate.content?.parts) {
          for (const part of candidate.content.parts) {
            if ("inlineData" in part && part.inlineData?.data) {
              const imageBuffer = Buffer.from(part.inlineData.data, "base64");
              console.log(
                `[Gemini] Generated image: ${imageBuffer.length} bytes (model: ${model})`
              );
              return imageBuffer;
            }
            if ("text" in part && part.text) {
              console.log(
                `[Gemini] Got text instead of image: ${part.text.slice(0, 200)}`
              );
            }
          }
        }

        console.log(`[Gemini] No image in response parts`);
        if (attempt < MAX_RETRIES) continue;
        return null;
      } catch (error: any) {
        console.error(
          `[Gemini] API error on ${model} (attempt ${attempt + 1}):`,
          error?.message || error
        );

        if (error?.status === 401 || error?.status === 400) {
          throw error;
        }

        // On 429 (quota exhausted), skip remaining retries and try fallback model
        if (error?.status === 429) {
          console.log(`[Gemini] Quota exhausted on ${model}, trying fallback...`);
          break;
        }

        if (attempt < MAX_RETRIES) continue;
        throw error;
      }
    }
  }

  console.error(`[Gemini] All models exhausted`);
  return null;
}
