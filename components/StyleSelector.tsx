"use client";

import { useState } from "react";
import { Palette, Sun, Moon, Blend, Waves, ChevronDown, ChevronUp } from "lucide-react";
import { PresentationStyle, BackgroundStyle, Language, translations } from "@/lib/types";
import {
  palettes,
  PaletteKey,
  getHexColor,
  HaikeiBackground,
  haikeiBackgrounds,
  CustomColors,
  defaultCustomColors
} from "@/lib/palettes";
import ColorPicker from "./ColorPicker";

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
  const [showCustomColors, setShowCustomColors] = useState(style.palette === "custom");
  const [showHaikeiOptions, setShowHaikeiOptions] = useState(false);

  // Filter out "custom" from regular palette keys for display
  const regularPaletteKeys = (Object.keys(palettes) as PaletteKey[]).filter(k => k !== "custom");
  const t = translations[language];

  const handlePaletteChange = (key: PaletteKey) => {
    if (key === "custom") {
      setShowCustomColors(true);
      onChange({
        ...style,
        palette: key,
        customColors: style.customColors || defaultCustomColors
      });
    } else {
      setShowCustomColors(false);
      onChange({ ...style, palette: key });
    }
  };

  const handleCustomColorsChange = (colors: CustomColors) => {
    onChange({ ...style, customColors: colors });
  };

  const handleHaikeiChange = (bg: HaikeiBackground) => {
    onChange({ ...style, haikeiBackground: bg });
  };

  // Get current colors (either custom or from palette)
  const getCurrentColors = () => {
    if (style.palette === "custom" && style.customColors) {
      return {
        primary: style.customColors.color1,
        secondary: style.customColors.color2,
        darkBg: style.customColors.color3,
        navyBg: style.customColors.color4,
        textLight: style.customColors.color5,
      };
    }
    return palettes[style.palette];
  };

  const currentColors = getCurrentColors();

  return (
    <div className="space-y-6">
      {/* Color Palette Selection */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
          <Palette className="w-4 h-4 text-pink-400" />
          {t.colorTheme}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {regularPaletteKeys.map((key) => {
            const p = palettes[key];
            const isSelected = style.palette === key;
            const isProTheme = key === "doingsPro";
            return (
              <button
                key={key}
                type="button"
                onClick={() => handlePaletteChange(key)}
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

          {/* Custom Colors Option */}
          <button
            type="button"
            onClick={() => handlePaletteChange("custom")}
            className={`p-3 rounded-lg transition-all flex flex-col items-center gap-2 relative col-span-2 ${
              style.palette === "custom"
                ? "ring-2 ring-pink-500 bg-gradient-to-r from-purple-900/50 to-pink-900/50"
                : "bg-gradient-to-r from-purple-900/20 to-pink-900/20 hover:from-purple-900/40 hover:to-pink-900/40 border border-purple-500/30"
            }`}
          >
            <span className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
              {language === "sv" ? "EGEN" : "CUSTOM"}
            </span>
            <div className="flex gap-1">
              {style.customColors ? (
                <>
                  <div className="w-5 h-5 rounded" style={{ backgroundColor: style.customColors.color1 }} />
                  <div className="w-5 h-5 rounded" style={{ backgroundColor: style.customColors.color2 }} />
                  <div className="w-5 h-5 rounded" style={{ backgroundColor: style.customColors.color3 }} />
                  <div className="w-5 h-5 rounded" style={{ backgroundColor: style.customColors.color4 }} />
                  <div className="w-5 h-5 rounded border border-gray-600" style={{ backgroundColor: style.customColors.color5 }} />
                </>
              ) : (
                <>
                  <div className="w-5 h-5 rounded bg-gradient-to-br from-pink-500 to-purple-500" />
                  <div className="w-5 h-5 rounded bg-gradient-to-br from-purple-500 to-blue-500" />
                  <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-cyan-500" />
                  <div className="w-5 h-5 rounded bg-gradient-to-br from-cyan-500 to-green-500" />
                  <div className="w-5 h-5 rounded bg-gradient-to-br from-green-500 to-yellow-500" />
                </>
              )}
            </div>
            <span className="text-white text-sm font-medium">
              {language === "sv" ? "Egna färger (5 valfria)" : "Custom Colors (5 choices)"}
            </span>
          </button>
        </div>
      </div>

      {/* Custom Color Picker - shown when custom palette is selected */}
      {style.palette === "custom" && (
        <ColorPicker
          colors={style.customColors || defaultCustomColors}
          onChange={handleCustomColorsChange}
          language={language}
        />
      )}

      {/* Haikei Background Styles */}
      <div>
        <button
          type="button"
          onClick={() => setShowHaikeiOptions(!showHaikeiOptions)}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-300 mb-3"
        >
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-pink-400" />
            {language === "sv" ? "Dekorativa bakgrunder" : "Decorative Backgrounds"}
            {style.haikeiBackground && style.haikeiBackground !== "none" && (
              <span className="text-xs bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded">
                {haikeiBackgrounds[style.haikeiBackground].name}
              </span>
            )}
          </div>
          {showHaikeiOptions ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {showHaikeiOptions && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(haikeiBackgrounds) as HaikeiBackground[]).map((bg) => {
                const config = haikeiBackgrounds[bg];
                const isSelected = (style.haikeiBackground || "none") === bg;
                return (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => handleHaikeiChange(bg)}
                    className={`p-2 rounded-lg transition-all flex flex-col items-center gap-1 ${
                      isSelected
                        ? "bg-pink-500 text-white"
                        : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700"
                    }`}
                    title={config.description}
                  >
                    <span className="text-lg">{config.icon}</span>
                    <span className="text-xs">{config.name}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500">
              {language === "sv"
                ? "Inspirerat av haikei.app - lägger till vågiga, organiska bakgrundselement"
                : "Inspired by haikei.app - adds wavy, organic background elements"}
            </p>
          </div>
        )}
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

        {/* Doings Pro Preview - special design */}
        {style.palette === "doingsPro" ? (
          <div className="aspect-video rounded-lg relative overflow-hidden" style={{ backgroundColor: "#0A0A14" }}>
            {/* Haikei background overlay */}
            {style.haikeiBackground && style.haikeiBackground !== "none" && (
              <div className="absolute inset-0 opacity-30">
                {style.haikeiBackground === "wave" && (
                  <svg viewBox="0 0 900 600" className="w-full h-full">
                    <path fill="#E85A9C" d="M0 400 Q225 350 450 400 T900 400 V600 H0Z" opacity="0.6"/>
                  </svg>
                )}
                {style.haikeiBackground === "layeredWaves" && (
                  <svg viewBox="0 0 900 600" className="w-full h-full">
                    <path fill="#E85A9C" d="M0 450 Q225 400 450 450 T900 450 V600 H0Z" opacity="0.4"/>
                    <path fill="#F5A68C" d="M0 500 Q225 450 450 500 T900 500 V600 H0Z" opacity="0.5"/>
                    <path fill="#C9A227" d="M0 550 Q225 500 450 550 T900 550 V600 H0Z" opacity="0.3"/>
                  </svg>
                )}
                {style.haikeiBackground === "blob" && (
                  <svg viewBox="0 0 900 600" className="w-full h-full">
                    <circle cx="700" cy="150" r="200" fill="#E85A9C" opacity="0.3"/>
                    <circle cx="200" cy="450" r="150" fill="#F5A68C" opacity="0.2"/>
                  </svg>
                )}
                {style.haikeiBackground === "circleScatter" && (
                  <svg viewBox="0 0 900 600" className="w-full h-full">
                    <circle cx="100" cy="100" r="40" fill="#E85A9C" opacity="0.4"/>
                    <circle cx="800" cy="200" r="60" fill="#F5A68C" opacity="0.3"/>
                    <circle cx="400" cy="500" r="50" fill="#C9A227" opacity="0.3"/>
                    <circle cx="700" cy="450" r="30" fill="#E85A9C" opacity="0.4"/>
                  </svg>
                )}
                {style.haikeiBackground === "blurryGradient" && (
                  <div className="w-full h-full" style={{
                    background: "radial-gradient(ellipse at 30% 20%, rgba(232,90,156,0.4) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(245,166,140,0.3) 0%, transparent 50%)"
                  }}/>
                )}
              </div>
            )}

            {/* Left sidebar accent */}
            <div className="absolute left-0 top-0 w-1.5 h-full" style={{ backgroundColor: "#E85A9C" }} />
            <div className="absolute top-0 left-8 right-0 h-1" style={{ backgroundColor: "#F5A68C" }} />
            <div className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: "#E85A9C" }}>
              1
            </div>
            <div className="p-6 pl-10 h-full flex flex-col justify-center relative z-10">
              <span className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "#E85A9C" }}>
                KEYNOTE
              </span>
              <h3 className="text-2xl font-black leading-tight mb-4">
                <span className="text-white">{language === "sv" ? "DIN RUBRIK" : "YOUR HEADLINE"}</span>
                <br />
                <span style={{ color: "#E85A9C" }}>{language === "sv" ? "HÄR" : "HERE"}</span>
              </h3>
              <div className="p-3 rounded" style={{ backgroundColor: "#1B2838", border: "2px solid #F5B8C8" }}>
                <p className="text-sm italic text-white/80">
                  "{language === "sv" ? "Kraftfull insikt..." : "Powerful insight..."}"
                </p>
              </div>
            </div>
            <div className="absolute bottom-4 right-4 flex flex-col gap-1">
              <div className="w-16 h-1" style={{ backgroundColor: "#C9A227" }} />
              <div className="w-12 h-1 ml-4" style={{ backgroundColor: "#F5A68C" }} />
            </div>
            <div className="absolute bottom-0 left-8 right-0 h-0.5" style={{ backgroundColor: "#4A7C7C" }} />
          </div>
        ) : (
          /* Standard/Custom preview */
          <div
            className="aspect-video rounded-lg p-6 flex flex-col justify-center items-center relative overflow-hidden"
            style={{
              backgroundColor:
                style.backgroundStyle === "light"
                  ? "#ffffff"
                  : style.palette === "custom" && style.customColors
                  ? style.customColors.color3
                  : getHexColor(palettes[style.palette].darkBg),
              background:
                style.backgroundStyle === "gradient"
                  ? `linear-gradient(135deg, ${
                      style.palette === "custom" && style.customColors
                        ? style.customColors.color3
                        : getHexColor(palettes[style.palette].darkBg)
                    } 0%, ${
                      style.palette === "custom" && style.customColors
                        ? style.customColors.color4
                        : getHexColor(palettes[style.palette].navyBg)
                    } 100%)`
                  : undefined,
            }}
          >
            {/* Haikei background overlay for custom/standard themes */}
            {style.haikeiBackground && style.haikeiBackground !== "none" && (
              <div className="absolute inset-0 opacity-40">
                {style.haikeiBackground === "wave" && (
                  <svg viewBox="0 0 900 600" className="w-full h-full">
                    <path
                      fill={style.palette === "custom" && style.customColors ? style.customColors.color1 : getHexColor(palettes[style.palette].primary)}
                      d="M0 400 Q225 350 450 400 T900 400 V600 H0Z"
                      opacity="0.6"
                    />
                  </svg>
                )}
                {style.haikeiBackground === "layeredWaves" && (
                  <svg viewBox="0 0 900 600" className="w-full h-full">
                    <path
                      fill={style.palette === "custom" && style.customColors ? style.customColors.color1 : getHexColor(palettes[style.palette].primary)}
                      d="M0 450 Q225 400 450 450 T900 450 V600 H0Z"
                      opacity="0.4"
                    />
                    <path
                      fill={style.palette === "custom" && style.customColors ? style.customColors.color2 : getHexColor(palettes[style.palette].secondary)}
                      d="M0 500 Q225 450 450 500 T900 500 V600 H0Z"
                      opacity="0.5"
                    />
                  </svg>
                )}
                {style.haikeiBackground === "circleScatter" && (
                  <svg viewBox="0 0 900 600" className="w-full h-full">
                    <circle
                      cx="100" cy="100" r="40"
                      fill={style.palette === "custom" && style.customColors ? style.customColors.color1 : getHexColor(palettes[style.palette].primary)}
                      opacity="0.4"
                    />
                    <circle
                      cx="800" cy="200" r="60"
                      fill={style.palette === "custom" && style.customColors ? style.customColors.color2 : getHexColor(palettes[style.palette].secondary)}
                      opacity="0.3"
                    />
                    <circle
                      cx="400" cy="500" r="50"
                      fill={style.palette === "custom" && style.customColors ? style.customColors.color1 : getHexColor(palettes[style.palette].primary)}
                      opacity="0.3"
                    />
                  </svg>
                )}
              </div>
            )}

            <h3
              className={`text-2xl font-bold text-center relative z-10 ${
                style.fontStyle === "modern"
                  ? "font-sans"
                  : style.fontStyle === "classic"
                  ? "font-serif"
                  : "font-mono"
              }`}
              style={{
                color: style.palette === "custom" && style.customColors
                  ? style.customColors.color1
                  : getHexColor(palettes[style.palette].primary),
              }}
            >
              {language === "sv" ? "Din rubrik här" : "Your Headline Here"}
            </h3>
            <p
              className="text-sm mt-2 opacity-60 relative z-10"
              style={{
                color:
                  style.backgroundStyle === "light"
                    ? "#333333"
                    : style.palette === "custom" && style.customColors
                    ? style.customColors.color5
                    : getHexColor(palettes[style.palette].textLight),
              }}
            >
              {language === "sv" ? "Underrubrik" : "Subtitle text preview"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
