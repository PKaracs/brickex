"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { TOOLS, type Tool } from "@/lib/constants/tools";
import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";

const TAG_FILTERS = [
  "All",
  "Interior",
  "Architecture",
  "3D",
  "Technical",
  "Landscape",
  "Material",
  "Floorplan",
] as const;

function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = tool.icon;

  return (
    <Link href={`/tools/${tool.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.04, ease: "easeOut" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer h-full bg-neutral-900 border border-neutral-800/60 hover:border-neutral-600/60 transition-all duration-500"
      >
        {/* Hero area with icon + gradient */}
        <div className="relative w-full aspect-[5/3] overflow-hidden">
          {/* Layered gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/80 via-neutral-900 to-black" />
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              isHovered ? "opacity-100" : "opacity-0"
            )}
            style={{
              background:
                "radial-gradient(ellipse at 50% 60%, rgba(255,255,255,0.04) 0%, transparent 70%)",
            }}
          />

          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={cn(
                "relative flex items-center justify-center transition-all duration-500",
                isHovered ? "scale-105" : "scale-100"
              )}
            >
              <div
                className={cn(
                  "absolute w-20 h-20 rounded-full transition-all duration-700",
                  isHovered
                    ? "bg-white/[0.06] scale-150"
                    : "bg-white/[0.02] scale-100"
                )}
              />
              <Icon
                className={cn(
                  "w-9 h-9 relative z-10 transition-all duration-500",
                  isHovered ? "text-white" : "text-neutral-500"
                )}
                strokeWidth={1.5}
              />
            </div>
          </div>

          {/* Arrow indicator on hover */}
          <div
            className={cn(
              "absolute top-3.5 right-3.5 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300",
              isHovered
                ? "bg-white/10 opacity-100 translate-x-0"
                : "bg-transparent opacity-0 translate-x-1"
            )}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-300" />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 px-5 pt-4 pb-5">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tool.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[10px] font-medium text-neutral-500 bg-neutral-800/60 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3
            className={cn(
              "text-[15px] font-semibold tracking-tight transition-colors duration-300",
              isHovered ? "text-white" : "text-neutral-200"
            )}
          >
            {tool.label}
          </h3>

          {/* Description */}
          <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed line-clamp-2">
            {tool.description}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}

export function ToolsClient() {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filteredTools =
    activeFilter === "All"
      ? TOOLS
      : TOOLS.filter((t) => t.tags.includes(activeFilter));

  return (
    <div className="h-full bg-black overflow-y-auto">
      <div className="px-4 sm:px-6 pt-6 sm:pt-8 pb-24 md:pb-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Tools
          </h1>
          <p className="text-sm text-neutral-500">
            AI-powered tools for architecture, interior design, and 3D
            visualization
          </p>
        </div>

        {/* Filter chips */}
        <div className="mt-6 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {TAG_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                activeFilter === filter
                  ? "bg-white text-black"
                  : "bg-neutral-800/60 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 border border-neutral-700/50"
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className="mt-5 border-t border-neutral-800/70" />

        {/* Count */}
        <div className="mt-4 mb-4">
          <p className="text-xs text-neutral-600">
            {filteredTools.length} tool{filteredTools.length !== 1 ? "s" : ""}{" "}
            available
          </p>
        </div>

        {/* Tool Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredTools.map((tool, index) => (
            <ToolCard key={tool.id} tool={tool} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
