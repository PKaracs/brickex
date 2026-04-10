import OpenAI from "openai";

const ENHANCER_SYSTEM = `You are a world-class architectural photographer. Rewrite the given prompt with professional photography specifications:
- CAMERA: specific body + lens (e.g. "Canon EOS R5 with RF 24-70mm f/2.8L")
- SETTINGS: aperture, ISO, shutter speed matching the scene
- LIGHTING: exact lighting that matches time of day
- COLOR GRADING: cinematic color palette and tonal quality  
- COMPOSITION: rule of thirds, leading lines, depth layers
- TEXTURE & DETAIL: material quality, reflections, micro-details
- ATMOSPHERE: haze, bokeh, light particles, ambient mood

RULES:
1. Keep ALL scene details from the original prompt
2. Add cinematic photography expertise on top
3. Make it look like it belongs in Architectural Digest or Dezeen
4. Output ONLY the enhanced prompt, no explanations
5. Under 400 words`;

export async function enhancePrompt(raw: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return raw;

  try {
    const openai = new OpenAI({ apiKey });
    const res = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: ENHANCER_SYSTEM },
        { role: "user", content: raw },
      ],
      max_completion_tokens: 800,
    });
    return res.choices[0]?.message?.content?.trim() || raw;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.warn(`[Enhance] Failed: ${message}, using raw prompt`);
    return raw;
  }
}
