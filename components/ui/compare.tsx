"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface CompareProps {
  firstImage: string;
  secondImage: string;
  className?: string;
  firstImageClassName?: string;
  secondImageClassname?: string;
  slideMode?: "hover" | "drag";
  autoplay?: boolean;
  autoplayDuration?: number;
  initialSliderPercentage?: number;
}

export function Compare({
  firstImage,
  secondImage,
  className,
  firstImageClassName,
  secondImageClassname,
  slideMode = "hover",
  autoplay = false,
  autoplayDuration = 5000,
  initialSliderPercentage = 50,
}: CompareProps) {
  const [sliderXPercent, setSliderXPercent] = useState(initialSliderPercentage);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const directionRef = useRef<1 | -1>(1);
  const startTimeRef = useRef<number | null>(null);
  const startPercentRef = useRef(initialSliderPercentage);

  const getPercent = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return 50;
    const rect = el.getBoundingClientRect();
    return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
  }, []);

  const stopAutoplay = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    if (!autoplay) return;
    stopAutoplay();
    startTimeRef.current = null;

    const animate = (ts: number) => {
      if (!startTimeRef.current) startTimeRef.current = ts;
      const elapsed = ts - startTimeRef.current;
      const progress = elapsed / autoplayDuration;

      const min = 10;
      const max = 90;
      const range = max - min;
      const pingpong = Math.abs(((progress % 2) - 1) * range - range / 2 + range / 2);
      const next = min + pingpong;

      setSliderXPercent(next);

      if (progress < 100) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [autoplay, autoplayDuration, stopAutoplay]);

  useEffect(() => {
    if (autoplay) startAutoplay();
    return stopAutoplay;
  }, [autoplay, startAutoplay, stopAutoplay]);

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

  const handleMouseEnter = useCallback(() => {
    if (autoplay) stopAutoplay();
  }, [autoplay, stopAutoplay]);

  const handleMouseLeave = useCallback(() => {
    if (slideMode === "drag") setIsDragging(false);
    if (autoplay) startAutoplay();
    else setSliderXPercent(initialSliderPercentage);
  }, [slideMode, autoplay, startAutoplay, initialSliderPercentage]);

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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={() => slideMode === "drag" && setIsDragging(true)}
      onMouseUp={() => slideMode === "drag" && setIsDragging(false)}
      onTouchMove={handleTouchMove}
    >
      {/* Second image (right / "after") — full width base */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={secondImage}
        alt="after"
        className={cn("absolute inset-0 w-full h-full", secondImageClassname)}
        style={{ objectFit: "cover" }}
        draggable={false}
      />

      {/* First image (left / "before") — clipped */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderXPercent}%` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={firstImage}
          alt="before"
          className={cn("absolute inset-0 w-full h-full", firstImageClassName)}
          style={{ objectFit: "cover", width: containerRef.current?.offsetWidth ?? "100%" }}
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
