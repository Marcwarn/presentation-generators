"use client";

import { useState } from "react";
import { Palette, X } from "lucide-react";
import { CustomColors, defaultCustomColors } from "@/lib/palettes";
import { Language } from "@/lib/types";

interface ColorPickerProps {
  colors: CustomColors;
  onChange: (colors: CustomColors) => void;
  language: Language;
}

const colorLabels = {
  en: {
    color1: "Primary / Accent",
    color2: "Secondary",
    color3: "Background Dark",
    color4: "Background Light",
    color5: "Text / Contrast",
    title: "Custom Colors",
    reset: "Reset to defaults",
    tip: "Click a color to change it. Perfect for matching client brand colors.",
  },
  sv: {
    color1: "Primär / Accent",
    color2: "Sekundär",
    color3: "Bakgrund Mörk",
    color4: "Bakgrund Ljus",
    color5: "Text / Kontrast",
    title: "Egna färger",
    reset: "Återställ standardfärger",
    tip: "Klicka på en färg för att ändra. Perfekt för att matcha kundens varumärkesfärger.",
  },
};

export default function ColorPicker({ colors, onChange, language }: ColorPickerProps) {
  const [activeColor, setActiveColor] = useState<keyof CustomColors | null>(null);
  const labels = colorLabels[language];

  const handleColorChange = (key: keyof CustomColors, value: string) => {
    onChange({
      ...colors,
      [key]: value,
    });
  };

  const handleReset = () => {
    onChange(defaultCustomColors);
  };

  const colorKeys: (keyof CustomColors)[] = ["color1", "color2", "color3", "color4", "color5"];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-pink-400" />
          <span className="text-sm font-medium text-gray-300">{labels.title}</span>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          {labels.reset}
        </button>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {colorKeys.map((key) => (
          <div key={key} className="flex flex-col items-center gap-1">
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveColor(activeColor === key ? null : key)}
                className={`w-10 h-10 rounded-lg border-2 transition-all ${
                  activeColor === key
                    ? "border-pink-500 scale-110"
                    : "border-gray-600 hover:border-gray-500"
                }`}
                style={{ backgroundColor: colors[key] }}
                title={labels[key]}
              />
              {activeColor === key && (
                <button
                  type="button"
                  onClick={() => setActiveColor(null)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-gray-800 rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>
            <span className="text-[10px] text-gray-500 text-center leading-tight">
              {labels[key].split(" / ")[0]}
            </span>
          </div>
        ))}
      </div>

      {activeColor && (
        <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">{labels[activeColor]}</span>
            <span className="text-xs text-gray-500 font-mono">{colors[activeColor]}</span>
          </div>
          <input
            type="color"
            value={colors[activeColor]}
            onChange={(e) => handleColorChange(activeColor, e.target.value)}
            className="w-full h-10 rounded cursor-pointer bg-transparent"
          />
          <input
            type="text"
            value={colors[activeColor]}
            onChange={(e) => {
              const value = e.target.value;
              if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                handleColorChange(activeColor, value);
              }
            }}
            placeholder="#RRGGBB"
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white font-mono placeholder-gray-600"
          />
        </div>
      )}

      <p className="text-xs text-gray-500">{labels.tip}</p>
    </div>
  );
}
