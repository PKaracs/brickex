"use server";

import { cache } from "react";

export type OnboardingGoal =
  | "flex_harder"
  | "look_wealthier"
  | "impress_everyone"
  | "just_exploring";

export type OnboardingContentType =
  | "dating"
  | "instagram"
  | "business"
  | "personal_brand"
  | "just_for_fun";

export type OnboardingCreatorType = "myself" | "ai_character";

export interface OnboardingData {
  goal: OnboardingGoal;
  contentTypes: OnboardingContentType[];
  creatorType: OnboardingCreatorType;
}

export const hasCompletedOnboarding = cache(
  async (userId: string): Promise<boolean> => {
    return true;
  }
);

export async function saveOnboardingProfile(
  data: OnboardingData
): Promise<{ success: boolean } | { error: string }> {
  return { success: true };
}

export async function skipOnboarding(): Promise<
  { success: boolean } | { error: string }
> {
  return { success: true };
}
