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
  { value: "square", label: "Square (1:1)", icon: Square },
  { value: "portrait", label: "Portrait (4:5)", icon: RectangleVertical },
  { value: "story", label: "Story (9:16)", icon: Smartphone },
  { value: "cinema", label: "Cinema (16:9)", icon: RectangleHorizontal },
];

export const shotTypeOptions: GenerationOption[] = [
  { value: "closeup", label: "Close-Up", icon: Focus },
  { value: "halfbody", label: "Half-Body", icon: User },
  { value: "fullfit", label: "Full Fit", icon: UserSquare2 },
  { value: "wide", label: "Wide Scene", icon: Maximize2 },
];

export const sceneTypeOptions: GenerationOption[] = [
  { value: "indoor", label: "Indoor Luxury", icon: Home },
  { value: "outdoor", label: "Outdoor Flex", icon: TreePine },
  { value: "studio", label: "Studio Shoot", icon: Camera },
  { value: "car", label: "Car / Jet", icon: Car },
  { value: "yacht", label: "Yacht / Pool", icon: Ship },
];

export const timeOfDayOptions: GenerationOption[] = [
  { value: "morning", label: "Morning Glow", icon: Sunrise },
  { value: "midday", label: "Midday Clean", icon: Sun },
  { value: "golden", label: "Golden Hour", icon: Sunset },
  { value: "night", label: "Night Mode", icon: Moon },
];

export const fitStyleOptions: GenerationOption[] = [
  { value: "casual", label: "Casual Cool", icon: Shirt },
  { value: "ceo", label: "CEO Suit", icon: Briefcase },
  { value: "streetwear", label: "Streetwear", icon: Flame },
  { value: "designer", label: "Designer Drip", icon: Crown },
];

export const generationCategories: GenerationCategory[] = [
  { key: "frameSize", title: "Frame Size", options: frameSizeOptions },
  { key: "shotType", title: "Shot Type", options: shotTypeOptions },
  { key: "sceneType", title: "Scene Type", options: sceneTypeOptions },
  { key: "timeOfDay", title: "Time of Day", options: timeOfDayOptions },
  { key: "fitStyle", title: "Fit Style", options: fitStyleOptions },
];
