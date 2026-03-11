"use client";

import { Textarea } from "@/components/ui/textarea";
import { OptionButton } from "@/components/dashboard/option-button";
import {
  generationCategories,
  GenerationOption,
} from "@/lib/constants/generation-options";

export interface GenerationSettings {
  frameSize: string;
  shotType: string;
  sceneType: string;
  timeOfDay: string;
  fitStyle: string;
  customPrompt: string;
}

interface GenerationSettingsFormProps {
  value: GenerationSettings;
  onChange: (settings: GenerationSettings) => void;
  disabled?: boolean;
}

export function GenerationSettingsForm({
  value,
  onChange,
  disabled = false,
}: GenerationSettingsFormProps) {
  const handleChange = (key: keyof GenerationSettings, newValue: string) => {
    const finalValue = value[key] === newValue ? "" : newValue;
    onChange({ ...value, [key]: finalValue });
  };

  return (
    <div
      className={`flex-1 min-h-0 ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      <div className="h-full overflow-y-auto scrollbar-none">
        <div className="space-y-5 pb-2">
          {generationCategories.map((category) => (
            <div key={category.key} className="space-y-2">
              <h4 className="text-xs font-medium text-neutral-400">
                {category.title}
              </h4>
              <div className="grid grid-cols-2 gap-1.5">
                {category.options.map((option: GenerationOption) => {
                  const Icon = option.icon;
                  const key = category.key as keyof GenerationSettings;
                  return (
                    <OptionButton
                      key={option.value}
                      active={value[key] === option.value}
                      onClick={() =>
                        !disabled && handleChange(key, option.value)
                      }
                      icon={<Icon className="h-3 w-3" />}
                      disabled={disabled}
                    >
                      {option.label}
                    </OptionButton>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="space-y-2">
            <h4 className="text-xs font-medium text-neutral-400">
              Custom Prompt
            </h4>
            <Textarea
              placeholder="Describe any extra details..."
              value={value.customPrompt}
              onChange={(e) => handleChange("customPrompt", e.target.value)}
              disabled={disabled}
              className="bg-neutral-800/50 border-neutral-700/50 text-white placeholder:text-neutral-500 resize-none h-20 text-xs focus:border-neutral-600 rounded-xl disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
