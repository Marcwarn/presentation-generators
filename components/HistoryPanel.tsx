"use client";

import { useState, useEffect } from "react";
import { History, Trash2, Clock, ChevronRight } from "lucide-react";
import { GeneratedPresentation, Language, translations } from "@/lib/types";
import { getPresentations, deletePresentation, clearPresentations } from "@/lib/storage";

interface HistoryPanelProps {
  onLoad: (presentation: GeneratedPresentation) => void;
  language: Language;
  currentPresentationId?: string;
}

export default function HistoryPanel({
  onLoad,
  language,
  currentPresentationId,
}: HistoryPanelProps) {
  const [presentations, setPresentations] = useState<GeneratedPresentation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const t = translations[language];

  useEffect(() => {
    setPresentations(getPresentations());
  }, [currentPresentationId]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deletePresentation(id);
    setPresentations(getPresentations());
  };

  const handleClearAll = () => {
    if (confirm(language === "sv" ? "Är du säker på att du vill ta bort all historik?" : "Are you sure you want to clear all history?")) {
      clearPresentations();
      setPresentations([]);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "sv" ? "sv-SE" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (presentations.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-pink-400" />
          <h2 className="text-lg font-semibold text-white">{t.history}</h2>
          <span className="px-2 py-0.5 bg-pink-500/20 text-pink-400 text-xs rounded-full">
            {presentations.length}
          </span>
        </div>
        <ChevronRight
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? "rotate-90" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-4 pb-4">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {presentations.map((presentation) => (
              <div
                key={presentation.id}
                onClick={() => onLoad(presentation)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  presentation.id === currentPresentationId
                    ? "bg-pink-500/20 border border-pink-500/30"
                    : "bg-gray-800/50 hover:bg-gray-800 border border-transparent"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">
                      {presentation.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(presentation.createdAt)}</span>
                      <span>•</span>
                      <span>{presentation.slides.length} slides</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(presentation.id, e)}
                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {presentations.length > 1 && (
            <button
              onClick={handleClearAll}
              className="w-full mt-3 py-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
            >
              {t.clearHistory}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
