import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-guard";
import { hasCompletedOnboarding } from "@/lib/actions/onboarding-profile";
import { getUserSubscription } from "@/lib/actions/get-user-subscription";
import WelcomeClient from "./welcome-client";
import type { SubscriptionData } from "@/lib/actions/get-user-subscription";

interface WelcomePageProps {
  searchParams: Promise<{ preview?: string }>;
}

export default async function WelcomePage({ searchParams }: WelcomePageProps) {
  const params = await searchParams;
  // Preview mode: only works in development — never in production
  const isPreview =
    params.preview === "true" && process.env.NODE_ENV === "development";

  if (isPreview) {
    return <WelcomeClient subscription={null} isPreview />;
  }

  const userId = await requireAuth();

  // If user already completed onboarding, send them to explore
  const completed = await hasCompletedOnboarding(userId);
  if (completed) {
    redirect("/app/explore");
  }

  const subscriptionResult = await getUserSubscription();
  const subscription: SubscriptionData | null =
    "error" in subscriptionResult ? null : subscriptionResult;

  return <WelcomeClient subscription={subscription} />;
}
