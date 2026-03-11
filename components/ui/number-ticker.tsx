"use client";

import { ComponentPropsWithoutRef, useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";

import { cn } from "@/lib/utils";

// Format currency with M/B suffixes
function formatCurrency(value: number): string {
  if (value >= 1000000000) {
    // Billions
    const billions = value / 1000000000;
    return `$${billions.toFixed(1)}B`;
  } else if (value >= 1000000) {
    // Millions
    const millions = value / 1000000;
    return `$${millions.toFixed(1)}M`;
  } else if (value >= 1000) {
    // Thousands
    const thousands = value / 1000;
    return `$${thousands.toFixed(1)}K`;
  } else {
    // Less than 1000
    return `$${Math.round(value).toLocaleString()}`;
  }
}

interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number;
  startValue?: number;
  direction?: "up" | "down";
  delay?: number;
  decimalPlaces?: number;
  /** Format as currency with $ prefix */
  asCurrency?: boolean;
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
}

export function NumberTicker({
  value,
  startValue = 0,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  asCurrency = false,
  onAnimationComplete,
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? value : startValue);
  const springValue = useSpring(motionValue, {
    damping: 80,
    stiffness: 50,
  });
  const isInView = useInView(ref, { once: false, margin: "0px" });
  const previousValueRef = useRef(startValue);

  // Initial animation when in view
  useEffect(() => {
    if (isInView && previousValueRef.current === startValue) {
      const timer = setTimeout(() => {
        motionValue.set(direction === "down" ? startValue : value);
      }, delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [motionValue, isInView, delay, direction, startValue]);

  // Animate when value changes (for live updates)
  useEffect(() => {
    if (value !== previousValueRef.current && isInView) {
      motionValue.set(value);
      previousValueRef.current = value;
    }
  }, [value, motionValue, isInView]);

  // Format the number on spring changes
  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        if (asCurrency) {
          ref.current.textContent = formatCurrency(Number(latest.toFixed(0)));
        } else {
          const formatted = Intl.NumberFormat("en-US", {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
          }).format(Number(latest.toFixed(decimalPlaces)));
          ref.current.textContent = formatted;
        }
      }
    });

    // Check for animation completion
    const unsubscribeComplete = springValue.on("change", (latest) => {
      if (Math.abs(latest - value) < 1 && onAnimationComplete) {
        onAnimationComplete();
      }
    });

    return () => {
      unsubscribe();
      unsubscribeComplete();
    };
  }, [springValue, decimalPlaces, asCurrency, value, onAnimationComplete]);

  const initialDisplay = asCurrency
    ? formatCurrency(startValue)
    : startValue.toLocaleString();

  return (
    <span
      ref={ref}
      className={cn("inline-block tracking-wider tabular-nums", className)}
      {...props}
    >
      {initialDisplay}
    </span>
  );
}
