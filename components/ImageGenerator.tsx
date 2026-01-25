"use client";

import { useState } from "react";
import { Image, Wand2, RefreshCw, X } from "lucide-react";

interface ImageGeneratorProps {
  slideTitle: string;
  slideContent?: string;
  currentImage?: string;
  onImageGenerated: (imageBase64: string) => void;
  onClose: () => void;
  language: "en" | "sv";
}

const imageStyles = [
  { value: "minimalist", label: { en: "Minimalist", sv: "Minimalistisk" }, emoji: "◻️" },
  { value: "photorealistic", label: { en: "Photo", sv: "Foto" }, emoji: "📷" },
  { value: "artistic", label: { en: "Artistic", sv: "Konstnärlig" }, emoji: "🎨" },
];

export default function ImageGenerator({
  slideTitle,
  slideContent,
  currentImage,
  onImageGenerated,
  onClose,
  language,
}: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState(
    `Visual for: ${slideTitle}${slideContent ? `. Context: ${slideContent.substring(0, 100)}` : ""}`
  );
  const [style, setStyle] = useState("minimalist");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate image");
      }

      const { image } = await response.json();
      setGeneratedImage(image);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseImage = () => {
    if (generatedImage) {
      onImageGenerated(generatedImage);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-gray-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Image className="w-5 h-5 text-pink-400" />
            {language === "sv" ? "Generera bild" : "Generate Image"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Prompt input */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              {language === "sv" ? "Beskriv bilden" : "Describe the image"}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              placeholder={
                language === "sv"
                  ? "Beskriv vilken typ av bild du vill ha..."
                  : "Describe what kind of image you want..."
              }
            />
          </div>

          {/* Style selection */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              {language === "sv" ? "Bildstil" : "Image style"}
            </label>
            <div className="flex gap-2">
              {imageStyles.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStyle(s.value)}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    style === s.value
                      ? "bg-pink-500 text-white"
                      : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700"
                  }`}
                >
                  <span className="mr-2">{s.emoji}</span>
                  {s.label[language]}
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={generateImage}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                {language === "sv" ? "Genererar..." : "Generating..."}
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                {language === "sv" ? "Generera bild" : "Generate image"}
              </>
            )}
          </button>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Generated image preview */}
          {generatedImage && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300 block">
                {language === "sv" ? "Förhandsvisning" : "Preview"}
              </label>
              <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
                <img
                  src={`data:image/png;base64,${generatedImage}`}
                  alt="Generated"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={generateImage}
                  disabled={isGenerating}
                  className="flex-1 py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
                  {language === "sv" ? "Generera ny" : "Regenerate"}
                </button>
                <button
                  onClick={handleUseImage}
                  className="flex-1 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-500 transition-all"
                >
                  {language === "sv" ? "Använd denna bild" : "Use this image"}
                </button>
              </div>
            </div>
          )}

          {/* Current image */}
          {currentImage && !generatedImage && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 block">
                {language === "sv" ? "Nuvarande bild" : "Current image"}
              </label>
              <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                <img
                  src={currentImage.startsWith("data:") ? currentImage : `data:image/png;base64,${currentImage}`}
                  alt="Current"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
