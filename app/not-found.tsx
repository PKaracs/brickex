import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Subtle glow effect */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[400px]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_35%_at_50%_30%,rgba(255,255,255,0.01),transparent_60%)]" />
        </div>

        <div className="relative">
          {/* Headline */}
          <h1 className="text-balance text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.1] tracking-tight mb-4">
            <span className="text-neutral-300">This page doesn't exist.</span>
            <br />
            <span className="text-neutral-400">
              That render never made it to the board.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 max-w-lg mx-auto text-base sm:text-lg leading-relaxed text-neutral-500">
            The scene you asked for isn&apos;t in this project.
            <br />
            Head back to BrickEx and keep building renders, diagrams, and decks.
          </p>

          {/* CTA Button */}
          <div className="mt-8">
            <Button
              asChild
              variant="default"
              size="lg"
              className="inline-flex items-center gap-2"
            >
              <Link href="/">
                <Home className="h-4 w-4" />
                Back to BrickEx
              </Link>
            </Button>
          </div>

          {/* Micro-copy */}
          <p className="mt-12 text-xs text-neutral-600">
            No elevations were lost in the making of this 404.
          </p>
        </div>
      </div>
    </div>
  );
}
