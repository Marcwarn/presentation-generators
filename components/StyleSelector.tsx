"use client";

import { Palette, Sun, Moon, Blend } from "lucide-react";
import { PresentationStyle, BackgroundStyle, Language, translations } from "@/lib/types";
import { palettes, PaletteKey, getHexColor } from "@/lib/palettes";

interface StyleSelectorProps {
  style: PresentationStyle;
  onChange: (style: PresentationStyle) => void;
  language: Language;
}

const backgroundStyles: {
  value: BackgroundStyle;
  label: { en: string; sv: string };
  icon: typeof Sun;
}[] = [
  { value: "dark", label: { en: "Dark", sv: "Mörk" }, icon: Moon },
  { value: "light", label: { en: "Light", sv: "Ljus" }, icon: Sun },
  { value: "gradient", label: { en: "Gradient", sv: "Gradient" }, icon: Blend },
];

const fontStyles: {
  value: "modern" | "classic" | "tech";
  label: { en: string; sv: string };
  sample: string;
}[] = [
  { value: "modern", label: { en: "Modern", sv: "Modern" }, sample: "Aa" },
  { value: "classic", label: { en: "Classic", sv: "Klassisk" }, sample: "Aa" },
  { value: "tech", label: { en: "Tech", sv: "Tech" }, sample: "Aa" },
];

export default function StyleSelector({
  style,
  onChange,
  language,
}: StyleSelectorProps) {
  const paletteKeys = Object.keys(palettes) as PaletteKey[];
  const t = translations[language];

  return (
    <div className="space-y-6">
      {/* Color Palette Selection */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
          <Palette className="w-4 h-4 text-pink-400" />
          {t.colorTheme}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {paletteKeys.map((key) => {
            const p = palettes[key];
            const isSelected = style.palette === key;
            const isProTheme = key === "doingsPro";
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange({ ...style, palette: key })}
                className={`p-3 rounded-lg transition-all flex flex-col items-center gap-2 relative ${
                  isSelected
                    ? "ring-2 ring-pink-500 bg-gray-800"
                    : isProTheme
                    ? "bg-gradient-to-br from-pink-900/30 to-amber-900/30 hover:from-pink-900/50 hover:to-amber-900/50 border border-pink-500/50"
                    : "bg-gray-800/50 hover:bg-gray-800 border border-gray-700"
                }`}
              >
                {isProTheme && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    PRO
                  </span>
                )}
                <div className="flex gap-1">
                  <div
                    className="w-5 h-5 rounded"
                    style={{ backgroundColor: getHexColor(p.primary) }}
                  />
                  <div
                    className="w-5 h-5 rounded"
                    style={{ backgroundColor: getHexColor(p.secondary) }}
                  />
                  <div
                    className="w-5 h-5 rounded"
                    style={{ backgroundColor: getHexColor(p.accent) }}
                  />
                  {isProTheme && (
                    <div
                      className="w-5 h-5 rounded"
                      style={{ backgroundColor: getHexColor(p.contrast) }}
                    />
                  )}
                </div>
                <span className="text-white text-sm font-medium">{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Background Style */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-3 block">
          {t.backgroundStyle}
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
                <span className="text-sm">{bg.label[language]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Font Style */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-3 block">
          {t.fontStyle}
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
              <span className="text-sm">{font.label[language]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview Card */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-3 block">
          {t.preview}
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
            {language === "sv" ? "Din rubrik här" : "Your Headline Here"}
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
            {language === "sv" ? "Underrubrik" : "Subtitle text preview"}
          </p>
        </div>
      </div>
    </div>
  );
}
