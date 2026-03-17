"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { getSignupUrl } from "@/lib/app-url";

export default function CTABanner() {
  const signupUrl = getSignupUrl();

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-zinc-800">
      <div className="max-w-2xl mx-auto text-center">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
            Ready to visualize your next project?
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base mb-6 sm:mb-8 max-w-md mx-auto">
            Create an account and start generating photorealistic renders from
            your sketches, floor plans, and 3D models.
          </p>
          <Button
            size="lg"
            className="gap-2 h-12 min-h-[48px] px-8 text-base font-semibold w-full sm:w-auto"
            asChild
          >
            <a href={signupUrl}>
              Start Free
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
