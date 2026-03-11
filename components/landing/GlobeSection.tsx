"use client";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";
import { MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSignupUrl } from "@/lib/app-url";

// Luxury locations
const LUXURY_LOCATIONS = [
  // Left side (top to bottom)
  { name: "Monaco", emoji: "🛥️" },
  { name: "St. Moritz", emoji: "🏔️" },
  { name: "Ibiza", emoji: "🎧" },
  { name: "St. Tropez", emoji: "☀️" },
  { name: "Mykonos", emoji: "🏛️" },
  // Right side (top to bottom)
  { name: "Courchevel", emoji: "⛷️" },
  { name: "Amalfi", emoji: "🍋" },
  { name: "Dubai", emoji: "🏙️" },
  { name: "Maldives", emoji: "🏝️" },
  { name: "Aspen", emoji: "🎿" },
];

// Badge positions - symmetrical layout (5 left, 5 right)
const BADGE_POSITIONS = [
  // Left side
  { top: "5%", left: "0%" },
  { top: "22%", left: "-2%" },
  { top: "40%", left: "0%" },
  { top: "58%", left: "-2%" },
  { top: "75%", left: "2%" },
  // Right side
  { top: "5%", right: "0%" },
  { top: "22%", right: "-2%" },
  { top: "40%", right: "0%" },
  { top: "58%", right: "-2%" },
  { top: "75%", right: "2%" },
];

// Dark globe configuration
const DARK_GLOBE_CONFIG = {
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 1,
  diffuse: 0.8,
  mapSamples: 20000,
  mapBrightness: 2,
  baseColor: [0.15, 0.15, 0.18] as [number, number, number],
  markerColor: [0.9, 0.75, 0.4] as [number, number, number],
  glowColor: [0.08, 0.08, 0.1] as [number, number, number],
  markers: [
    { location: [43.7384, 7.4246] as [number, number], size: 0.04 },
    { location: [45.4153, 6.6347] as [number, number], size: 0.04 },
    { location: [46.4908, 9.8355] as [number, number], size: 0.04 },
    { location: [40.634, 14.6027] as [number, number], size: 0.04 },
    { location: [25.2048, 55.2708] as [number, number], size: 0.04 },
    { location: [3.2028, 73.2207] as [number, number], size: 0.04 },
    { location: [39.1911, -106.8175] as [number, number], size: 0.04 },
    { location: [43.2677, 6.6407] as [number, number], size: 0.04 },
  ],
};

function LocationBadge({
  location,
  position,
}: {
  location: (typeof LUXURY_LOCATIONS)[0];
  position: (typeof BADGE_POSITIONS)[0];
}) {
  return (
    <div className="absolute" style={position}>
      <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-sm">
        <span className="text-sm">{location.emoji}</span>
        <span className="text-sm font-medium text-zinc-300">
          {location.name}
        </span>
        <MapPin className="w-3 h-3 text-amber-500" />
      </div>
    </div>
  );
}

function DarkGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let width = canvas.offsetWidth;

    const onResize = () => {
      if (canvas) width = canvas.offsetWidth;
    };
    window.addEventListener("resize", onResize);

    const globe = createGlobe(canvas, {
      ...DARK_GLOBE_CONFIG,
      width: width * 2,
      height: width * 2,
      onRender: (state) => {
        phiRef.current += 0.003;
        state.phi = phiRef.current;
        state.width = width * 2;
        state.height = width * 2;
      },
    });

    setTimeout(() => {
      if (canvas) canvas.style.opacity = "1";
    }, 0);

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full opacity-0 transition-opacity duration-700"
    />
  );
}

export default function GlobeSection() {
  const signupUrl = getSignupUrl();

  return (
    <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/30 to-transparent pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 px-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight">
            <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
              Travel anywhere in seconds.
            </span>
          </h2>
          <p className="text-zinc-400 mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
            Monaco. St. Tropez. Maldives. Dubai. Aspen.
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            <span className="text-zinc-500">
              Old Money. New Money. Questionable Money.
            </span>
          </p>
          <p className="text-zinc-500 mt-2 sm:mt-3 text-xs sm:text-sm lg:text-base">
            Drop a pin anywhere — We build the shot.
          </p>
          <div className="mt-6 sm:mt-8">
            <Button
              asChild
              variant="white"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold shadow-lg"
            >
              <a href={signupUrl}>
                Travel anywhere now
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>

        {/* Globe + scattered badges */}
        <div className="relative max-w-5xl mx-auto">
          {/* Scattered badges - desktop only */}
          <div className="hidden lg:block">
            {LUXURY_LOCATIONS.map((location, idx) => (
              <LocationBadge
                key={location.name}
                location={location}
                position={BADGE_POSITIONS[idx]}
              />
            ))}
          </div>

          {/* Globe */}
          <div className="relative w-full aspect-square max-w-[450px] mx-auto">
            <DarkGlobe />
          </div>

          {/* Mobile: pills below */}
          <div className="lg:hidden mt-8">
            <div className="flex flex-wrap justify-center gap-2.5 px-2">
              {LUXURY_LOCATIONS.slice(0, 8).map((location) => (
                <div
                  key={location.name}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-zinc-900/60 border border-zinc-800/50"
                >
                  <span className="text-sm">{location.emoji}</span>
                  <span className="text-xs font-medium text-zinc-300">
                    {location.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
