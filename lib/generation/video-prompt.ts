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

const SCENE_PROMPTS: Record<string, string> = {
  "construction-rise":
    "Cinematic construction time-lapse. Begin with an empty dirt plot, then foundations are poured, steel beams rise, floors stack up rapidly, glass curtain walls are installed, and the building from the reference image emerges fully completed. Keep the exact architecture from the provided image as the final result. Construction cranes, scaffolding, dust catching golden sunlight.",

  "four-seasons":
    "Cinematic four-seasons time-lapse of this exact building and scene. Spring: cherry blossoms bloom, fresh green grass. Summer: lush deep green, vibrant flowers, bright blue sky. Autumn: leaves turn red and gold, falling gently. Winter: snow blankets everything, frost on surfaces, warm interior lights glow. Seamless seasonal transitions. Keep the building exactly as shown.",

  "weather-drama":
    "Dramatic storm time-lapse over this exact building. Clear skies turn dark and ominous, wind bends trees, heavy rain hammers surfaces, lightning flashes illuminate the facade, then the storm passes revealing golden sunlight and a rainbow. Keep the building exactly as shown.",

  "people-timelapse":
    "Cinematic human-activity time-lapse around this exact building. Morning: first people arrive, lights turn on. Midday: busy activity, people walking, cars flowing. Evening: golden hour, people leaving, street lights turning on. Night: building glows warm, light trails from vehicles. Keep the building exactly as shown.",

  "snow-blanket":
    "Serene snowfall time-lapse over this exact building. First delicate snowflakes drift down, gradually intensifying. Snow accumulates on every surface — rooftops, ledges, ground. The scene transforms into a winter wonderland while warm interior lights glow. Keep the building exactly as shown.",

  "timelapse-classic":
    "Classic architectural time-lapse of this exact building. Fast-moving clouds race across the sky, their shadows sweep across the facade. Sunlight angles change dramatically, warm and cool tones alternate. People and vehicles blur into motion streaks. The building stands perfectly still as the world rushes around it. Keep the building exactly as shown.",
};

const GENERIC_SCENE_SYSTEM = `You are a video prompt writer. Write a short (40-80 word) video animation prompt.

CRITICAL RULES:
- NEVER describe what the building looks like. The video model already has the image.
- ONLY describe the MOTION, WEATHER, LIGHTING CHANGES, or TIME-LAPSE EFFECTS.
- Always include "Keep the building exactly as shown in the reference image" at the end.
- Output ONLY the prompt, nothing else.`;

export async function generateVideoPrompt(
  scenePresetPrompt: string,
  scenePresetLabel: string,
  _imageBase64: string,
  userPrompt?: string,
  motionPresetPrompt?: string,
): Promise<string> {
  const presetId = scenePresetLabel
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const hardcodedPrompt = findHardcodedPrompt(presetId);

  if (hardcodedPrompt) {
    const parts = [hardcodedPrompt];
    if (motionPresetPrompt) parts.push(motionPresetPrompt);
    if (userPrompt) parts.push(userPrompt);
    const final = parts.join(" ");
    console.log(`[VideoPrompt] Using hardcoded prompt for "${presetId}" (${final.length} chars)`);
    return final;
  }

  const openai = getOpenAI();
  if (!openai) {
    return buildFallbackPrompt(scenePresetPrompt, userPrompt, motionPresetPrompt);
  }

  try {
    console.log(`[VideoPrompt] Generating prompt for scene: ${scenePresetLabel}...`);
    const start = Date.now();

    const userMessage = [
      `Scene effect: "${scenePresetLabel}"`,
      `Reference description of the effect (adapt but do NOT describe the building): ${scenePresetPrompt}`,
      userPrompt ? `Additional user instructions: ${userPrompt}` : null,
      motionPresetPrompt ? `Camera motion: ${motionPresetPrompt}` : null,
      `Write a prompt describing ONLY the motion/weather/lighting effect. Do NOT describe the building — the model already has the image.`,
    ].filter(Boolean).join("\n\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: GENERIC_SCENE_SYSTEM },
        { role: "user", content: userMessage },
      ],
      max_tokens: 200,
    });

    const enhanced = response.choices[0]?.message?.content?.trim();
    const elapsed = Date.now() - start;

    if (!enhanced || enhanced.length < 20) {
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

function findHardcodedPrompt(presetId: string): string | null {
  if (SCENE_PROMPTS[presetId]) return SCENE_PROMPTS[presetId];
  for (const [key, value] of Object.entries(SCENE_PROMPTS)) {
    if (presetId.includes(key) || key.includes(presetId)) return value;
  }
  return null;
}

function buildFallbackPrompt(
  scenePresetPrompt: string,
  userPrompt?: string,
  motionPresetPrompt?: string,
): string {
  const parts = [
    scenePresetPrompt,
    "Keep the building exactly as shown in the reference image.",
  ];
  if (motionPresetPrompt) parts.push(motionPresetPrompt);
  if (userPrompt) parts.push(userPrompt);
  return parts.join(" ");
}
