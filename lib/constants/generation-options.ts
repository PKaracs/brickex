import {
  Square,
  RectangleVertical,
  Smartphone,
  RectangleHorizontal,
  Focus,
  User,
  UserSquare2,
  Maximize2,
  Home,
  TreePine,
  Camera,
  Car,
  Ship,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Shirt,
  Briefcase,
  Flame,
  Crown,
  LucideIcon,
} from "lucide-react";

export interface GenerationOption {
  value: string;
  label: string;
  icon: LucideIcon;
}

export interface GenerationCategory {
  key: string;
  title: string;
  options: GenerationOption[];
}

export const frameSizeOptions: GenerationOption[] = [
  { value: "square", label: "Cuadrado (1:1)", icon: Square },
  { value: "portrait", label: "Retrato (4:5)", icon: RectangleVertical },
  { value: "story", label: "Story (9:16)", icon: Smartphone },
  { value: "cinema", label: "Cinema (16:9)", icon: RectangleHorizontal },
];

export const shotTypeOptions: GenerationOption[] = [
  { value: "closeup", label: "Primer plano", icon: Focus },
  { value: "halfbody", label: "Medio cuerpo", icon: User },
  { value: "fullfit", label: "Cuerpo completo", icon: UserSquare2 },
  { value: "wide", label: "Escena amplia", icon: Maximize2 },
];

export const sceneTypeOptions: GenerationOption[] = [
  { value: "indoor", label: "Lujo interior", icon: Home },
  { value: "outdoor", label: "Exterior flex", icon: TreePine },
  { value: "studio", label: "Sesion de estudio", icon: Camera },
  { value: "car", label: "Car / Jet", icon: Car },
  { value: "yacht", label: "Yacht / Pool", icon: Ship },
];

export const timeOfDayOptions: GenerationOption[] = [
  { value: "morning", label: "Brillo de manana", icon: Sunrise },
  { value: "midday", label: "Mediodia limpio", icon: Sun },
  { value: "golden", label: "Hora dorada", icon: Sunset },
  { value: "night", label: "Modo noche", icon: Moon },
];

export const fitStyleOptions: GenerationOption[] = [
  { value: "casual", label: "Casual cool", icon: Shirt },
  { value: "ceo", label: "Traje ejecutivo", icon: Briefcase },
  { value: "streetwear", label: "Streetwear", icon: Flame },
  { value: "designer", label: "Look de disenador", icon: Crown },
];

export const generationCategories: GenerationCategory[] = [
  { key: "frameSize", title: "Tamano de encuadre", options: frameSizeOptions },
  { key: "shotType", title: "Tipo de toma", options: shotTypeOptions },
  { key: "sceneType", title: "Tipo de escena", options: sceneTypeOptions },
  { key: "timeOfDay", title: "Hora del dia", options: timeOfDayOptions },
  { key: "fitStyle", title: "Estilo de outfit", options: fitStyleOptions },
];
