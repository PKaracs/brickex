import { getUserSubscription } from "@/lib/actions/get-user-subscription";
import PricingPageClient from "./pricing-client";

export const metadata = {
  title: "Choose Your Plan | BrickEx",
  description: "Unlock unlimited AI real estate renders with BrickEx Pro",
};

export default async function PricingPage() {
  const subscriptionResult = await getUserSubscription();
  const subscription =
    "error" in subscriptionResult ? null : subscriptionResult;

  return (
    <PricingPageClient 
      subscription={subscription} 
      variant={null}
    />
  );
}
