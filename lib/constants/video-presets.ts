import type { LucideIcon } from "lucide-react";
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  MoveRight,
  Plane,
  Pause,
  Clock,
  Hammer,
  Sun,
  Sunrise,
  CloudRain,
  TreePine,
  Users,
  Snowflake,
  Flame,
} from "lucide-react";

export interface VideoPreset {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  prompt: string;
  gradient: string;
}

export const VIDEO_PRESETS: VideoPreset[] = [
  {
    id: "orbit",
    label: "Orbit",
    description: "Camera orbits around the subject in a smooth arc",
    icon: RotateCcw,
    prompt:
      "Smooth cinematic orbit shot rotating around the subject, revealing all angles with fluid continuous motion, professional cinematography",
    gradient: "from-violet-600/30 to-indigo-900/30",
  },
  {
    id: "zoom-in",
    label: "Zoom In",
    description: "Dramatic push-in towards the focal point",
    icon: ZoomIn,
    prompt:
      "Slow dramatic zoom in towards the center of the frame, gradually revealing fine details and textures, cinematic focus pull",
    gradient: "from-cyan-600/30 to-blue-900/30",
  },
  {
    id: "zoom-out",
    label: "Zoom Out",
    description: "Pull back to reveal the full scene",
    icon: ZoomOut,
    prompt:
      "Smooth pull-back zoom out revealing the full environment and context of the scene, wide establishing shot",
    gradient: "from-emerald-600/30 to-teal-900/30",
  },
  {
    id: "pan-left",
    label: "Pan Left",
    description: "Horizontal sweep from right to left",
    icon: ArrowLeft,
    prompt:
      "Smooth horizontal camera pan sweeping from right to left across the scene, revealing the environment steadily",
    gradient: "from-amber-600/30 to-orange-900/30",
  },
  {
    id: "pan-right",
    label: "Pan Right",
    description: "Horizontal sweep from left to right",
    icon: ArrowRight,
    prompt:
      "Smooth horizontal camera pan sweeping from left to right across the scene, steady cinematic reveal",
    gradient: "from-rose-600/30 to-pink-900/30",
  },
  {
    id: "tilt-up",
    label: "Tilt Up",
    description: "Vertical sweep looking upward",
    icon: ArrowUp,
    prompt:
      "Cinematic vertical tilt upward from ground level towards the sky, revealing height and grandeur of the architecture",
    gradient: "from-sky-600/30 to-blue-900/30",
  },
  {
    id: "tilt-down",
    label: "Tilt Down",
    description: "Vertical sweep looking downward",
    icon: ArrowDown,
    prompt:
      "Cinematic vertical tilt downward from elevated view to ground, descending through the scene gracefully",
    gradient: "from-fuchsia-600/30 to-purple-900/30",
  },
  {
    id: "dolly-forward",
    label: "Dolly In",
    description: "Camera physically moves forward through space",
    icon: MoveRight,
    prompt:
      "Smooth dolly-in shot moving physically forward through the space with visible parallax, depth and dimension",
    gradient: "from-lime-600/30 to-green-900/30",
  },
  {
    id: "flyover",
    label: "Flyover",
    description: "Aerial drone-style sweeping descent",
    icon: Plane,
    prompt:
      "Dramatic aerial flyover shot, drone-style camera descending and pulling back over the scene from above, sweeping cinematic movement",
    gradient: "from-orange-600/30 to-red-900/30",
  },
  {
    id: "static",
    label: "Static",
    description: "No camera motion, subtle ambient movement only",
    icon: Pause,
    prompt:
      "Static locked-off camera with zero movement, only subtle ambient motion such as gentle wind on foliage, drifting clouds, shifting natural light",
    gradient: "from-neutral-600/30 to-neutral-900/30",
  },
];

export function getPresetById(id: string): VideoPreset | undefined {
  return VIDEO_PRESETS.find((p) => p.id === id);
}

// ============================================================
// SCENE / STORY PRESETS
// These are full cinematic story presets that describe a narrative
// transformation of the building/scene over time.
// ============================================================

export interface VideoScenePreset {
  id: string;
  label: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  prompt: string;
  gradient: string;
  /** Optional preview video URL */
  previewUrl?: string;
}

