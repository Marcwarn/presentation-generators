"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { GeneratedPresentation } from "@/lib/types";
import PreviewPanel from "@/components/PreviewPanel";

export default function SharedPresentationPage() {
  const params = useParams();
  const id = params.id as string;

  const [presentation, setPresentation] = useState<GeneratedPresentation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPresentation = async () => {
      try {
        const response = await fetch(`/api/presentations/${id}`);
        const data = await response.json();

        if (data.success && data.presentation) {
          setPresentation(data.presentation);
        } else {
          setError(data.error || "Presentation not found");
        }
      } catch (err) {
        console.error("Failed to load presentation:", err);
        setError("Failed to load presentation");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadPresentation();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading presentation...</p>
        </div>
      </div>
    );
  }

  if (error || !presentation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Presentation Not Found</h1>
          <p className="text-gray-400 mb-6">
            {error || "This presentation may have been deleted or the link is invalid."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Create Your Own Presentation
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">{presentation.title}</h1>
              <p className="text-sm text-gray-400">
                {presentation.slides.length} slides • Shared presentation
              </p>
            </div>
          </div>

        </div>
      </header>

      {/* Preview */}
      <main className="max-w-7xl mx-auto p-4">
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden p-6">
          <PreviewPanel
            slides={presentation.slides}
            style={presentation.style}
            title={presentation.title}
            language={presentation.input?.language || "en"}
          />
        </div>

        {/* Info notice */}
        <p className="text-center text-gray-500 text-sm mt-6">
          This is a shared presentation preview. Create your own to download as PowerPoint.
        </p>

        {/* CTA */}
        <div className="text-center mt-8 mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg transition-colors font-medium"
          >
            Create Your Own Presentation
          </Link>
        </div>
      </main>
    </div>
  );
}
