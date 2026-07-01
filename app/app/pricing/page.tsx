import { getUserSubscription } from "@/lib/actions/get-user-subscription";
import PricingPageClient from "./pricing-client";

export const metadata = {
  title: "Elige tu plan | BrickEx",
  description: "Desbloquea renders inmobiliarios con IA en BrickEx",
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
