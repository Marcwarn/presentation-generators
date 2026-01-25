"use client";

import {
  MessageSquareQuote,
  List,
  GitCompare,
  Clock,
  Megaphone,
  Type,
  ChevronLeft,
  ChevronRight,
  Pencil,
} from "lucide-react";
import { useState } from "react";
import { Slide, PresentationStyle, Language, translations } from "@/lib/types";
import { palettes, getHexColor } from "@/lib/palettes";

interface PreviewPanelProps {
  slides: Slide[];
  style: PresentationStyle;
  title: string;
  language: Language;
  onEditSlide?: (slide: Slide) => void;
}

const slideTypeIcons = {
  statement: Type,
  story: MessageSquareQuote,
  list: List,
  comparison: GitCompare,
  timeline: Clock,
  cta: Megaphone,
};

const slideTypeLabels = {
  statement: { en: "Statement", sv: "Påstående" },
  story: { en: "Story", sv: "Berättelse" },
  list: { en: "List", sv: "Lista" },
  comparison: { en: "Comparison", sv: "Jämförelse" },
  timeline: { en: "Timeline", sv: "Tidslinje" },
  cta: { en: "Call to Action", sv: "Uppmaning" },
};

function SlidePreview({
  slide,
  style,
  index,
  language,
}: {
  slide: Slide;
  style: PresentationStyle;
  index: number;
  language: Language;
}) {
  const palette = palettes[style.palette];
  const isLightBg = style.backgroundStyle === "light" || style.palette === "minimal";
  const bgColor = isLightBg ? "#ffffff" : getHexColor(palette.darkBg);
  const textColor = isLightBg ? "#1a1a2e" : getHexColor(palette.textLight);
  const mutedColor = isLightBg ? "#666666" : getHexColor(palette.textMuted);

  const bgStyle =
    style.backgroundStyle === "gradient"
      ? {
          background: `linear-gradient(135deg, ${getHexColor(
            palette.darkBg
          )} 0%, ${getHexColor(palette.navyBg)} 100%)`,
        }
      : { backgroundColor: bgColor };

  const fontClass =
    style.fontStyle === "modern"
      ? "font-sans"
      : style.fontStyle === "classic"
      ? "font-serif"
      : "font-mono";

  const Icon = slideTypeIcons[slide.type];

  return (
    <div
      className={`aspect-video rounded-lg p-6 flex flex-col ${fontClass} relative overflow-hidden`}
      style={bgStyle}
    >
      <div
        className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
        style={{
          backgroundColor: getHexColor(palette.primary),
          color: "#ffffff",
        }}
      >
        {index + 1}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4" style={{ color: getHexColor(palette.accent) }} />
        <span className="text-xs uppercase tracking-wide" style={{ color: mutedColor }}>
          {slideTypeLabels[slide.type][language]}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {slide.type === "statement" && (
          <div className="text-center">
            <h2
              className="text-2xl md:text-3xl font-bold leading-tight"
              style={{ color: getHexColor(palette.primary) }}
            >
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p className="mt-3 text-sm" style={{ color: mutedColor }}>
                {slide.subtitle}
              </p>
            )}
          </div>
        )}

        {slide.type === "story" && (
          <div className="text-center px-4">
            <div
              className="text-4xl mb-4"
              style={{ color: getHexColor(palette.accent) }}
            >
              "
            </div>
            <p
              className="text-lg italic leading-relaxed"
              style={{ color: textColor }}
            >
              {slide.quote || slide.title}
            </p>
            {slide.attribution && (
              <p
                className="mt-4 text-sm"
                style={{ color: getHexColor(palette.secondary) }}
              >
                {slide.attribution}
              </p>
            )}
          </div>
        )}

        {slide.type === "list" && (
          <div>
            <h2
              className="text-xl font-bold mb-4"
              style={{ color: getHexColor(palette.primary) }}
            >
              {slide.title}
            </h2>
            <ul className="space-y-2">
              {slide.content?.slice(0, 4).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span
                    className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getHexColor(palette.accent) }}
                  />
                  <span style={{ color: textColor }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {slide.type === "comparison" && (
          <div>
            <h2
              className="text-xl font-bold mb-4 text-center"
              style={{ color: getHexColor(palette.primary) }}
            >
              {slide.title}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3
                  className="text-sm font-semibold mb-2"
                  style={{ color: getHexColor(palette.secondary) }}
                >
                  {slide.leftColumn?.title || "Before"}
                </h3>
                <ul className="space-y-1 text-xs">
                  {slide.leftColumn?.items?.slice(0, 3).map((item, i) => (
                    <li key={i} style={{ color: mutedColor }}>
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3
                  className="text-sm font-semibold mb-2"
                  style={{ color: getHexColor(palette.contrast) }}
                >
                  {slide.rightColumn?.title || "After"}
                </h3>
                <ul className="space-y-1 text-xs">
                  {slide.rightColumn?.items?.slice(0, 3).map((item, i) => (
                    <li key={i} style={{ color: mutedColor }}>
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {slide.type === "timeline" && (
          <div>
            <h2
              className="text-xl font-bold mb-4"
              style={{ color: getHexColor(palette.primary) }}
            >
              {slide.title}
            </h2>
            <div className="flex items-center justify-between">
              {slide.steps?.slice(0, 4).map((step, i) => (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2"
                    style={{
                      backgroundColor: getHexColor(palette.accent),
                      color: "#ffffff",
                    }}
                  >
                    {i + 1}
                  </div>
                  <span
                    className="text-xs text-center font-medium"
                    style={{ color: textColor }}
                  >
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {slide.type === "cta" && (
          <div className="text-center">
            <h2
              className="text-2xl md:text-3xl font-bold leading-tight"
              style={{ color: getHexColor(palette.primary) }}
            >
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p className="mt-4 text-lg" style={{ color: textColor }}>
                {slide.subtitle}
              </p>
            )}
            <div
              className="mt-6 inline-block px-6 py-2 rounded-full text-sm font-semibold"
              style={{
                backgroundColor: getHexColor(palette.accent),
                color: "#ffffff",
              }}
            >
              →
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PreviewPanel({
  slides,
  style,
  title,
  language,
  onEditSlide,
}: PreviewPanelProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const t = translations[language];

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-800/30 rounded-lg border border-gray-700 border-dashed">
        <p className="text-gray-500 text-center">
          {language === "sv"
            ? "Din presentation visas här"
            : "Your presentation preview will appear here"}
          <br />
          <span className="text-sm">
            {language === "sv" ? "efter generering" : "after generating"}
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <span className="text-sm text-gray-400">
          {slides.length} {t.slides}
        </span>
      </div>

      <div className="relative">
        <SlidePreview
          slide={slides[currentSlide]}
          style={style}
          index={currentSlide}
          language={language}
        />

        {/* Edit Button */}
        {onEditSlide && (
          <button
            onClick={() => onEditSlide(slides[currentSlide])}
            className="absolute top-3 left-3 p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-all"
            title={t.editSlide}
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}

        {slides.length > 1 && (
          <>
            <button
              onClick={() =>
                setCurrentSlide((prev) =>
                  prev === 0 ? slides.length - 1 : prev - 1
                )
              }
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() =>
                setCurrentSlide((prev) =>
                  prev === slides.length - 1 ? 0 : prev + 1
                )
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      <div className="flex justify-center gap-2 flex-wrap">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide
                ? "bg-pink-500 w-6"
                : "bg-gray-600 hover:bg-gray-500"
            }`}
          />
        ))}
      </div>

      {slides[currentSlide].speakerNotes && (
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-2">
            {t.speakerNotes}
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            {slides[currentSlide].speakerNotes}
          </p>
        </div>
      )}

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-4">
        {slides.map((slide, index) => {
          const Icon = slideTypeIcons[slide.type];
          return (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`aspect-video rounded bg-gray-800 flex items-center justify-center transition-all ${
                index === currentSlide
                  ? "ring-2 ring-pink-500"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <Icon className="w-4 h-4 text-gray-400" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
