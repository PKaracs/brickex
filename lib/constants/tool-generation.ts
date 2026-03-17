import "server-only";

type ToolAspectRatio =
  | "square"
  | "portrait"
  | "story"
  | "cinema"
  | "ultrawide"
  | "tallBanner"
  | "wideBanner"
  | "ultraTall"
  | "ultraWideBanner";

export interface ToolGenerationSpec {
  label: string;
  outputTitle: string;
  aspectRatio: ToolAspectRatio;
  maxInputImages: number;
  referenceInstruction: string;
  prompt: string;
  referenceImageLabel?: string;
}

export const TOOL_GENERATION_SPECS = {
  "exploded-diagram": {
    label: "Exploded Diagram",
    outputTitle: "Exploded diagram",
    aspectRatio: "square",
    maxInputImages: 1,
    referenceInstruction: `REFERENCE IMAGE - SUBJECT FIDELITY IS MANDATORY:

Use the uploaded image as the exact source of truth. Identify the primary subject and preserve its true geometry, proportions, design language, and assembly logic.

Rules:
- The generated diagram must be immediately recognizable as the same subject shown in the reference
- Ignore incidental background clutter and isolate the main subject cleanly
- Do not redesign, restyle, or replace the subject
- Only separate parts that are visible or strongly implied by the source image`,
    prompt: `Create a premium exploded axonometric diagram of the exact main subject from the reference image.

VISUAL GOAL
- Show how the subject is assembled by separating it into clean, readable layers
- The result should feel like a gallery-grade architecture or industrial design presentation board

STRUCTURAL FIDELITY
- Preserve the exact silhouette, footprint, proportions, massing, openings, structural rhythm, roof or top profile, and key detailing
- Keep the same material identity and formal language as the reference
- Break apart only logical real assemblies; do not invent fantasy fragments, extra floors, or decorative pieces

EXPLODED COMPOSITION
- Use a centered 3/4 axonometric or isometric view with the entire subject visible
- Separate the subject into logical components in correct reassembly order
- Use clean vertical spacing between layers so the assembly sequence is obvious
- Keep all layers aligned on one central axis; no chaotic drifting or random scattering
- If the subject is a building, think in systems such as site/base, podium, slabs or floor plates, structural core, facade shell, roof, crown, and attached volumes
- If the subject is a product or object, think in systems such as base, chassis, shell, internal modules, covers, and top elements

STYLE
- Refined technical illustration, not a photograph
- Crisp contour lines, disciplined edges, subtle tonal shading, and restrained material cues
- Clean off-white background with soft studio shadow and premium negative space
- Elegant, precise, legible, luxurious, and presentation-ready

NEGATIVE RULES
- No text, no labels, no arrows, no numbers, no callouts, no watermark, no logo
- No people, no busy environment, no decorative scenery unless it is integral to the subject
- No cartoon style, no messy sketchbook look, no surreal fragmentation, no dramatic perspective distortion

LIGHTING AND COLOR
- Soft neutral studio daylight from upper left
- Gentle contact shadows and high clarity
- Faithful neutralized material palette derived from the reference

Output one polished exploded diagram of the exact subject.`,
  },
  "floorplan-to-furnished": {
    label: "Empty Floorplan to Furnished",
    outputTitle: "Furnished floorplan",
    aspectRatio: "square",
    maxInputImages: 1,
    referenceInstruction: `REFERENCE IMAGE - FLOORPLAN FIDELITY IS MANDATORY:

Use the uploaded plan as the exact spatial source of truth. Preserve wall geometry, doors, windows, stairs, plumbing zones, fixed cores, circulation, and room proportions exactly.

Rules:
- Do not move walls, resize rooms, or invent extra spaces
- Keep all furniture at believable real-world scale
- Furnish only within valid usable areas and maintain clear circulation`,
    prompt: `Create a premium furnished architectural plan from the exact reference layout.

OUTPUT TYPE
- Top-down interior designer presentation plan, not a perspective render
- The underlying plan geometry must remain precise, clean, and easy to read

FURNISHING
- Populate each room with coherent modern furniture layouts appropriate to its function
- Add beds, bedside tables, sofas, coffee tables, dining arrangements, kitchen cabinetry, rugs, bathroom fixtures, storage, and lighting symbols where appropriate
- Respect door swings, window positions, circulation clearances, and realistic spacing
- Make the result feel intentionally designed, elegant, and professionally resolved

VISUAL STYLE
- Refined presentation-board aesthetic
- Crisp linework, subtle shadows, soft neutral palette, gentle material blocking, and clean negative space
- Premium architecture and interior design studio quality

NEGATIVE RULES
- No text, room labels, dimensions, arrows, legends, watermark, or logo
- No perspective view, no cutaway walls, no exterior scenery, no people
- No cluttered overfurnishing or impossible furniture scale`,
  },
  "upholstery-change": {
    label: "Upholstery Change",
    outputTitle: "Upholstery variation",
    aspectRatio: "cinema",
    maxInputImages: 1,
    referenceInstruction: `REFERENCE IMAGE - SCENE LOCK IS MANDATORY:

Use the uploaded room or furniture photo as the exact source of truth. Preserve the camera angle, crop, lighting, architecture, surrounding objects, and the exact silhouette of the main upholstered furniture piece.

Rules:
- The same room must remain immediately recognizable
- Keep the furniture shape, seams, cushions, stitching, tufting, and proportions intact
- Only the upholstery material and color should change in a believable way`,
    prompt: `Create a premium furniture-material edit of the exact same scene.

EDIT GOAL
- Change only the upholstery on the main upholstered furniture piece
- Keep everything else in the room essentially identical
- The result should feel like a high-end interior design material upgrade, not a redesign

MATERIAL RESULT
- Replace the original upholstery with a tasteful luxury finish selected to suit the existing palette, such as refined boucle, textured linen, velvet, leather, or performance weave
- Render realistic fibers, nap, stitching, folds, compression, and light response
- The new material should look physically plausible and professionally selected for the room

SCENE PRESERVATION
- Keep the same camera position, perspective, decor, windows, flooring, wall color, and lighting direction
- Match the original shadows, reflections, and overall exposure

NEGATIVE RULES
- No new furniture, no changed room layout, no altered architecture
- No moving objects around the room
- No text, watermark, logo, or split-screen comparison`,
  },
  "moodboard-to-render": {
    label: "Moodboard to Render",
    outputTitle: "Moodboard render",
    aspectRatio: "cinema",
    maxInputImages: 4,
    referenceImageLabel: "MOODBOARD IMAGE",
    referenceInstruction: `REFERENCE IMAGES - STYLE SYNTHESIS IS MANDATORY:

Treat all uploaded images as one combined moodboard. Extract their shared direction: palette, materials, furniture language, styling cues, lighting mood, and overall design personality.

Rules:
- Use all references together to build one coherent design language
- Do not create a collage, pinboard, or split-screen composition
- Synthesize the references into one resolved interior scene that feels intentional and believable`,
    prompt: `Create one photorealistic interior render distilled from the uploaded moodboard.

DESIGN SYNTHESIS
- Infer a single cohesive room concept from all of the references
- Merge the strongest recurring cues into one polished interior rather than copying any one image literally
- Keep the design elevated, consistent, and editorial, never chaotic or overdecorated

SCENE
- Show a complete professionally designed interior that clearly reflects the moodboard through architecture, furniture, materials, textiles, decor, and lighting
- Make every piece feel curated and consistent with the same design story
- Use believable spatial composition and realistic full-scale furniture

VISUAL STYLE
- Architectural Digest quality interior photography
- Rich tactile materials, subtle lived-in styling, clean composition, natural depth, premium residential or hospitality feel
- Use daylight, soft sun, or moody ambient lighting only if it matches the moodboard

NEGATIVE RULES
- No paper texture, no collage, no moodboard layout, no text, no watermark, no brand marks
- No surreal objects, mixed unrelated styles, or inconsistent room geometry`,
  },
  "render-to-isometric": {
    label: "Render to Isometric Diagram",
    outputTitle: "Isometric diagram",
    aspectRatio: "square",
    maxInputImages: 1,
    referenceInstruction: `REFERENCE IMAGE - BUILDING FIDELITY IS MANDATORY:

Use the uploaded architectural render as the exact source of truth for the building's massing, footprint, openings, terraces, facade rhythm, roof profile, and site organization.

Rules:
- Preserve the subject so it remains instantly recognizable as the same project
- Simplify the rendering style, not the architecture itself
- Keep only essential context tied to the building and site`,
    prompt: `Create a clean isometric presentation diagram of the exact same architecture.

TRANSFORMATION GOAL
- Convert the photoreal render into a faithful isometric or axonometric architectural illustration
- Preserve the building identity while simplifying the scene into a clear presentation graphic

STYLE
- Crisp contour lines, flat-shaded masses, restrained material differentiation, soft ambient shadow, and premium presentation-board clarity
- Refined palette of warm neutrals, muted glass blues, stone tones, and subdued greenery
- Elegant, minimal, legible, and professional

COMPOSITION
- Use a stable isometric angle with the full building visible
- Show major terraces, podium elements, roof features, and key landscape or hardscape pieces when relevant
- Clean off-white or pale warm gray background with generous negative space

NEGATIVE RULES
- No labels, no arrows, no annotations, no watermark, no logo
- No people, no dramatic sky, no messy sketch effect, no exploded parts
- No photoreal camera artifacts or cinematic depth of field`,
  },
  "floorplan-to-3d": {
    label: "Floorplan to 3D Diagram",
    outputTitle: "3D floorplan diagram",
    aspectRatio: "square",
    maxInputImages: 1,
    referenceInstruction: `REFERENCE IMAGE - PLAN FIDELITY IS MANDATORY:

Use the uploaded floor plan as the exact source of truth. Preserve room arrangement, wall positions, openings, stairs, shafts, structural elements, and circulation exactly.

Rules:
- Do not invent extra rooms, change adjacencies, or distort the footprint
- The resulting diagram must remain traceable back to the original floor plan
- Add furniture or program elements only to clarify room use`,
    prompt: `Create a clean 3D axonometric cutaway diagram from the exact floor plan.

SPATIAL GOAL
- Translate the flat plan into a readable three-dimensional spatial diagram
- Keep the layout exact while making the rooms instantly understandable in 3D

OUTPUT
- Use a 45-degree axonometric or isometric cutaway view
- Show walls partially cut down or lifted just enough to reveal the interior organization
- Add believable program elements and furniture only where they help explain the layout

STYLE
- Architectural model aesthetic with soft daylight, subtle shadows, restrained material hints, and a warm neutral palette
- Presentation-ready, elegant, professional, and easy to read
- Clean background and balanced composition with the full plan visible

NEGATIVE RULES
- No text, labels, dimensions, people, watermark, or logo
- No dramatic perspective distortion, no photoreal lifestyle scene, no sketchy doodle style
- No altered room arrangement or speculative extra levels`,
  },
  "landscape-generator": {
    label: "Landscape Generator",
    outputTitle: "Landscape visualization",
    aspectRatio: "cinema",
    maxInputImages: 1,
    referenceInstruction: `REFERENCE IMAGE - SITE LAYOUT FIDELITY IS MANDATORY:

Use the uploaded sketch, site image, or concept drawing as the exact guide for the site's geometry, hardscape zones, planting beds, path alignment, water features, and major landscape masses.

Rules:
- If the input is a sketch, preserve the sketched layout while elevating it into a resolved design
- If the input is an existing site photo, redesign within the same footprint and viewpoint
- Keep the landscape believable, buildable, and scaled correctly`,
    prompt: `Create a premium landscape design visualization of the exact site from the reference.

DESIGN GOAL
- Turn the reference into a fully resolved outdoor environment with coherent hardscape, layered planting, elegant circulation, and balanced composition
- Make the result feel contemporary, intentional, and luxurious without overfilling the site

SCENE
- Include believable paving, planting beds, trees, shrubs, lawn or gravel areas, seating zones, feature lighting, and water elements when supported by the reference
- Keep all design moves aligned with the reference layout and scale
- Ensure the spatial organization remains clear and professionally planned

VISUAL STYLE
- High-end landscape photography or premium aerial/site visualization depending on the input viewpoint
- Rich vegetation texture, realistic shadows, clean daylight or warm golden hour, refined residential or hospitality quality

NEGATIVE RULES
- No text, handwritten notes, paper background, watermark, or logo
- No fantasy scenery unrelated to the site
- No impossible plant scale, overgrown chaos, or theme-park effects`,
  },
} as const satisfies Record<string, ToolGenerationSpec>;

export type SupportedToolId = keyof typeof TOOL_GENERATION_SPECS;

export function isSupportedToolId(toolId: string): toolId is SupportedToolId {
  return toolId in TOOL_GENERATION_SPECS;
}
