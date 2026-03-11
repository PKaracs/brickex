"use client";

import Image from "next/image";
import { templates } from "@/lib/constants/templates";
import { cn } from "@/lib/utils";

// Dark gray placeholder (#262626) - proper base64 PNG
const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkOAMAAPMASTyq3tQAAAAASUVORK5CYII=";

export interface TemplateItem {
  id: number;
  name: string;
  image: string;
  description: string;
}

interface SelectTemplatesFormProps {
  value: TemplateItem | null;
  onChange: (template: TemplateItem | null) => void;
}

export function SelectTemplatesForm({
  value,
  onChange,
}: SelectTemplatesFormProps) {
  const handleSelect = (template: TemplateItem) => {
    onChange(value?.id === template.id ? null : template);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 py-4">
      {templates.map((template, index) => {
        const selected = value?.id === template.id;
        // Priority load first 8 images for instant display
        const isPriority = index < 8;

        return (
          <button
            key={template.id}
            type="button"
            onClick={() => handleSelect(template)}
            className={cn(
              "group relative flex flex-col items-center gap-3 p-4",
              "rounded-xl border bg-neutral-900/50",
              "transition-all duration-200 ease-out",
              "focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:ring-offset-2 focus:ring-offset-neutral-900",
              selected
                ? "border-neutral-600 bg-neutral-800/70"
                : "border-neutral-800 hover:bg-neutral-800/70 hover:border-neutral-700"
            )}
          >
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-neutral-800/50">
              <Image
                src={template.image}
                alt={template.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                priority={isPriority}
                loading={isPriority ? undefined : "lazy"}
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="object-contain p-2 group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <span className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">
              {template.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
