"use client";

import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronDown, Upload, X, Wand2, Plus, Check, Layers, RotateCcw } from "lucide-react";
import type { ModeSettingGroup, ModeSettingOption } from "@/lib/constants/render-modes";

// Dropdown with image thumbnails (for shot type, architecture style)
function SettingDropdown({
  group,
  value,
  onChange,
  disabled,
}: {
  group: ModeSettingGroup;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = group.options.find((o) => o.value === value) ?? group.options[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          disabled={disabled}
          className={cn(
            "w-full flex items-center gap-3 p-2 rounded-xl border transition-all duration-150",
            "bg-neutral-800/50 border-neutral-700/40 hover:border-neutral-600 hover:bg-neutral-800/70",
            "text-left",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {/* Thumbnail */}
          <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-neutral-700/50 flex items-center justify-center">
            {selected?.image ? (
              <img src={selected.image} alt={selected.label} className="w-full h-full object-cover" />
            ) : selected?.value === "auto" ? (
              <Wand2 className="w-4 h-4 text-neutral-400" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-neutral-600 to-neutral-800 flex items-center justify-center">
                <span className="text-[9px] font-medium text-neutral-400 text-center leading-tight px-0.5">
                  {selected?.label}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white truncate">
              {selected?.label ?? "Auto"}
            </div>
          </div>
          <ChevronDown className={cn(
            "w-3.5 h-3.5 text-neutral-500 transition-transform",
            open && "rotate-180"
          )} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={6}
        className="w-[var(--radix-popover-trigger-width)] p-2 bg-neutral-900 border-neutral-700 rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] max-h-[280px] overflow-y-auto scrollbar-none"
      >
        <div className="grid grid-cols-3 gap-1.5">
          {group.options.map((option) => {
            const isActive = value === option.value;
            return (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all duration-150",
                  isActive
                    ? "bg-white/10 ring-1 ring-white/20"
                    : "hover:bg-neutral-800"
                )}
              >
                <div className="w-full aspect-square rounded-md overflow-hidden bg-neutral-800 flex items-center justify-center">
                  {option.image ? (
                    <img src={option.image} alt={option.label} className="w-full h-full object-cover" />
                  ) : option.value === "auto" ? (
                    <Wand2 className="w-4 h-4 text-neutral-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center">
                      <span className="text-[8px] font-medium text-neutral-500 text-center leading-tight px-0.5">
                        {option.label}
                      </span>
                    </div>
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-medium leading-tight text-center w-full truncate",
                  isActive ? "text-white" : "text-neutral-400"
                )}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Select buttons with optional upload reference
function SettingSelectWithUpload({
  group,
  value,
  onChange,
  disabled,
  onFileUpload,
  uploadedFileName,
  onClearUpload,
}: {
  group: ModeSettingGroup;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  onFileUpload?: (file: File) => void;
  uploadedFileName?: string | null;
  onClearUpload?: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <div className={cn(
        "grid gap-1.5",
        group.columns === 3 ? "grid-cols-3" : "grid-cols-2"
      )}>
        {group.options.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onChange(isActive ? "" : option.value)}
              disabled={disabled}
              className={cn(
                "flex items-center justify-center px-2.5 py-2 rounded-lg text-xs font-medium",
                "transition-all duration-150 active:scale-[0.97]",
                disabled && "cursor-not-allowed opacity-50",
                isActive
                  ? "bg-white text-neutral-900 shadow-[0_2px_8px_rgba(255,255,255,0.12)]"
                  : "bg-neutral-800/60 text-neutral-400 border border-neutral-700/40 hover:bg-neutral-700/60 hover:text-neutral-200 hover:border-neutral-600/50"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Upload reference */}
      {uploadedFileName ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800/50 border border-neutral-700/40">
          <Upload className="w-3 h-3 text-neutral-500 flex-shrink-0" />
          <span className="text-xs text-neutral-300 flex-1 truncate">{uploadedFileName}</span>
          <button
            onClick={onClearUpload}
            className="text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed",
            "border-neutral-700/50 text-neutral-500 text-xs font-medium",
            "hover:border-neutral-600 hover:text-neutral-400 hover:bg-neutral-800/30",
            "transition-all duration-150",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <Upload className="w-3 h-3" />
          Upload Reference
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && onFileUpload) {
            onFileUpload(file);
          }
          e.target.value = "";
        }}
      />
    </div>
  );
}

// Upload-only object picker (preset library disabled for now)
function ObjectPicker({
  group,
  value,
  onChange,
  disabled,
  onFileUpload,
  uploadedFileNames,
  onClearUpload,
}: {
  group: ModeSettingGroup;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  onFileUpload?: (file: File) => void;
  uploadedFileNames?: string[];
  onClearUpload?: (index: number) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadCount = uploadedFileNames?.length ?? 0;

  return (
    <div className="space-y-2">
      {/* Upload button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className={cn(
          "w-full flex items-center gap-3 p-3 rounded-xl border border-dashed transition-all duration-150",
          "border-neutral-700/50 bg-neutral-800/30 hover:border-neutral-600 hover:bg-neutral-800/50",
          "text-left",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neutral-700/50 flex items-center justify-center">
          <Plus className="w-4 h-4 text-neutral-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-white">
            Upload Objects
          </div>
          <div className="text-[10px] text-neutral-500">
            {uploadCount === 0
              ? "Add reference images of objects to include"
              : `${uploadCount} object${uploadCount > 1 ? "s" : ""} uploaded`}
          </div>
        </div>
        <Upload className="w-3.5 h-3.5 text-neutral-500" />
      </button>

      {/* Show uploaded custom objects */}
      {uploadedFileNames && uploadedFileNames.length > 0 && (
        <div className="space-y-1">
          {uploadedFileNames.map((name, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-800/50 border border-neutral-700/40">
              <Upload className="w-3 h-3 text-neutral-500 flex-shrink-0" />
              <span className="text-xs text-neutral-300 flex-1 truncate">{name}</span>
              <button
                onClick={() => onClearUpload?.(i)}
                className="text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && onFileUpload) {
            onFileUpload(file);
          }
          e.target.value = "";
        }}
      />
    </div>
  );
}

// Multi-select texture picker with sphere previews
function TexturePicker({
  group,
  value,
  onChange,
  disabled,
}: {
  group: ModeSettingGroup;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selectedValues = value ? value.split(",").filter(Boolean) : [];

  const toggleItem = (itemValue: string) => {
    const current = new Set(selectedValues);
    if (current.has(itemValue)) {
      current.delete(itemValue);
    } else {
      current.add(itemValue);
    }
    onChange(Array.from(current).join(","));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          disabled={disabled}
          className={cn(
            "w-full flex items-center gap-3 p-2 rounded-xl border transition-all duration-150",
            "bg-neutral-800/50 border-neutral-700/40 hover:border-neutral-600 hover:bg-neutral-800/70",
            "text-left",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-neutral-700/50 flex items-center justify-center">
            {selectedValues.length > 0 ? (
              <div className="flex items-center -space-x-1.5">
                {selectedValues.slice(0, 3).map((v) => {
                  const opt = group.options.find((o) => o.value === v);
                  return opt?.image ? (
                    <img key={v} src={opt.image} alt={opt.label} className="w-5 h-5 rounded-full ring-1 ring-neutral-900 object-cover" />
                  ) : null;
                })}
              </div>
            ) : (
              <Layers className="w-4 h-4 text-neutral-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white truncate">
              {selectedValues.length === 0
                ? "None selected"
                : `${selectedValues.length} texture${selectedValues.length > 1 ? "s" : ""} selected`}
            </div>
          </div>
          <ChevronDown className={cn(
            "w-3.5 h-3.5 text-neutral-500 transition-transform",
            open && "rotate-180"
          )} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={6}
        className="w-[var(--radix-popover-trigger-width)] p-2 bg-neutral-900 border-neutral-700 rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] max-h-[320px] overflow-y-auto scrollbar-none"
      >
        <div className="grid grid-cols-3 gap-1.5">
          {group.options.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            return (
              <button
                key={option.value}
                onClick={() => toggleItem(option.value)}
                className={cn(
                  "relative flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all duration-150",
                  isSelected
                    ? "bg-white/10 ring-1 ring-white/20"
                    : "hover:bg-neutral-800"
                )}
              >
                <div className="w-full aspect-square rounded-full overflow-hidden bg-neutral-800 flex items-center justify-center">
                  {option.image ? (
                    <img src={option.image} alt={option.label} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center">
                      <span className="text-[8px] font-medium text-neutral-500 text-center leading-tight px-0.5">
                        {option.label}
                      </span>
                    </div>
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-medium leading-tight text-center w-full truncate",
                  isSelected ? "text-white" : "text-neutral-400"
                )}>
                  {option.label}
                </span>
                {isSelected && (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-black" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface ModeSettingsFormProps {
  settings: ModeSettingGroup[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  disabled?: boolean;
  referenceFiles?: Record<string, File | null>;
  onReferenceFileChange?: (key: string, file: File | null) => void;
  objectFiles?: Record<string, File[]>;
  onObjectFileAdd?: (key: string, file: File) => void;
  onObjectFileRemove?: (key: string, index: number) => void;
  /** When true, hides the customPrompt textarea and shows reset icons */
  isOverrideMode?: boolean;
  /** Inherited values from global settings — used to show reset buttons */
  inheritedValues?: Record<string, string>;
  /** Called when user clicks "reset" on an overridden field */
  onResetToGlobal?: (key: string) => void;
}

export function ModeSettingsForm({
  settings,
  values,
  onChange,
  disabled = false,
  referenceFiles,
  onReferenceFileChange,
  objectFiles,
  onObjectFileAdd,
  onObjectFileRemove,
  isOverrideMode = false,
  inheritedValues,
  onResetToGlobal,
}: ModeSettingsFormProps) {
  const handleToggle = (key: string, value: string) => {
    onChange(key, values[key] === value ? "" : value);
  };

  return (
    <div
      className={cn(
        "flex-1 min-h-0 flex flex-col",
        disabled && "opacity-50 pointer-events-none"
      )}
    >
      <div className="flex-1 overflow-y-auto scrollbar-none">
        <div className="space-y-4">
          {/* Prompt — hidden in override mode */}
          {!isOverrideMode && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                Prompt
              </h4>
              <Textarea
                placeholder="Describe what you want to generate..."
                value={values.customPrompt ?? ""}
                onChange={(e) => onChange("customPrompt", e.target.value)}
                disabled={disabled}
                className="bg-neutral-800/50 border-neutral-700/40 text-white placeholder:text-neutral-600 resize-none h-20 text-xs focus:border-neutral-600 rounded-xl disabled:cursor-not-allowed"
              />
            </div>
          )}

          {settings.map((group) => {
            const isOverridden = isOverrideMode && inheritedValues && values[group.key] !== undefined && values[group.key] !== inheritedValues[group.key];
            return (
            <div key={group.key} className="space-y-2">
              <div className="flex items-center gap-1.5">
                <h4 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex-1">
                  {group.title}
                </h4>
                {isOverridden && onResetToGlobal && (
                  <button
                    onClick={() => onResetToGlobal(group.key)}
                    title="Reset to global"
                    className="flex items-center gap-1 text-[9px] text-neutral-500 hover:text-white transition-colors"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    Reset
                  </button>
                )}
              </div>

              {group.type === "dropdown" && (
                <SettingDropdown
                  group={group}
                  value={values[group.key] ?? "auto"}
                  onChange={(v) => onChange(group.key, v)}
                  disabled={disabled}
                />
              )}

              {group.type === "select-with-upload" && (
                <SettingSelectWithUpload
                  group={group}
                  value={values[group.key] ?? "auto"}
                  onChange={(v) => handleToggle(group.key, v)}
                  disabled={disabled}
                  uploadedFileName={referenceFiles?.[group.key]?.name ?? null}
                  onFileUpload={(file) => onReferenceFileChange?.(group.key, file)}
                  onClearUpload={() => onReferenceFileChange?.(group.key, null)}
                />
              )}

              {group.type === "object-picker" && (
                <ObjectPicker
                  group={group}
                  value={values[group.key] ?? ""}
                  onChange={(v) => onChange(group.key, v)}
                  disabled={disabled}
                  uploadedFileNames={objectFiles?.[group.key]?.map((f) => f.name)}
                  onFileUpload={(file) => onObjectFileAdd?.(group.key, file)}
                  onClearUpload={(index) => onObjectFileRemove?.(group.key, index)}
                />
              )}

              {group.type === "texture-picker" && (
                <TexturePicker
                  group={group}
                  value={values[group.key] ?? ""}
                  onChange={(v) => onChange(group.key, v)}
                  disabled={disabled}
                />
              )}

              {(group.type === "select" || group.type === "toggle") && (
                <div
                  className={cn(
                    "grid gap-1.5",
                    group.columns === 3 ? "grid-cols-3" : "grid-cols-2"
                  )}
                >
                  {group.options.map((option) => {
                    const isActive = values[group.key] === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleToggle(group.key, option.value)}
                        disabled={disabled}
                        className={cn(
                          "flex items-center justify-center px-2.5 py-2 rounded-lg text-xs font-medium",
                          "transition-all duration-150 active:scale-[0.97]",
                          disabled && "cursor-not-allowed opacity-50",
                          isActive
                            ? "bg-white text-neutral-900 shadow-[0_2px_8px_rgba(255,255,255,0.12)]"
                            : "bg-neutral-800/60 text-neutral-400 border border-neutral-700/40 hover:bg-neutral-700/60 hover:text-neutral-200 hover:border-neutral-600/50"
                        )}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
          })}
        </div>
      </div>
    </div>
  );
}
