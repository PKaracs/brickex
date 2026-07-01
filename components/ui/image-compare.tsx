"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageCompareProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  initialPosition?: number;
}

export function ImageCompare({
  beforeImage,
  afterImage,
  beforeLabel = "Antes",
  afterLabel = "Despues",
  className,
  initialPosition = 50,
}: ImageCompareProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setPosition(percentage);
  }, []);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      handleMove(e.touches[0].clientX);
    },
    [handleMove]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      handleMove(e.clientX);
    },
    [handleMove]
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative aspect-[4/3] w-full cursor-ew-resize select-none overflow-hidden",
        className
      )}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onClick={handleClick}
    >
      {/* After Image (Bottom Layer) */}
      <div className="absolute inset-0">
        <Image
          src={afterImage}
          alt={afterLabel}
          fill
          sizes="(max-width: 768px) 100vw, 960px"
          quality={64}
          loading="lazy"
          decoding="async"
          className="object-cover"
          draggable={false}
        />
        {/* After Label - minimal luxury style */}
        <div className="absolute right-5 top-5 px-3 py-1.5 text-[11px] font-light uppercase tracking-[0.2em] text-white/70 bg-black/30 backdrop-blur-md rounded">
          {afterLabel}
        </div>
      </div>

      {/* Before Image (Top Layer with clip) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image
          src={beforeImage}
          alt={beforeLabel}
          fill
          sizes="(max-width: 768px) 100vw, 960px"
          quality={58}
          loading="lazy"
          decoding="async"
          className="object-cover"
          draggable={false}
        />
        {/* Before Label - minimal luxury style */}
        <div className="absolute left-5 top-5 px-3 py-1.5 text-[11px] font-light uppercase tracking-[0.2em] text-white/70 bg-black/30 backdrop-blur-md rounded">
          {beforeLabel}
        </div>
      </div>

      {/* Slider Handle - desaturated, minimal */}
      <div
        className="absolute top-0 bottom-0 z-10 flex items-center"
        style={{ left: `${position}%` }}
      >
        {/* Vertical Line - thinner, softer */}
        <div className="h-full w-px bg-white/60" />

        {/* Handle Circle - subtle, desaturated */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-black/60 backdrop-blur-sm transition-all hover:scale-105 hover:border-white/60">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/70"
            >
              <path d="M8 3L4 7L8 11" />
              <path d="M16 3L20 7L16 11" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
