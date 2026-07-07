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
            Tu proximo render esta a 30 segundos
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base mb-6 sm:mb-8 max-w-md mx-auto">
            Sube un boceto, plano o modelo 3D y mira como se vuelve
            fotorrealista. Puedes subir tu archivo gratis y desbloquear la
            generacion cuando estes listo.
          </p>
          <Button
            size="lg"
            className="gap-2 h-12 min-h-[48px] px-8 text-base font-semibold w-full sm:w-auto"
            asChild
          >
            <a href={signupUrl}>
              Subir archivo
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
