"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal, LayoutList, Grid2X2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortOption = "newest" | "oldest";
export type ViewMode = "list" | "album";

interface GalleryFiltersProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalCount: number;
}

export function GalleryFilters({
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalCount,
}: GalleryFiltersProps) {
  return (
    <div className="flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 border-b border-neutral-800">
      {/* Left Side - Count */}
      <span className="text-xs sm:text-sm text-neutral-500">
        {totalCount} {totalCount === 1 ? "render" : "renders"}
      </span>

      {/* Right Side - Filters & View Toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sort Dropdown */}
        <Select
          value={sortBy}
          onValueChange={(v) => onSortChange(v as SortOption)}
        >
          <SelectTrigger className="w-24 sm:w-32 h-10 sm:h-9 bg-neutral-900 border-neutral-800 text-white text-xs sm:text-sm focus:ring-0 focus:ring-offset-0">
            <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5 sm:mr-2 text-neutral-500" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-neutral-900 border-neutral-800">
            <SelectItem
              value="newest"
              className="text-neutral-300 focus:text-white focus:bg-neutral-800"
            >
              Newest
            </SelectItem>
            <SelectItem
              value="oldest"
              className="text-neutral-300 focus:text-white focus:bg-neutral-800"
            >
              Oldest
            </SelectItem>
          </SelectContent>
        </Select>

        {/* View Mode Toggle */}
        <div className="flex items-center rounded-lg border border-neutral-800 overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewModeChange("list")}
            className={cn(
              "h-10 w-10 sm:h-9 sm:w-9 rounded-none",
              viewMode === "list"
                ? "bg-neutral-800 text-white"
                : "text-neutral-500 hover:text-white hover:bg-neutral-800/50 active:bg-neutral-800"
            )}
          >
            <LayoutList className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewModeChange("album")}
            className={cn(
              "h-10 w-10 sm:h-9 sm:w-9 rounded-none",
              viewMode === "album"
                ? "bg-neutral-800 text-white"
                : "text-neutral-500 hover:text-white hover:bg-neutral-800/50 active:bg-neutral-800"
            )}
          >
            <Grid2X2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
