/**
 * Multi-Person Generation Types
 *
 * Shared types for multi-person image generation feature.
 * Person 1 can use existing avatar or upload 1-3 images.
 * Person 2+ can only upload exactly 1 image each.
 */

/** Avatar choice type - existing avatar or new upload */
export type AvatarChoice = "existing" | "upload" | null;

/**
 * Person data for the Canvas component (UI state)
 * Contains the person's avatar choice and uploaded images for display
 */
export interface PersonCanvasData {
  /** Zero-based index of this person (0 = primary user) */
  personIndex: number;
  /** How this person's face will be sourced */
  avatarChoice: AvatarChoice;
  /** Files selected for upload (displayed in UI) */
  uploadedImages: File[];
}

/**
 * Person data for project state management
 * Used in ProjectDashboard to track pending uploads
 */
export interface PersonData {
  /** How this person's face will be sourced */
  avatarChoice: AvatarChoice;
  /** Files pending upload to storage */
  pendingImages: File[];
}

/**
 * Multi-person generation constants
 */
export const MULTI_PERSON_CONSTANTS = {
  /** Maximum number of people in a single generation */
  MAX_PEOPLE: 2,
  /** Maximum images for Person 1 (primary user) */
  MAX_IMAGES_PERSON_1: 3,
  /** Maximum images for Person 2 (additional person) */
  MAX_IMAGES_ADDITIONAL: 1,
} as const;

/**
 * Get max images allowed for a person based on their index
 * @param personIndex - Zero-based index (0 = primary user)
 * @returns Maximum number of images allowed
 */
export function getMaxImagesForPerson(personIndex: number): number {
  return personIndex === 0
    ? MULTI_PERSON_CONSTANTS.MAX_IMAGES_PERSON_1
    : MULTI_PERSON_CONSTANTS.MAX_IMAGES_ADDITIONAL;
}

/**
 * Check if a person can use existing avatar
 * Only Person 1 (index 0) can use existing avatar
 * @param personIndex - Zero-based index
 * @returns Whether existing avatar option is available
 */
export function canUseExistingAvatar(personIndex: number): boolean {
  return personIndex === 0;
}
