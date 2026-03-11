import type { TeleportSelection } from "./types/teleport";
import { objects } from "@/lib/constants/object";

export interface PromptSettings {
  frameSize: string;
  shotType: string;
  sceneType: string;
  timeOfDay: string;
  fitStyle: string;
  customPrompt?: string;
  templateName?: string;
  templateDescription?: string;
  objectNames?: string[];
  multiPerson?: boolean;
  personCount?: number;
  teleport?: TeleportSelection;
  useDefaultBackground?: boolean;
}

const SHOT_TYPE_MAP: Record<string, string> = {
  closeup: "close-up portrait shot focusing on face and shoulders",
  halfbody: "half-body shot from waist up",
  fullfit: "full-body shot showing complete outfit",
  wide: "wide environmental shot with subject in scene",
};

const SCENE_TYPE_MAP: Record<string, string> = {
  indoor: "luxurious indoor setting with elegant furniture and ambient lighting",
  outdoor: "outdoor location with natural scenery and premium atmosphere",
  studio: "professional studio with clean backdrop and controlled lighting",
  car: "luxury car interior or private jet cabin",
  yacht: "yacht deck or infinity pool with ocean view",
};

const TIME_OF_DAY_MAP: Record<string, string> = {
  morning: "soft morning light with warm golden tones",
  midday: "bright clean midday lighting",
  golden: "golden hour with warm cinematic glow",
  night: "moody night atmosphere with dramatic lighting",
};

const FIT_STYLE_MAP: Record<string, string> = {
  casual: "casual cool streetwear, relaxed but stylish",
  ceo: "tailored CEO suit, professional executive look",
  streetwear: "high-end streetwear with designer pieces",
  designer: "full designer drip with luxury fashion brands",
};

export function buildGenerationPrompt(settings: PromptSettings): string {
  const shot = SHOT_TYPE_MAP[settings.shotType] || SHOT_TYPE_MAP.halfbody;
  const scene = SCENE_TYPE_MAP[settings.sceneType] || SCENE_TYPE_MAP.studio;
  const time = TIME_OF_DAY_MAP[settings.timeOfDay] || TIME_OF_DAY_MAP.golden;
  const style = FIT_STYLE_MAP[settings.fitStyle] || FIT_STYLE_MAP.designer;

  const parts: string[] = [
    "Generate a professional lifestyle photograph.",
    "",
    "SUBJECT:",
  ];

  // Handle multi-person (couple) vs single person
  if (settings.multiPerson && settings.personCount && settings.personCount > 1) {
    parts.push(
      `- ${settings.personCount} people (maintain exact face, features, skin tone from reference images for each person)`,
      "- All people should be naturally positioned in the scene together",
      "- Ensure all faces are clearly visible and well-lit"
    );
  } else {
    parts.push(
      "- A person (maintain exact face, features, skin tone from reference images)"
    );
  }

  parts.push(
    "",
    "COMPOSITION:",
    `- ${shot}`,
    `- ${scene}`,
    `- ${time}`,
    "",
    "STYLE:",
    `- Fashion: ${style}`,
    "- Mood: Confident, aspirational, luxury lifestyle aesthetic",
    "- Quality: Photorealistic, high-end fashion photography"
  );

  // Objects
  if (settings.useDefaultBackground) {
    // Free user default background — objects handled inline with the setting
    const objectList = settings.objectNames?.join(", ") || "luxury items";
    parts.push(
      "",
      "SETTING:",
      "- Place the subject in the background provided.",
      `- The person is wearing designer clothes. Include these items in the scene: ${objectList}.`,
      "- Place the items naturally in the environment - visible and prominent."
    );
  } else if (settings.objectNames && settings.objectNames.length > 0) {
    parts.push("");
    parts.push("OBJECTS TO INCLUDE:");
    parts.push(
      `- Feature these items naturally: ${settings.objectNames.join(", ")}`
    );

    parts.push(
      "- ALL objects must be REAL, FULL-SCALE items — NEVER miniatures, models, toys, maquettes, or replicas"
    );

    const hasCars = settings.objectNames.some((name) => {
      const obj = objects.find((o) => o.name === name);
      return obj?.type === "car";
    });
    const hasJets = settings.objectNames.some((name) => {
      const obj = objects.find((o) => o.name === name);
      return obj?.type === "jet";
    });
    const hasYachts = settings.objectNames.some((name) => {
      const obj = objects.find((o) => o.name === name);
      return obj?.type === "yacht";
    });

    if (hasCars) {
      parts.push(
        "- For cars: Subject can be driving or posing with the real full-size car"
      );
    }
    if (hasJets) {
      parts.push(
        "- For jets: Subject can be inside the cabin or on the tarmac with the real full-size jet"
      );
    }
    if (hasYachts) {
      parts.push(
        "- For yachts: Subject should be on the deck, at the helm, or aboard the real full-size yacht on the water"
      );
    }
  }

  // Teleport location
  if (!settings.useDefaultBackground && settings.teleport) {
    parts.push("");
    parts.push("LOCATION:");
    if (settings.teleport.mode === "exact" && settings.teleport.sv) {
      parts.push(
        "- Place the subject at this exact real-world location shown in the reference Street View photo"
      );
      parts.push(
        "- Match the architecture, street features, and atmosphere from the location reference"
      );
      parts.push(
        "- The subject should appear naturally present at this specific location"
      );
      if (settings.teleport.placeLabel) {
        parts.push(`- Location: ${settings.teleport.placeLabel}`);
      }
    } else if (settings.teleport.mode === "city") {
      const cityName = settings.teleport.city;
      const country = settings.teleport.country;
      parts.push(
        `- Place the subject in ${cityName}${country ? `, ${country}` : ""}`
      );
      parts.push(
        "- Capture the iconic atmosphere and luxury lifestyle of this destination"
      );
      parts.push(
        "- Include recognizable architectural or environmental elements typical of this location"
      );
    }
  }

  // Template
  if (!settings.useDefaultBackground && !settings.teleport) {
    if (settings.templateDescription) {
      parts.push("");
      parts.push("BACKGROUND/SETTING:");
      parts.push(
        `- Place the subject in this exact scene: ${settings.templateDescription}`
      );
      parts.push(
        "- The subject should naturally fit into this background environment"
      );
      parts.push(
        "- Maintain consistent lighting and perspective with the scene"
      );
    } else if (settings.templateName) {
      parts.push("");
      parts.push("TEMPLATE STYLE:");
      parts.push(
        `- Follow the composition and style of: ${settings.templateName}`
      );
    }
  }

  // Custom prompt
  if (settings.customPrompt && settings.customPrompt.trim()) {
    parts.push("");
    parts.push("ADDITIONAL INSTRUCTIONS:");
    parts.push(`- ${settings.customPrompt.trim()}`);
  }

  parts.push("");
  parts.push(
    "IMPORTANT: Preserve exact facial features from reference images. Photorealistic quality. No distortions."
  );

  return parts.join("\n");
}
