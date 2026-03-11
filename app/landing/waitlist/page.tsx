import { Metadata } from "next";
import WaitlistClient from "@/components/landing/waitlist-client";

export const metadata: Metadata = {
  title: "Join the Waitlist — BrickEx",
  description:
    "Be the first to create AI-powered photorealistic renders from your architectural plans. Join the BrickEx waitlist for early access.",
};

export default function WaitlistPage() {
  return <WaitlistClient />;
}
