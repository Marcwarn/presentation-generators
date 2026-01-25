"use client";

import { useState } from "react";
import { Mic, Sparkles, Settings, ChevronDown, ChevronUp } from "lucide-react";
import InputForm from "@/components/InputForm";
import StyleSelector from "@/components/StyleSelector";
import PreviewPanel from "@/components/PreviewPanel";
import DownloadButton from "@/components/DownloadButton";
import {
  PresentationInput,
  PresentationStyle,
  GeneratedPresentation,
} from "@/lib/types";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [presentation, setPresentation] = useState<GeneratedPresentation | null>(
    null
  );
  const [style, setStyle] = useState<PresentationStyle>({
    palette: "doings",
    backgroundStyle: "dark",
    fontStyle: "modern",
  });
  const [showStylePanel, setShowStylePanel] = useState(false);

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

      setPresentation(data.presentation);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">TED Talk Generator</h1>
              <p className="text-xs text-gray-400">Transform content into powerful presentations</p>
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
            {/* Input Section */}
            <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-pink-400" />
                <h2 className="text-lg font-semibold text-white">Create Your Presentation</h2>
              </div>
              <InputForm onSubmit={handleGenerate} isLoading={isLoading} />
            </div>

            {/* Style Section - Collapsible on mobile */}
            <div className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
              <button
                onClick={() => setShowStylePanel(!showStylePanel)}
                className="w-full px-6 py-4 flex items-center justify-between text-left lg:cursor-default"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-pink-400" />
                  <h2 className="text-lg font-semibold text-white">Style Options</h2>
                </div>
                <div className="lg:hidden">
                  {showStylePanel ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>
              <div
                className={`px-6 pb-6 ${
                  showStylePanel ? "block" : "hidden lg:block"
                }`}
              >
                <StyleSelector style={style} onChange={setStyle} />
              </div>
            </div>
          </div>

          {/* Right Column - Preview & Download */}
          <div className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
                <p className="font-medium">Error generating presentation</p>
                <p className="text-sm mt-1 opacity-80">{error}</p>
              </div>
            )}

            {/* Preview Panel */}
            <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
              <PreviewPanel
                slides={presentation?.slides || []}
                style={style}
                title={presentation?.title || "Your Presentation"}
              />
            </div>

            {/* Download Button */}
            {presentation && (
              <DownloadButton
                presentation={presentation}
                style={style}
                disabled={isLoading}
              />
            )}

            {/* Info Card */}
            <div className="bg-gradient-to-br from-pink-500/10 to-orange-400/10 rounded-2xl p-6 border border-pink-500/20">
              <h3 className="font-semibold text-white mb-2">
                TED Talk Structure
              </h3>
              <ol className="text-sm text-gray-400 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs">1</span>
                  <span>Hook - Capture attention</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs">2</span>
                  <span>Problem - Define the challenge</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs">3</span>
                  <span>Story - Share a real example</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs">4</span>
                  <span>Insight - Reveal what you learned</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs">5</span>
                  <span>Framework - New way to think</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs">6</span>
                  <span>Practical - Concrete steps</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs">7</span>
                  <span>CTA - Call to action</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-500">
            Built with Next.js, Claude AI, and PptxGenJS
          </p>
        </div>
      </footer>
    </main>
  );
}
