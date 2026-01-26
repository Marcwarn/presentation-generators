"use client";

import { useState } from "react";
import { Mic, Sparkles, Settings, ChevronDown, ChevronUp, PlusCircle } from "lucide-react";
import InputForm from "@/components/InputForm";
import StyleSelector from "@/components/StyleSelector";
import PreviewPanel from "@/components/PreviewPanel";
import DownloadButton from "@/components/DownloadButton";
import HistoryPanel from "@/components/HistoryPanel";
import SlideEditor from "@/components/SlideEditor";
import {
  PresentationInput,
  PresentationStyle,
  GeneratedPresentation,
  Slide,
  Language,
  translations,
} from "@/lib/types";
import { savePresentation } from "@/lib/storage";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [presentation, setPresentation] = useState<GeneratedPresentation | null>(null);
  const [style, setStyle] = useState<PresentationStyle>({
    palette: "doings",
    backgroundStyle: "dark",
    fontStyle: "modern",
  });
  const [language, setLanguage] = useState<Language>("en");
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);

  const t = translations[language];

  const handleGenerate = async (input: PresentationInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input, style }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to generate presentation");
      }

      const newPresentation: GeneratedPresentation = {
        ...data.presentation,
        createdAt: new Date().toISOString(),
        input,
        style,
      };

      setPresentation(newPresentation);
      savePresentation(newPresentation);

      // Show image generation stats if applicable
      if (data.imageStats && input.imageStyle !== 'none') {
        const { imagesGenerated, errors } = data.imageStats;
        if (imagesGenerated > 0 || errors > 0) {
          const message = language === 'sv'
            ? `${imagesGenerated} bilder genererades${errors > 0 ? `, ${errors} misslyckades` : ''}`
            : `${imagesGenerated} images generated${errors > 0 ? `, ${errors} failed` : ''}`;
          // Use a subtle notification instead of alert
          console.log('Image generation stats:', message);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadPresentation = (loadedPresentation: GeneratedPresentation) => {
    setPresentation(loadedPresentation);
    setStyle(loadedPresentation.style);
    setLanguage(loadedPresentation.input.language);
  };

  const handleEditSlide = (slide: Slide) => {
    setEditingSlide(slide);
  };

  const handleSaveSlide = (updatedSlide: Slide) => {
    if (!presentation) return;

    const updatedSlides = presentation.slides.map((s) =>
      s.id === updatedSlide.id ? updatedSlide : s
    );

    const updatedPresentation = {
      ...presentation,
      slides: updatedSlides,
    };

    setPresentation(updatedPresentation);
    savePresentation(updatedPresentation);
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{t.appTitle}</h1>
              <p className="text-xs text-gray-400">{t.appSubtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:block">Powered by</span>
            <span className="text-xs font-semibold text-pink-400">Claude AI</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* History Panel */}
            <HistoryPanel
              onLoad={handleLoadPresentation}
              language={language}
              currentPresentationId={presentation?.id}
            />

            {/* Input Section */}
            <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-pink-400" />
                <h2 className="text-lg font-semibold text-white">{t.createPresentation}</h2>
              </div>
              <InputForm
                onSubmit={handleGenerate}
                isLoading={isLoading}
                language={language}
                onLanguageChange={setLanguage}
              />
            </div>

            {/* Style Section */}
            <div className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
              <button
                onClick={() => setShowStylePanel(!showStylePanel)}
                className="w-full px-6 py-4 flex items-center justify-between text-left lg:cursor-default"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-pink-400" />
                  <h2 className="text-lg font-semibold text-white">{t.styleOptions}</h2>
                </div>
                <div className="lg:hidden">
                  {showStylePanel ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>
              <div className={`px-6 pb-6 ${showStylePanel ? "block" : "hidden lg:block"}`}>
                <StyleSelector style={style} onChange={setStyle} language={language} />
              </div>
            </div>
          </div>

          {/* Right Column - Preview & Download */}
          <div className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
                <p className="font-medium">
                  {language === "sv" ? "Fel vid generering" : "Error generating presentation"}
                </p>
                <p className="text-sm mt-1 opacity-80">{error}</p>
              </div>
            )}

            {/* Preview Panel */}
            <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
              <PreviewPanel
                slides={presentation?.slides || []}
                style={style}
                title={presentation?.title || (language === "sv" ? "Din presentation" : "Your Presentation")}
                language={language}
                onEditSlide={handleEditSlide}
              />
            </div>

            {/* Download and New Presentation Buttons */}
            {presentation && (
              <div className="flex gap-3">
                <DownloadButton
                  presentation={presentation}
                  style={style}
                  language={language}
                  disabled={isLoading}
                  parts={presentation.input.presentationParts}
                />
                <button
                  onClick={() => {
                    setPresentation(null);
                    setError(null);
                  }}
                  className="px-6 py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 bg-gray-800 text-gray-200 hover:bg-gray-700 border border-gray-700"
                >
                  <PlusCircle className="w-5 h-5" />
                  {language === "sv" ? "Skapa ny" : "Create new"}
                </button>
              </div>
            )}

            {/* Info Card */}
            <div className="bg-gradient-to-br from-pink-500/10 to-orange-400/10 rounded-2xl p-6 border border-pink-500/20">
              <h3 className="font-semibold text-white mb-2">{t.keynoteStructure}</h3>
              <ol className="text-sm text-gray-400 space-y-1.5">
                {t.steps.map((step, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Editor Modal */}
      {editingSlide && (
        <SlideEditor
          slide={editingSlide}
          onSave={handleSaveSlide}
          onClose={() => setEditingSlide(null)}
          language={language}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-500">
            Built with Next.js, Claude AI & PptxGenJS
          </p>
        </div>
      </footer>
    </main>
  );
}
