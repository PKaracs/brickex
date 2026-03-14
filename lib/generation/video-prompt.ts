import OpenAI from "openai";

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI | null {
  if (_openai) return _openai;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("[VideoPrompt] No OPENAI_API_KEY set, skipping enhancement");
    return null;
  }
  _openai = new OpenAI({ apiKey });
  return _openai;
}

const VIDEO_PROMPT_SYSTEM = `You are a cinematic video prompt engineer for Grok Imagine Video (image-to-video). The model receives a STILL IMAGE and a TEXT PROMPT, then generates a video.

The image provided is a reference of a building/scene. The user wants to apply a cinematic transformation to it.

You will receive:
1. A scene preset name and description (e.g. "Construction Rise", "Snowfall", "Four Seasons")
2. The user's image — analyze it to understand the building type, materials, surroundings, and style

Your job: Write a concise video prompt (80-200 words) that describes the cinematic transformation.

IMPORTANT CONTEXT FOR DIFFERENT PRESET TYPES:
- "Construction Rise": The video should show the building from the image being constructed — starting from an empty plot and building up to the EXACT building shown. Describe the specific architectural features you see (glass facades, concrete structure, rooftop pool, etc.) so the final frame matches the image.
- "Four Seasons": Show seasons changing around this specific building — spring blossoms, summer greenery, autumn leaves, winter snow.
- "Snowfall" / "Storm": Show weather effects happening to/around this specific building.
- "Classic Timelapse" / "Life in Motion": Show time passing with clouds, shadows, people — the building stays still as the centerpiece.

RULES:
- Describe WHAT YOU SEE in the image (building shape, materials, colors, surroundings) so the video matches it.
- Keep the prompt focused on MOTION and CHANGE over time.
- Do NOT mention "the image", "the input", or "the reference" — write as if directing a cinematographer.
- Output ONLY the prompt text, no explanations or markdown.`;

export async function generateVideoPrompt(
  scenePresetPrompt: string,
  scenePresetLabel: string,
  imageBase64: string,
  userPrompt?: string,
  motionPresetPrompt?: string,
): Promise<string> {
  const openai = getOpenAI();
  if (!openai) {
    return buildFallbackPrompt(scenePresetPrompt, userPrompt, motionPresetPrompt);
  }

  try {
    console.log(`[VideoPrompt] Generating prompt for scene: ${scenePresetLabel}...`);
    const start = Date.now();

    const userMessage = [
      `Scene preset: "${scenePresetLabel}"`,
      `Preset description for reference: ${scenePresetPrompt}`,
      userPrompt ? `User's additional instructions: ${userPrompt}` : null,
      motionPresetPrompt ? `Camera motion style: ${motionPresetPrompt}` : null,
      `Write a video prompt for the building in this image using the "${scenePresetLabel}" transformation. Be specific about the architectural details you see.`,
    ].filter(Boolean).join("\n\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: VIDEO_PROMPT_SYSTEM },
        {
          role: "user",
          content: [
            { type: "text", text: userMessage },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: "low",
              },
            },
          ],
        },
      ],
      max_tokens: 400,
    });

    const enhanced = response.choices[0]?.message?.content?.trim();
    const elapsed = Date.now() - start;

    if (!enhanced || enhanced.length < 30) {
      console.warn(`[VideoPrompt] Got empty/short response, using fallback`);
      return buildFallbackPrompt(scenePresetPrompt, userPrompt, motionPresetPrompt);
    }

    console.log(`[VideoPrompt] Generated in ${elapsed}ms (${enhanced.length} chars)`);
    return enhanced;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[VideoPrompt] Failed, using fallback:`, message);
    return buildFallbackPrompt(scenePresetPrompt, userPrompt, motionPresetPrompt);
  }
}

function buildFallbackPrompt(
  scenePresetPrompt: string,
  userPrompt?: string,
  motionPresetPrompt?: string,
): string {
  const parts = [scenePresetPrompt];
  if (motionPresetPrompt) parts.push(motionPresetPrompt);
  if (userPrompt) parts.push(userPrompt);
  return parts.join(". ");
}
