export {
  AB_VARIANTS,
  AB_VARIANT_COOKIE,
  AB_VARIANT_STORAGE_KEY,
  isValidVariant,
  type ABVariant,
} from "./ab-test-constants";

import { type ABVariant, AB_VARIANTS } from "./ab-test-constants";

export async function assignAndSaveVariant(
  userId: string,
  email?: string
): Promise<ABVariant> {
  return AB_VARIANTS.A;
}

export async function getUserVariant(
  userId: string
): Promise<ABVariant | null> {
  return AB_VARIANTS.A;
}

export async function getEffectiveUserVariant(
  userId: string
): Promise<ABVariant> {
  return AB_VARIANTS.A;
}
