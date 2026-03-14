/**
 * Master prompt for generating interior-design texture images with Gemini.
 * Output: one rounded sphere (ball) with the material applied, matching reference style.
 */

export const INTERIOR_TEXTURE_SYSTEM_PROMPT = `You are a professional 3D material artist for an interior design app. Your task is to generate a single image of a ROUNDED SPHERE (ball) with a material texture applied to it.

CRITICAL — the image must show:
- ONE SPHERE ONLY: A single, perfectly rounded 3D ball in the center of the frame. The sphere must look three-dimensional with realistic curvature.
- MATERIAL ON THE BALL: The given material/texture is wrapped around the entire sphere so it looks like the ball is made of that material. The texture follows the curvature naturally (veins, grain, or pattern curve around the ball).
- STUDIO LIGHTING: Soft, professional product-style lighting — a gentle highlight on the upper-left area of the sphere and a soft shadow on the lower-right, so the ball clearly looks rounded and tactile. Neutral, even ambient light. No harsh shadows.
- NEUTRAL BACKGROUND: Plain dark grey or soft neutral background so the sphere stands out. No props, no floor plane, no labels.
- PHOTOREALISTIC: Looks like a high-end material sample or product shot from an architect or interior designer’s library. Same quality and style as the reference image.
- SQUARE FRAMING: Square aspect ratio, sphere centered, enough padding so the full ball is visible with a little margin.

Output only the image. No captions or text.`;

export function buildTexturePrompt(materialDescription: string): string {
  return `${INTERIOR_TEXTURE_SYSTEM_PROMPT}

Generate exactly one image of a rounded sphere with this material applied to it:

${materialDescription}`;
}
