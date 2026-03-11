export interface FlexBreakdown {
  outfit: number;
  watch: number;
  location: number;
  vehicle: number;
  accessories: number;
}

export interface GenerationResult {
  generationId: string;
  outputKey: string;
  outputUrl?: string;
  flexWorth?: number;
  flexBreakdown?: FlexBreakdown;
}

export interface GenerationError {
  error: string;
  requiresUpgrade?: boolean;
  requiresAvatarReupload?: boolean;
  isNsfwError?: boolean;
  isProUser?: boolean;
  planSlug?: string;
  redirectToPricing?: boolean;
}

import type { TeleportSelection } from "@/lib/types/teleport";

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
}

export interface ProjectWithRelations {
  id: string;
  sourceType: string | null;
  advancedSettings?: Record<string, unknown> | null;
  customPrompt: string | null;
  templateId: string | null; // ID from constants
  inputImages: { storageKey: string }[];
  objects: { objectId?: string | null; objectName: string | null }[];
}
