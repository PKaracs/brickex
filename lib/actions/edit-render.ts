"use server";

import {
  genai,
  GEMINI_IMAGE_MODEL,
  GEMINI_IMAGE_MODEL_FALLBACK,
} from "@/lib/google-genai";

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type ContentPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

/**
 * Region edit: sends the annotated image (with green rectangle overlay) + prompt.
 * Only ONE image is sent to stay within body size limits.
 */
export async function editRenderRegion(
  annotatedImageBase64: string,
  editPrompt: string
): Promise<{ outputUrl?: string; error?: string }> {
  if (!annotatedImageBase64 || !editPrompt) {
    return { error: "Missing required parameters for editing." };
  }

  console.log(`[EditRender] Region edit: "${editPrompt}" (${Math.round(annotatedImageBase64.length / 1024)}KB)`);

  const parts: ContentPart[] = [];

  parts.push({
    text: `You are an expert architectural image editor. This image has a bright green semi-transparent rectangle drawn on it, highlighting a specific region the user wants to change.`,
  });

  parts.push({
    inlineData: {
      mimeType: "image/jpeg",
      data: annotatedImageBase64,
    },
  });

  parts.push({
    text: `EDIT INSTRUCTION: "${editPrompt}"

RULES:
1. Edit ONLY the area that was inside the green highlighted rectangle
2. Apply the edit instruction to that specific region
3. Keep EVERYTHING outside the green rectangle EXACTLY the same — pixel-perfect preservation
4. Remove the green overlay in the output — the result should look clean with no green rectangle
5. The output must be the full image (same dimensions) with only the highlighted region changed
6. Maintain consistent lighting, perspective, and style with the rest of the image
7. The edit should look natural and seamless

Return the edited full image.`,
  });

  return callGeminiEdit(parts);
}

/**
 * Global edit: sends the full image + prompt (no region selection).
 */
export async function editRenderGlobal(
  imageBase64: string,
  editPrompt: string
): Promise<{ outputUrl?: string; error?: string }> {
  if (!imageBase64 || !editPrompt) {
    return { error: "Missing required parameters for editing." };
  }

  console.log(`[EditRender] Global edit: "${editPrompt}" (${Math.round(imageBase64.length / 1024)}KB)`);

  const parts: ContentPart[] = [];

  parts.push({
    text: `You are an expert architectural image editor. The user wants to make a change to this rendered image.`,
  });

  parts.push({
    inlineData: {
      mimeType: "image/jpeg",
      data: imageBase64,
    },
  });

  parts.push({
    text: `EDIT INSTRUCTION: "${editPrompt}"

RULES:
1. Apply the edit instruction to the image
2. Preserve the overall composition, perspective, and quality
3. The output must be the same dimensions as the input
4. Make the edit look natural and seamless
5. Only change what the instruction asks for — keep everything else the same

Return the edited full image.`,
  });

  return callGeminiEdit(parts);
}

async function callGeminiEdit(
  parts: ContentPart[]
): Promise<{ outputUrl?: string; error?: string }> {
  const modelsToTry = [GEMINI_IMAGE_MODEL, GEMINI_IMAGE_MODEL_FALLBACK];

  for (const model of modelsToTry) {
    console.log(`[EditRender] Trying model: ${model}`);

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        console.log(
          `[EditRender] Retry ${attempt}/${MAX_RETRIES} after ${RETRY_DELAY_MS}ms`
        );
        await sleep(RETRY_DELAY_MS * attempt);
      }

      try {
        const response = await genai.models.generateContent({
          model,
          contents: [{ role: "user", parts }],
          config: {
            responseModalities: ["IMAGE", "TEXT"],
          },
        });

        if (response.promptFeedback) {
          const blockReason = (response.promptFeedback as any).blockReason;
          if (blockReason) {
            return { error: "Edit blocked by content safety filters." };
          }
        }

        if (!response.candidates || response.candidates.length === 0) {
          if (attempt < MAX_RETRIES) continue;
          return { error: "No result from AI model. Try a different edit." };
        }

        const candidate = response.candidates[0];

        if (candidate.finishReason === "SAFETY") {
          return { error: "Edit blocked by safety filters. Try rephrasing." };
        }

        if (candidate.content?.parts) {
          for (const part of candidate.content.parts) {
            if ("inlineData" in part && part.inlineData?.data) {
              const outputUrl = `data:image/png;base64,${part.inlineData.data}`;
              console.log(`[EditRender] Success (model: ${model})`);
              return { outputUrl };
            }
          }
        }

        if (attempt < MAX_RETRIES) continue;
        return { error: "AI didn't return an image. Try again." };
      } catch (error: any) {
        console.error(
          `[EditRender] Error on ${model} (attempt ${attempt + 1}):`,
          error?.message || error
        );

        if (error?.status === 401 || error?.status === 400) {
          return { error: "API authentication error." };
        }

        if (error?.status === 429) {
          console.log(`[EditRender] Quota exhausted, trying fallback...`);
          break;
        }

        if (attempt < MAX_RETRIES) continue;
        return { error: error?.message || "Edit failed. Please try again." };
      }
    }
  }

  return { error: "All AI models are busy. Please try again in a moment." };
}
