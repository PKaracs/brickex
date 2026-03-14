"use client";

import { cn } from "@/lib/utils";
import type { InteriorTexture } from "@/lib/constants/interior-textures";

interface TextureBallProps {
  texture: InteriorTexture;
  isSelected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-14 h-14",
  md: "w-20 h-20",
  lg: "w-28 h-28",
};

export function TextureBall({
  texture,
  isSelected = false,
  onClick,
  size = "md",
  showLabel = true,
  className,
}: TextureBallProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 p-1.5 rounded-xl transition-all duration-200",
        "hover:bg-white/5 active:scale-[0.97]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900",
        className
      )}
    >
      <div
        className={cn(
          "relative rounded-full overflow-hidden flex-shrink-0",
          "ring-2 transition-all duration-200",
          sizeClasses[size],
          isSelected
            ? "ring-white shadow-[0_0_0_1px_rgba(255,255,255,0.3),0_0_20px_rgba(255,255,255,0.08)]"
            : "ring-transparent hover:ring-white/20"
        )}
      >
        {/* Texture or pre-rendered sphere image */}
        <div
          className="absolute inset-0 rounded-full bg-neutral-800 bg-cover bg-center"
          style={{
            backgroundImage: `url(${texture.image})`,
            backgroundSize: "cover",
          }}
        />
        {/* Sphere shading overlay only when image is flat texture, not pre-rendered sphere */}
        {!texture.preRenderedSphere && (
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: `
                radial-gradient(ellipse 80% 50% at 30% 25%, rgba(255,255,255,0.35) 0%, transparent 55%),
                radial-gradient(ellipse 70% 60% at 75% 75%, rgba(0,0,0,0.4) 0%, transparent 55%),
                radial-gradient(ellipse 100% 100% at 50% 50%, transparent 45%, rgba(0,0,0,0.15) 100%)
              `,
            }}
          />
        )}
      </div>
      {showLabel && (
        <span
          className={cn(
            "text-[10px] font-medium leading-tight text-center max-w-full truncate px-0.5",
            isSelected ? "text-white" : "text-neutral-400"
          )}
        >
          {texture.label}
        </span>
      )}
    </button>
  );
}
