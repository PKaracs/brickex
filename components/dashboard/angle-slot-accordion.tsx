"use client";

import { ChevronDown, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ModeSettingsForm } from "@/components/dashboard/mode-settings-form";
import type { AngleSlot } from "@/lib/constants/render-modes";
import { getOverridableSettings } from "@/lib/constants/render-modes";
import { cn } from "@/lib/utils";

interface AngleSlotAccordionProps {
  slots: AngleSlot[];
  modeId: string;
  globalValues: Record<string, string>;
  activeSlotIndex: number;
  onActiveSlotChange: (index: number) => void;
  onSlotOverrideChange: (slotId: string, key: string, value: string) => void;
  onSlotOverrideReset: (slotId: string, key: string) => void;
  onRemoveSlot: (slotId: string) => void;
  disabled?: boolean;
}

function SlotStatusIcon({ status }: { status: AngleSlot["status"] }) {
  switch (status) {
    case "generating":
      return <Loader2 className="w-3 h-3 text-neutral-400 animate-spin" />;
    case "done":
      return <CheckCircle2 className="w-3 h-3 text-green-400" />;
    case "error":
      return <AlertCircle className="w-3 h-3 text-red-400" />;
    default:
      return null;
  }
}

export function AngleSlotAccordion({
  slots,
  modeId,
  globalValues,
  activeSlotIndex,
  onActiveSlotChange,
  onSlotOverrideChange,
  onSlotOverrideReset,
  onRemoveSlot,
  disabled = false,
}: AngleSlotAccordionProps) {
  const overridableSettings = getOverridableSettings(modeId);

  if (overridableSettings.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <h4 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
        Angles
      </h4>
      <Accordion type="single" collapsible className="space-y-1">
        {slots.map((slot, index) => {
          const overrideCount = Object.keys(slot.overrides).length;
          const resolvedValues: Record<string, string> = {};
          for (const group of overridableSettings) {
            resolvedValues[group.key] = slot.overrides[group.key] ?? globalValues[group.key] ?? "auto";
          }

          return (
            <AccordionItem
              key={slot.id}
              value={slot.id}
              className="border-0"
            >
              <div
                className={cn(
                  "rounded-lg border transition-all",
                  index === activeSlotIndex
                    ? "border-neutral-600 bg-neutral-800/60"
                    : "border-neutral-700/40 bg-neutral-800/30"
                )}
              >
                <AccordionTrigger
                  className="px-3 py-2 hover:no-underline [&[data-state=open]>div>.chevron]:rotate-180"
                  onClick={() => onActiveSlotChange(index)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-xs font-semibold text-white flex-1 text-left">
                      {slot.label}
                    </span>
                    {overrideCount > 0 && (
                      <span className="text-[9px] text-neutral-400 bg-neutral-700/50 px-1.5 py-0.5 rounded-full">
                        {overrideCount} override{overrideCount > 1 ? "s" : ""}
                      </span>
                    )}
                    <SlotStatusIcon status={slot.status} />
                    {slots.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveSlot(slot.id);
                        }}
                        className="w-5 h-5 flex items-center justify-center rounded text-neutral-500 hover:text-white hover:bg-neutral-700 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                    <ChevronDown className="chevron w-3 h-3 text-neutral-500 transition-transform" />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3 pt-1">
                  <ModeSettingsForm
                    settings={overridableSettings}
                    values={resolvedValues}
                    onChange={(key, value) => onSlotOverrideChange(slot.id, key, value)}
                    disabled={disabled}
                    isOverrideMode
                    inheritedValues={globalValues}
                    onResetToGlobal={(key) => onSlotOverrideReset(slot.id, key)}
                  />
                </AccordionContent>
              </div>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
