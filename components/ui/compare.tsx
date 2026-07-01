"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface CompareProps {
  firstImage: string;
  secondImage: string;
  className?: string;
  firstImageClassName?: string;
  secondImageClassname?: string;
  slideMode?: "hover" | "drag";
  initialSliderPercentage?: number;
}

export function Compare({
  firstImage,
  secondImage,
  className,
  firstImageClassName,
  secondImageClassname,
  slideMode = "hover",
  initialSliderPercentage = 50,
}: CompareProps) {
  const [sliderXPercent, setSliderXPercent] = useState(initialSliderPercentage);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getPercent = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return 50;
    const rect = el.getBoundingClientRect();
    return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (slideMode === "hover") {
        setSliderXPercent(getPercent(e.clientX));
      } else if (slideMode === "drag" && isDragging) {
        setSliderXPercent(getPercent(e.clientX));
      }
    },
    [slideMode, isDragging, getPercent]
  );

  const handleMouseLeave = useCallback(() => {
    if (slideMode === "drag") setIsDragging(false);
    setSliderXPercent(initialSliderPercentage);
  }, [slideMode, initialSliderPercentage]);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (touch) setSliderXPercent(getPercent(touch.clientX));
    },
    [getPercent]
  );

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden select-none", className)}
      style={{ cursor: slideMode === "drag" ? (isDragging ? "grabbing" : "grab") : "ew-resize" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={() => slideMode === "drag" && setIsDragging(true)}
      onMouseUp={() => slideMode === "drag" && setIsDragging(false)}
      onTouchMove={handleTouchMove}
    >
      {/* Second image (right / "after") — full width base */}
      <Image
        src={secondImage}
        alt="Despues"
        fill
        sizes="(max-width: 768px) 100vw, 960px"
        quality={64}
        loading="lazy"
        decoding="async"
        className={cn("object-cover", secondImageClassname)}
        draggable={false}
      />

      {/* First image (left / "before") — clipped */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderXPercent}% 0 0)` }}
      >
        <Image
          src={firstImage}
          alt="Antes"
          fill
          sizes="(max-width: 768px) 100vw, 960px"
          quality={58}
          loading="lazy"
          decoding="async"
          className={cn("object-cover", firstImageClassName)}
          draggable={false}
        />
      </div>

      {/* Divider line + handle */}
      <div
        className="absolute inset-y-0 z-20 flex items-center justify-center"
        style={{ left: `${sliderXPercent}%`, transform: "translateX(-50%)" }}
      >
        <div className="w-px h-full bg-white/60" />
        <div className="absolute w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3L3 8l5 5M16 3l5 5-5 5" />
          </svg>
        </div>
      </div>
    </div>
  );
}
