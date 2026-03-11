"use client";

import type { HTMLAttributes } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface SafariProps extends HTMLAttributes<HTMLDivElement> {
  imageSrc?: string;
  priority?: boolean;
  alt?: string;
}

export function Safari({ imageSrc, priority, alt = "Richflex dashboard showing AI-generated luxury lifestyle photos", className, ...props }: SafariProps) {
  return (
    <div
      className={cn("bg-[#1a1a1a] rounded-3xl p-4 md:p-6 shadow-sm", className)}
      {...props}
    >
      {/* Browser frame */}
      <div className="bg-[#0a0a0a] rounded-2xl shadow-lg overflow-hidden border border-neutral-800">
        {/* Browser header with dots */}
        <div className="px-4 py-3 border-b border-neutral-800 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-neutral-700" />
          <div className="w-3 h-3 rounded-full bg-neutral-700" />
          <div className="w-3 h-3 rounded-full bg-neutral-700" />
        </div>

        {/* Screenshot content */}
        {imageSrc && (
          <div className="relative w-full aspect-[16/10]">
            <Image
              src={imageSrc}
              alt={alt}
              fill
              sizes="(max-width: 768px) 100vw, 896px"
              priority={priority}
              className="object-cover object-top"
            />
          </div>
        )}
      </div>
    </div>
  );
}
