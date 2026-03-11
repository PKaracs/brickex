"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

// Colors for each flex category
const FLEX_COLORS: Record<string, string> = {
  outfit: "#FF6B6B",
  watch: "#4ECDC4",
  location: "#A855F7",
  vehicle: "#F59E0B",
  accessories: "#3B82F6",
};

// Default flex breakdown when no data is provided
const DEFAULT_BREAKDOWN: FlexBreakdownData = {
  outfit: 12500,
  watch: 45000,
  location: 8500,
  vehicle: 285000,
  accessories: 3200,
};

export interface FlexBreakdownData {
  outfit: number;
  watch: number;
  location: number;
  vehicle: number;
  accessories: number;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${Math.round(value / 1000)}K`;
  }
  return `$${value.toLocaleString()}`;
}

interface MultiSegmentRingProps {
  segments: { value: number; color: string; label: string }[];
  total: number;
  className?: string;
}

function MultiSegmentRing({
  segments,
  total,
  className,
}: MultiSegmentRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const circumference = 2 * Math.PI * 42;
  const gapSize = 3;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(100), 100);
    return () => clearTimeout(timer);
  }, []);

  let currentAngle = -90;
  const segmentData = segments.map((segment) => {
    const percentage = (segment.value / total) * 100;
    const angle = (percentage / 100) * 360 - gapSize;
    const startAngle = currentAngle;
    currentAngle += (percentage / 100) * 360;
    return {
      ...segment,
      percentage,
      startAngle,
      angle: Math.max(angle, 0),
    };
  });

  return (
    <div className={cn("relative", className)}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background ring */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="6"
        />

        {/* Segments */}
        {segmentData.map((segment, index) => {
          const dashLength =
            (segment.angle / 360) * circumference * (animatedProgress / 100);
          return (
            <circle
              key={segment.label}
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={segment.color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${dashLength} ${circumference}`}
              style={{
                transform: `rotate(${segment.startAngle}deg)`,
                transformOrigin: "50% 50%",
                transition:
                  "stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
                transitionDelay: `${index * 100}ms`,
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}

interface FlexWorthDisplayProps {
  className?: string;
  flexWorth?: number;
  flexBreakdown?: FlexBreakdownData;
}

export function FlexWorthDisplay({
  className,
  flexWorth,
  flexBreakdown,
}: FlexWorthDisplayProps) {
  const [countedValue, setCountedValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Transform breakdown data into display format, filtering out zero values
  const breakdownData = useMemo(() => {
    const data = flexBreakdown || DEFAULT_BREAKDOWN;
    const allItems = [
      { label: "Outfit", value: data.outfit, color: FLEX_COLORS.outfit },
      { label: "Watch", value: data.watch, color: FLEX_COLORS.watch },
      { label: "Location", value: data.location, color: FLEX_COLORS.location },
      { label: "Vehicle", value: data.vehicle, color: FLEX_COLORS.vehicle },
      {
        label: "Accessories",
        value: data.accessories,
        color: FLEX_COLORS.accessories,
      },
    ];
    // Filter out categories with zero or negative values
    return allItems.filter((item) => item.value > 0);
  }, [flexBreakdown]);

  const totalValue =
    flexWorth || breakdownData.reduce((sum, item) => sum + item.value, 0);

  useEffect(() => {
    setIsVisible(true);

    const duration = 1500;
    const steps = 50;
    const increment = totalValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= totalValue) {
        setCountedValue(totalValue);
        clearInterval(timer);
      } else {
        setCountedValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [totalValue]);

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Ring + Center value */}
      <div className="relative w-40 h-40 mx-auto">
        <MultiSegmentRing
          segments={breakdownData}
          total={totalValue}
          className="w-full h-full"
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[9px] uppercase tracking-[0.15em] text-neutral-500 mb-0.5">
            Flex Worth
          </span>
          <span
            className={cn(
              "text-2xl font-semibold text-white tabular-nums transition-opacity duration-500",
              isVisible ? "opacity-100" : "opacity-0"
            )}
          >
            {formatCurrency(countedValue)}
          </span>
        </div>
      </div>

      {/* Minimal breakdown */}
      <div className="mt-6 space-y-0">
        {breakdownData.map((item, index) => (
          <div
            key={item.label}
            className={cn(
              "flex items-center justify-between py-2.5 border-b border-neutral-800/50 last:border-0",
              "transition-all duration-300",
              isVisible ? "opacity-100" : "opacity-0"
            )}
            style={{ transitionDelay: `${400 + index * 60}ms` }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[13px] text-neutral-400">{item.label}</span>
            </div>
            <span
              className="text-[13px] font-medium tabular-nums"
              style={{ color: item.color }}
            >
              {formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>

      {/* Tiny footer */}
      <p className="text-[9px] text-neutral-600 text-center mt-4">
        AI-estimated values
      </p>
    </div>
  );
}
