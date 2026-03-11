"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { objects, objectTypeLabels } from "@/lib/constants/object";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

// Dark gray placeholder (#262626) - proper base64 PNG
const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkOAMAAPMASTyq3tQAAAAASUVORK5CYII=";

export interface ObjectItem {
  id: number;
  name: string;
  image: string;
}

interface SelectObjectFormProps {
  value: ObjectItem[];
  onChange: (objects: ObjectItem[]) => void;
  maxSelections?: number;
}

const INITIAL_VISIBLE = 8;

// Group objects by type while preserving order
function groupObjectsByType() {
  const grouped: { type: string; label: string; items: typeof objects }[] = [];
  const seenTypes = new Set<string>();

  for (const obj of objects) {
    if (!seenTypes.has(obj.type)) {
      seenTypes.add(obj.type);
      grouped.push({
        type: obj.type,
        label: objectTypeLabels[obj.type] || obj.type,
        items: objects.filter((o) => o.type === obj.type),
      });
    }
  }

  return grouped;
}

const groupedObjects = groupObjectsByType();

export function SelectObjectForm({
  value,
  onChange,
  maxSelections = 5,
}: SelectObjectFormProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleExpand = (type: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const handleToggle = (object: ObjectItem) => {
    const isSelected = value.some((o) => o.id === object.id);
    if (isSelected) {
      onChange(value.filter((o) => o.id !== object.id));
    } else if (value.length < maxSelections) {
      onChange([...value, object]);
    }
  };

  const isSelected = (id: number) => value.some((o) => o.id === id);

  return (
    <div>
      {groupedObjects.map((group) => {
        const isExpanded = expandedGroups.has(group.type);
        const visibleItems = isExpanded
          ? group.items
          : group.items.slice(0, INITIAL_VISIBLE);
        const hasMore = group.items.length > INITIAL_VISIBLE;
        const hiddenCount = group.items.length - INITIAL_VISIBLE;

        return (
          <div key={group.type} className="mb-2">
            {/* Sticky header */}
            <div className="sticky top-0 z-10 -mx-1 px-1">
              <div className="bg-neutral-900 pt-4 pb-3">
                <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                  <span>{group.label}</span>
                  <span className="text-xs font-normal text-neutral-500">
                    {group.items.length} items
                  </span>
                </h3>
                <div className="h-px bg-neutral-800 mt-3" />
              </div>
            </div>

            {/* Items grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
              {visibleItems.map((object, index) => {
                const selected = isSelected(object.id);
                const disabled = !selected && value.length >= maxSelections;
                // Priority load first 4 items per group for instant display
                const isPriority = index < 4;

                return (
                  <button
                    key={object.id}
                    type="button"
                    onClick={() => handleToggle(object)}
                    disabled={disabled}
                    className={cn(
                      "group relative flex flex-col items-center gap-2 p-3",
                      "rounded-xl border bg-neutral-900/50",
                      "transition-all duration-200 ease-out",
                      "focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:ring-offset-2 focus:ring-offset-neutral-900",
                      selected
                        ? "border-neutral-500 bg-neutral-800/80 ring-1 ring-neutral-500"
                        : "border-neutral-800 hover:bg-neutral-800/70 hover:border-neutral-700",
                      disabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-neutral-800/50">
                      <Image
                        src={object.image}
                        alt={object.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                        priority={isPriority}
                        loading={isPriority ? undefined : "lazy"}
                        placeholder="blur"
                        blurDataURL={BLUR_DATA_URL}
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-200"
                      />
                      {selected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-neutral-900"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-medium text-neutral-300 group-hover:text-white transition-colors text-center line-clamp-2">
                      {object.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* See more button */}
            {hasMore && (
              <div className="mt-3 mb-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => toggleExpand(group.type)}
                  className="w-full text-neutral-400 hover:text-white hover:bg-neutral-800/50 text-sm"
                >
                  {isExpanded ? (
                    <>Show less</>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Show {hiddenCount} more
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