export const VIDEO_SCENE_PRESETS: VideoScenePreset[] = [
  {
    id: "construction-rise",
    label: "Construction Rise",
    tagline: "From plot to skyline",
    description:
      "Watch the building rise from an empty plot of land. The ground breaks, foundations are poured, steel beams climb skyward, and the finished structure emerges in a dramatic time-lapse.",
    icon: Hammer,
    prompt:
      "Ultra-realistic cinematic time-lapse of a building being constructed from scratch. Begin with a barren empty plot of dirt and rubble. Heavy machinery arrives, excavators dig foundations. Steel rebar and concrete columns rise floor by floor. Construction cranes swing overhead. Workers in hard hats move across scaffolding. Glass curtain walls are installed panel by panel. The building grows taller and taller from the ground up, each floor materializing in rapid succession. Finally the completed building stands gleaming against the sky, polished and pristine. Dramatic orchestral score, dust particles catching golden sunlight, hyper-detailed 8K photorealistic construction time-lapse.",
    gradient: "from-amber-500/30 to-orange-900/30",
  },
  {
    id: "day-to-night",
    label: "Day to Night",
    tagline: "Golden hour to city lights",
    description:
      "The building transitions from bright daylight through golden hour, into a moody sunset, and finally a dramatic nightscape with interior lights glowing warm.",
    icon: Sun,
    prompt:
      "Breathtaking cinematic day-to-night time-lapse of an architectural building. Start in crisp bright daylight with sharp shadows and blue sky. The sun arcs across the sky, light shifts warm golden, casting long dramatic shadows across the facade. Clouds drift overhead painting colours on the surfaces. Golden hour bathes everything in amber warmth. The sky transitions through vivid orange, deep pink, and rich purple sunset tones. Twilight descends, the sky deepens to navy blue. Interior lights flicker on room by room, glowing warm amber through glass windows. Street lights ignite. The building becomes a beacon of light against the dark sky. Stars appear. Reflections shimmer on wet pavement. Ultra cinematic 8K photorealistic time-lapse with smooth light transitions.",
    gradient: "from-orange-500/30 to-indigo-900/30",
  },
  {
    id: "sunrise-reveal",
    label: "Sunrise Reveal",
    tagline: "Dawn breaks over your design",
    description:
      "A cinematic sunrise emerges behind the building, painting it in warm light as the world wakes up around it. Birds take flight, morning mist lifts.",
    icon: Sunrise,
    prompt:
      "Cinematic sunrise reveal of an architectural masterpiece. Begin in deep pre-dawn darkness, only faint silhouette visible. A thin line of gold appears on the horizon. The sky ignites with bands of coral, tangerine, and rose. The first rays of sunlight strike the top of the building, slowly creeping down the facade illuminating every detail. Morning mist swirls at ground level, catching light beams. Dew glistens on surfaces. Birds take flight in silhouette across the glowing sky. The building is gradually revealed in full glory, bathed in warm golden morning light. Lens flares kiss the edges. Ultra-dramatic 8K cinematic dawn reveal with volumetric god rays.",
    gradient: "from-rose-500/30 to-amber-900/30",
  },
  {
    id: "four-seasons",
    label: "Four Seasons",
    tagline: "Spring bloom to winter frost",
    description:
      "The building experiences all four seasons — spring blossoms, lush summer greenery, autumn foliage, and a serene winter snowscape.",
    icon: TreePine,
    prompt:
      "Magnificent cinematic four-seasons time-lapse of a building through an entire year. Spring: cherry blossom trees burst into pink and white flowers, fresh green grass emerges, soft rain drizzles, everything feels alive and renewed. Summer: lush deep green canopy, vibrant flowers in full bloom, brilliant blue sky, sharp crisp shadows, people enjoying the outdoors. Autumn: leaves transform into spectacular reds, oranges, and golds, falling gently through the air, warm amber light, puddles reflecting the colourful canopy. Winter: first snowflakes drift down, frost crystallizes on every surface, snow blankets the ground and rooftops, warm light glows from inside, icicles hang from edges, breath-visible cold air. Seamless transitions between seasons, ultra-photorealistic 8K cinematic time-lapse.",
    gradient: "from-emerald-500/30 to-blue-900/30",
  },
  {
    id: "weather-drama",
    label: "Storm Passing",
    tagline: "Calm, chaos, calm again",
    description:
      "Dramatic storm clouds roll in, rain lashes the building, lightning illuminates the facade, then skies clear to reveal a stunning rainbow.",
    icon: CloudRain,
    prompt:
      "Dramatic cinematic storm time-lapse over a building. Begin with serene clear skies, gentle breeze. Dark ominous storm clouds rush in from the horizon, sky turns deep grey and purple. Wind intensifies, trees bend and sway violently. Heavy rain begins hammering every surface, water streaming down glass facades, splashing on concrete. Dramatic lightning bolts crack across the sky illuminating the entire building in split-second white flash. Thunder rumbles. Rain intensifies to a torrential downpour, sheets of water cascade. Then gradually the storm passes, clouds break apart, golden sunlight pierces through revealing a vivid double rainbow arcing behind the building. Wet surfaces gleam and reflect. Everything looks fresh and renewed. Ultra-cinematic 8K dramatic weather time-lapse with volumetric rain and lightning effects.",
    gradient: "from-slate-500/30 to-purple-900/30",
  },
  {
    id: "people-timelapse",
    label: "Life in Motion",
    tagline: "A day of human activity",
    description:
      "Time-lapse of people flowing through and around the building — morning rush, midday activity, evening wind-down. The building pulses with life.",
    icon: Users,
    prompt:
      "Cinematic human-activity time-lapse around an architectural building throughout a full day. Early morning: a lone jogger passes, delivery trucks arrive, the first lights turn on. Morning rush: streams of people pour in through entrances, cars flow through nearby streets, the building awakens. Midday: the space buzzes with life, people sit on benches, walk through plazas, sunlight is at its peak, shadows are shortest. Afternoon: activity shifts, school children pass by, cyclists weave through, clouds cast moving shadows. Evening: golden hour light, people leave in waves, street lights turn on, the building transitions from work to leisure. Night: the building glows warm, scattered figures walk past, the city calms. Long-exposure light trails from passing vehicles streak through the scene. Ultra-photorealistic 8K cinematic life time-lapse.",
    gradient: "from-blue-500/30 to-violet-900/30",
  },
  {
    id: "snow-blanket",
    label: "Snowfall",
    tagline: "Silent winter transformation",
    description:
      "A tranquil snowstorm slowly blankets the building and its surroundings in pristine white, transforming the scene into a winter wonderland.",
    icon: Snowflake,
    prompt:
      "Serene cinematic snowfall time-lapse over an architectural building. Begin with the building under overcast grey winter sky, bare trees, cold atmosphere. The first delicate snowflakes begin to drift down, sparse at first, catching the ambient light. Snow gradually intensifies, millions of flakes swirling in gentle eddies. A thin white layer forms on every horizontal surface — rooftops, ledges, railings, ground. Snow accumulates steadily, transforming the scene inch by inch. Trees become laden with white. The ground disappears under a smooth pristine blanket. Footprints form and quickly fill in. The building emerges as a warm refuge, interior lights glowing golden against the cold white exterior. Everything is hushed, muffled, peaceful. A magical winter wonderland. Ultra-detailed 8K photorealistic snowfall time-lapse with individually visible snowflakes and volumetric atmosphere.",
    gradient: "from-sky-400/30 to-slate-900/30",
  },
  {
    id: "fire-glow",
    label: "Dramatic Lighting",
    tagline: "Cinematic mood shift",
    description:
      "The building is bathed in dramatic, shifting cinematic lighting — warm amber pools, cool blue washes, theatrical spotlights sculpting the architecture.",
    icon: Flame,
    prompt:
      "Ultra-cinematic dramatic lighting showcase of an architectural building at night. Begin in darkness, the building barely visible as a silhouette. A single warm spotlight fades up, washing the lower facade in deep amber. Additional lights activate one by one — cool blue uplights along the base, warm golden floods on the upper floors, theatrical magenta accents on architectural details. Light sweeps across surfaces, creating dramatic pools and deep shadows. Volumetric beams cut through atmospheric haze. The lighting shifts and morphs — sometimes moody and mysterious with heavy contrast, sometimes warm and inviting. Reflections dance on glass and polished surfaces. The building becomes a sculptural light installation, every angle and detail accentuated by the choreographed illumination. Ultra-cinematic 8K architectural lighting with volumetric fog and lens effects.",
    gradient: "from-red-500/30 to-amber-900/30",
  },
  {
    id: "timelapse-classic",
    label: "Classic Timelapse",
    tagline: "Clouds racing, shadows dancing",
    description:
      "A classic architectural time-lapse — fast-moving clouds, sweeping shadows, and the dynamic energy of time compressed around a still building.",
    icon: Clock,
    prompt:
      "Classic architectural time-lapse of a building over several hours compressed into seconds. Dramatic fast-moving clouds race across the sky, their shadows sweeping rapidly across the building facade and surrounding ground. Sunlight and shadow alternate in rhythmic patterns. The sun's position shifts visibly, light angles change dramatically, warm and cool tones alternating. People and vehicles blur into streaks of motion. Trees sway in accelerated wind. Puddles appear and evaporate. The building stands resolute and still as the world rushes around it, a monument of permanence amid constant change. Shot from a locked tripod position, ultra-stable, hyper-detailed 8K photorealistic architectural time-lapse with silky smooth cloud motion.",
    gradient: "from-teal-500/30 to-cyan-900/30",
  },
];

export function getScenePresetById(id: string): VideoScenePreset | undefined {
  return VIDEO_SCENE_PRESETS.find((p) => p.id === id);
}
