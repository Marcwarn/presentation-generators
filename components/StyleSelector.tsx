"use client";

import { Palette, Sun, Moon, Blend } from "lucide-react";
import { PresentationStyle, BackgroundStyle } from "@/lib/types";
import { palettes, PaletteKey, getHexColor } from "@/lib/palettes";

interface StyleSelectorProps {
  style: PresentationStyle;
  onChange: (style: PresentationStyle) => void;
}

const backgroundStyles: {
  value: BackgroundStyle;
  label: string;
  icon: typeof Sun;
}[] = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
  { value: "gradient", label: "Gradient", icon: Blend },
];

const fontStyles: {
  value: "modern" | "classic" | "tech";
  label: string;
  sample: string;
}[] = [
  { value: "modern", label: "Modern", sample: "Aa" },
  { value: "classic", label: "Classic", sample: "Aa" },
  { value: "tech", label: "Tech", sample: "Aa" },
];

export default function StyleSelector({
  style,
  onChange,
}: StyleSelectorProps) {
  const paletteKeys = Object.keys(palettes) as PaletteKey[];

  return (
    <div className="space-y-6">
      {/* Color Palette Selection */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
          <Palette className="w-4 h-4 text-pink-400" />
          Color Theme
        </label>
        <div className="space-y-2">
          {paletteKeys.map((key) => {
            const p = palettes[key];
            const isSelected = style.palette === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange({ ...style, palette: key })}
                className={`w-full p-3 rounded-lg transition-all flex items-center gap-3 ${
                  isSelected
                    ? "ring-2 ring-pink-500 bg-gray-800"
                    : "bg-gray-800/50 hover:bg-gray-800 border border-gray-700"
                }`}
              >
                {/* Color swatches */}
                <div className="flex gap-1">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: getHexColor(p.primary) }}
                  />
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: getHexColor(p.secondary) }}
                  />
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: getHexColor(p.accent) }}
                  />
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: getHexColor(p.contrast) }}
                  />
                </div>
                <span className="text-white font-medium">{p.name}</span>
                {isSelected && (
                  <span className="ml-auto text-pink-400 text-sm">Selected</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Background Style */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-3 block">
          Background Style
        </label>
        <div className="grid grid-cols-3 gap-2">
          {backgroundStyles.map((bg) => {
            const Icon = bg.icon;
            return (
              <button
                key={bg.value}
                type="button"
                onClick={() => onChange({ ...style, backgroundStyle: bg.value })}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                  style.backgroundStyle === bg.value
                    ? "bg-pink-500 text-white"
                    : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{bg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Font Style */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-3 block">
          Font Style
        </label>
        <div className="grid grid-cols-3 gap-2">
          {fontStyles.map((font) => (
            <button
              key={font.value}
              type="button"
              onClick={() => onChange({ ...style, fontStyle: font.value })}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                style.fontStyle === font.value
                  ? "bg-pink-500 text-white"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700"
              }`}
            >
              <span
                className={`text-xl ${
                  font.value === "modern"
                    ? "font-sans"
                    : font.value === "classic"
                    ? "font-serif"
                    : "font-mono"
                }`}
              >
                {font.sample}
              </span>
              <span className="text-sm">{font.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview Card */}
      <div className="mt-6">
        <label className="text-sm font-medium text-gray-300 mb-3 block">
          Preview
        </label>
        <div
          className="aspect-video rounded-lg p-6 flex flex-col justify-center items-center"
          style={{
            backgroundColor:
              style.backgroundStyle === "light"
                ? "#ffffff"
                : getHexColor(palettes[style.palette].darkBg),
            background:
              style.backgroundStyle === "gradient"
                ? `linear-gradient(135deg, ${getHexColor(
                    palettes[style.palette].darkBg
                  )} 0%, ${getHexColor(palettes[style.palette].navyBg)} 100%)`
                : undefined,
          }}
        >
          <h3
            className={`text-2xl font-bold text-center ${
              style.fontStyle === "modern"
                ? "font-sans"
                : style.fontStyle === "classic"
                ? "font-serif"
                : "font-mono"
            }`}
            style={{
              color: getHexColor(palettes[style.palette].primary),
            }}
          >
            Your Headline Here
          </h3>
          <p
            className="text-sm mt-2 opacity-60"
            style={{
              color:
                style.backgroundStyle === "light"
                  ? "#333333"
                  : getHexColor(palettes[style.palette].textLight),
            }}
          >
            Subtitle text preview
          </p>
        </div>
      </div>
    </div>
  );
}
