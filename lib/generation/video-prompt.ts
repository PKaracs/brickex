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

export function getScenePrompt(
  scenePresetId: string,
  userPrompt?: string,
  motionPresetPrompt?: string,
): string {
  const base = SCENE_PROMPTS[scenePresetId];

  if (base) {
    const parts = [base];
    if (motionPresetPrompt) parts.push(motionPresetPrompt);
    if (userPrompt) parts.push(userPrompt);
    console.log(`[VideoPrompt] Using hardcoded prompt for "${scenePresetId}"`);
    return parts.join(" ");
  }

  console.warn(`[VideoPrompt] No hardcoded prompt for "${scenePresetId}", using generic fallback`);
  const fallbackParts = [
    "Cinematic transformation of this exact building.",
    "Keep the building exactly as shown in the reference image.",
  ];
  if (motionPresetPrompt) fallbackParts.push(motionPresetPrompt);
  if (userPrompt) fallbackParts.push(userPrompt);
  return fallbackParts.join(" ");
}
