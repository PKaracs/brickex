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
  /** Optional preview video URL */
  previewUrl?: string;
}

export const VIDEO_PRESETS: VideoPreset[] = [
  {
    id: "orbit",
    label: "Orbita",
    description: "La camara orbita alrededor del sujeto en un arco suave",
    icon: RotateCcw,
    prompt:
      "Toma cinematografica de orbita suave alrededor del sujeto, revelando todos los angulos con movimiento continuo y fluido, cinematografia profesional",
    gradient: "from-violet-600/30 to-indigo-900/30",
  },
  {
    id: "zoom-in",
    label: "Acercamiento",
    description: "Avance dramatico hacia el punto focal",
    icon: ZoomIn,
    prompt:
      "Acercamiento dramatico lento hacia el centro del encuadre, revelando detalles y texturas gradualmente, con cambio de foco cinematografico",
    gradient: "from-cyan-600/30 to-blue-900/30",
  },
  {
    id: "zoom-out",
    label: "Alejamiento",
    description: "Retrocede para revelar toda la escena",
    icon: ZoomOut,
    prompt:
      "Alejamiento suave revelando todo el entorno y contexto de la escena, plano general amplio",
    gradient: "from-emerald-600/30 to-teal-900/30",
  },
  {
    id: "pan-left",
    label: "Paneo izquierda",
    description: "Barrido horizontal de derecha a izquierda",
    icon: ArrowLeft,
    prompt:
      "Paneo horizontal suave de derecha a izquierda por la escena, revelando el entorno de forma estable",
    gradient: "from-amber-600/30 to-orange-900/30",
  },
  {
    id: "pan-right",
    label: "Paneo derecha",
    description: "Barrido horizontal de izquierda a derecha",
    icon: ArrowRight,
    prompt:
      "Paneo horizontal suave de izquierda a derecha por la escena, revelado cinematografico estable",
    gradient: "from-rose-600/30 to-pink-900/30",
  },
  {
    id: "tilt-up",
    label: "Tilt arriba",
    description: "Barrido vertical mirando hacia arriba",
    icon: ArrowUp,
    prompt:
      "Tilt vertical cinematografico desde nivel de suelo hacia el cielo, revelando altura y escala de la arquitectura",
    gradient: "from-sky-600/30 to-blue-900/30",
  },
  {
    id: "tilt-down",
    label: "Tilt abajo",
    description: "Barrido vertical mirando hacia abajo",
    icon: ArrowDown,
    prompt:
      "Tilt vertical cinematografico desde una vista elevada hacia el suelo, descendiendo por la escena con suavidad",
    gradient: "from-fuchsia-600/30 to-purple-900/30",
  },
  {
    id: "dolly-forward",
    label: "Dolly adelante",
    description: "La camara avanza fisicamente por el espacio",
    icon: MoveRight,
    prompt:
      "Dolly-in suave avanzando fisicamente por el espacio con paralaje visible, profundidad y dimension",
    gradient: "from-lime-600/30 to-green-900/30",
  },
  {
    id: "flyover",
    label: "Sobrevuelo",
    description: "Descenso aereo con estilo de drone",
    icon: Plane,
    prompt:
      "Sobrevuelo aereo dramatico, camara estilo drone descendiendo y alejandose sobre la escena desde arriba, movimiento cinematografico amplio",
    gradient: "from-orange-600/30 to-red-900/30",
    previewUrl:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/videos/flyover.mp4",
  },
  {
    id: "static",
    label: "Estatico",
    description: "Sin movimiento de camara, solo movimiento ambiental sutil",
    icon: Pause,
    prompt:
      "Camara estatica bloqueada sin movimiento, solo movimiento ambiental sutil como viento suave en vegetacion, nubes desplazandose y luz natural cambiante",
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
    label: "Construccion en ascenso",
    tagline: "Del terreno al skyline",
    description:
      "Mira como el edificio se levanta desde un terreno vacio. Se abre el suelo, se vierten cimientos, las vigas suben hacia el cielo y la estructura terminada aparece en un timelapse dramatico.",
    icon: Hammer,
    prompt:
      "Timelapse cinematografico ultrarrealista de un edificio construido desde cero. Empieza con un terreno vacio de tierra y escombros. Llega maquinaria pesada, excavadoras abren cimientos. Armaduras de acero y columnas de hormigon suben planta por planta. Gruas giran sobre la obra. Trabajadores con casco se mueven por andamios. Los muros cortina de vidrio se instalan panel a panel. El edificio crece desde el suelo, cada planta aparece en sucesion rapida. Al final el edificio terminado brilla contra el cielo, pulido e impecable. Polvo atrapando luz dorada, timelapse de construccion fotorrealista 8K hiper detallado.",
    gradient: "from-amber-500/30 to-orange-900/30",
    previewUrl:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/videos/construction.mp4",
  },
  // {
  //   id: "day-to-night",
  //   label: "Day to Night",
  //   tagline: "Golden hour to city lights",
  //   description:
  //     "The building transitions from bright daylight through golden hour, into a moody sunset, and finally a dramatic nightscape with interior lights glowing warm.",
  //   icon: Sun,
  //   prompt:
  //     "Breathtaking cinematic day-to-night time-lapse of an architectural building. Start in crisp bright daylight with sharp shadows and blue sky. The sun arcs across the sky, light shifts warm golden, casting long dramatic shadows across the facade. Clouds drift overhead painting colours on the surfaces. Golden hour bathes everything in amber warmth. The sky transitions through vivid orange, deep pink, and rich purple sunset tones. Twilight descends, the sky deepens to navy blue. Interior lights flicker on room by room, glowing warm amber through glass windows. Street lights ignite. The building becomes a beacon of light against the dark sky. Stars appear. Reflections shimmer on wet pavement. Ultra cinematic 8K photorealistic time-lapse with smooth light transitions.",
  //   gradient: "from-orange-500/30 to-indigo-900/30",
  // },
  // {
  //   id: "sunrise-reveal",
  //   label: "Sunrise Reveal",
  //   tagline: "Dawn breaks over your design",
  //   description:
  //     "A cinematic sunrise emerges behind the building, painting it in warm light as the world wakes up around it. Birds take flight, morning mist lifts.",
  //   icon: Sunrise,
  //   prompt:
  //     "Cinematic sunrise reveal of an architectural masterpiece. Begin in deep pre-dawn darkness, only faint silhouette visible. A thin line of gold appears on the horizon. The sky ignites with bands of coral, tangerine, and rose. The first rays of sunlight strike the top of the building, slowly creeping down the facade illuminating every detail. Morning mist swirls at ground level, catching light beams. Dew glistens on surfaces. Birds take flight in silhouette across the glowing sky. The building is gradually revealed in full glory, bathed in warm golden morning light. Lens flares kiss the edges. Ultra-dramatic 8K cinematic dawn reveal with volumetric god rays.",
  //   gradient: "from-rose-500/30 to-amber-900/30",
  // },
  {
    id: "four-seasons",
    label: "Cuatro estaciones",
    tagline: "De floracion primaveral a escarcha invernal",
    description:
      "El edificio vive las cuatro estaciones: flores de primavera, vegetacion de verano, hojas de otono y un paisaje invernal sereno.",
    icon: TreePine,
    prompt:
      "Timelapse cinematografico magnifico de un edificio durante todo un ano. Primavera: flores rosas y blancas, hierba fresca, lluvia suave, todo se siente vivo y renovado. Verano: copa verde profunda, flores vibrantes, cielo azul brillante, sombras nítidas, personas disfrutando del exterior. Otono: hojas rojas, naranjas y doradas caen suavemente, luz ambar y charcos reflejando la vegetacion. Invierno: copos de nieve, escarcha en superficies, nieve cubriendo suelo y cubiertas, luz interior calida e icicles en bordes. Transiciones fluidas entre estaciones, timelapse cinematografico 8K ultrafotorrealista.",
    gradient: "from-emerald-500/30 to-blue-900/30",
    previewUrl:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/videos/fourseasons.mp4",
  },
  {
    id: "weather-drama",
    label: "Tormenta pasajera",
    tagline: "Calma, caos y calma otra vez",
    description:
      "Nubes dramaticas entran en escena, la lluvia golpea el edificio, los relampagos iluminan la fachada y luego el cielo se abre para revelar un arcoiris.",
    icon: CloudRain,
    prompt:
      "Timelapse cinematografico dramatico de tormenta sobre un edificio. Empieza con cielo despejado y brisa suave. Nubes oscuras entran desde el horizonte, el cielo se vuelve gris y purpura. El viento se intensifica, los arboles se doblan y se balancean. La lluvia golpea cada superficie, el agua baja por fachadas de vidrio y salpica el hormigon. Relampagos iluminan todo el edificio en destellos blancos. La lluvia se vuelve torrencial y luego la tormenta pasa gradualmente, las nubes se abren y la luz dorada revela un arcoiris doble. Superficies mojadas brillan y reflejan. Timelapse meteorologico 8K ultracinematografico con lluvia volumetrica y relampagos.",
    gradient: "from-slate-500/30 to-purple-900/30",
    previewUrl:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/videos/storm.mp4",
  },
  {
    id: "people-timelapse",
    label: "Vida en movimiento",
    tagline: "Un dia de actividad humana",
    description:
      "Timelapse de personas entrando, saliendo y rodeando el edificio: hora punta, actividad de mediodia y calma de tarde. El edificio late con vida.",
    icon: Users,
    prompt:
      "Timelapse cinematografico de actividad humana alrededor de un edificio durante un dia completo. Manana temprana: pasa una persona corriendo, llegan entregas y se encienden las primeras luces. Hora punta: flujos de personas entran por accesos, coches circulan por calles cercanas y el edificio despierta. Mediodia: el espacio vibra con vida, personas se sientan en bancos y cruzan plazas. Tarde: cambia la actividad, pasan ciclistas y nubes proyectan sombras. Atardecer: golden hour, la gente sale en oleadas y se encienden farolas. Noche: el edificio brilla calido y la ciudad se calma. Estelas de luz de larga exposicion atraviesan la escena. Timelapse de vida 8K ultrafotorrealista.",
    gradient: "from-blue-500/30 to-violet-900/30",
    previewUrl:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/videos/life-people.mp4",
  },
  {
    id: "snow-blanket",
    label: "Nevada",
    tagline: "Transformacion invernal silenciosa",
    description:
      "Una nevada tranquila cubre poco a poco el edificio y su entorno de blanco, transformando la escena en un paisaje invernal.",
    icon: Snowflake,
    prompt:
      "Timelapse cinematografico sereno de nevada sobre un edificio. Empieza con cielo gris invernal, arboles desnudos y atmosfera fria. Los primeros copos delicados caen lentamente, al principio escasos, atrapando la luz ambiente. La nieve se intensifica y millones de copos giran suavemente. Una capa blanca se forma en cubiertas, bordes, barandillas y suelo. La nieve se acumula, transformando la escena poco a poco. Los arboles se cargan de blanco y el suelo desaparece bajo una manta limpia. El edificio emerge como refugio calido, con luces interiores doradas frente al exterior frio. Timelapse fotorrealista 8K ultradetallado con atmosfera volumetrica.",
    gradient: "from-sky-400/30 to-slate-900/30",
    previewUrl:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/videos/snow-falling.mp4",
  },
  // {
  //   id: "fire-glow",
  //   label: "Dramatic Lighting",
  //   tagline: "Cinematic mood shift",
  //   description:
  //     "The building is bathed in dramatic, shifting cinematic lighting — warm amber pools, cool blue washes, theatrical spotlights sculpting the architecture.",
  //   icon: Flame,
  //   prompt:
  //     "Ultra-cinematic dramatic lighting showcase of an architectural building at night. Begin in darkness, the building barely visible as a silhouette. A single warm spotlight fades up, washing the lower facade in deep amber. Additional lights activate one by one — cool blue uplights along the base, warm golden floods on the upper floors, theatrical magenta accents on architectural details. Light sweeps across surfaces, creating dramatic pools and deep shadows. Volumetric beams cut through atmospheric haze. The lighting shifts and morphs — sometimes moody and mysterious with heavy contrast, sometimes warm and inviting. Reflections dance on glass and polished surfaces. The building becomes a sculptural light installation, every angle and detail accentuated by the choreographed illumination. Ultra-cinematic 8K architectural lighting with volumetric fog and lens effects.",
  //   gradient: "from-red-500/30 to-amber-900/30",
  // },
  {
    id: "timelapse-classic",
    label: "Timelapse clasico",
    tagline: "Nubes rapidas y sombras en movimiento",
    description:
      "Un timelapse arquitectonico clasico: nubes veloces, sombras que barren la fachada y energia dinamica del tiempo comprimido alrededor de un edificio inmovil.",
    icon: Clock,
    prompt:
      "Timelapse arquitectonico clasico de un edificio durante varias horas comprimidas en segundos. Nubes dramaticas y rapidas cruzan el cielo, sus sombras barren la fachada y el suelo alrededor. Luz y sombra alternan en patrones ritmicos. La posicion del sol cambia visiblemente, los angulos de luz varian y alternan tonos calidos y frios. Personas y vehiculos se desenfocan en estelas de movimiento. Arboles se balancean con viento acelerado. Charcos aparecen y se evaporan. El edificio permanece firme mientras el mundo corre a su alrededor. Toma desde tripode fijo, ultrastable, timelapse arquitectonico fotorrealista 8K hiper detallado.",
    gradient: "from-teal-500/30 to-cyan-900/30",
    previewUrl:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/videos/timelapse.mp4",
  },
];

export function getScenePresetById(id: string): VideoScenePreset | undefined {
  return VIDEO_SCENE_PRESETS.find((p) => p.id === id);
}
