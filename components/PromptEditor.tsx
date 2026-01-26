"use client";

import { useState, useEffect } from "react";
import { Settings, X, RotateCcw, Check } from "lucide-react";
import { getDefaultPrompt, getPromptLabel } from "@/lib/prompts";

interface PromptEditorProps {
  category: "audience" | "tonality" | "presentationType" | "knowledgeLevel" | "imageStyle";
  value: string;
  language: "en" | "sv";
  customPrompt?: string;
  onPromptChange: (prompt: string | undefined) => void;
  disabled?: boolean;
}

export default function PromptEditor({
  category,
  value,
  language,
  customPrompt,
  onPromptChange,
  disabled = false,
}: PromptEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const defaultPrompt = getDefaultPrompt(category, value, language);
  const label = getPromptLabel(category, value, language);

  useEffect(() => {
    // When value changes, update the edited prompt
    const currentPrompt = customPrompt || defaultPrompt;
    setEditedPrompt(currentPrompt);
    setHasChanges(false);
  }, [value, customPrompt, defaultPrompt]);

  const handleOpen = () => {
    const currentPrompt = customPrompt || defaultPrompt;
    setEditedPrompt(currentPrompt);
    setHasChanges(false);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleReset = () => {
    setEditedPrompt(defaultPrompt);
    setHasChanges(true);
  };

  const handleSave = () => {
    // If it's the same as default, clear custom prompt
    if (editedPrompt.trim() === defaultPrompt.trim()) {
      onPromptChange(undefined);
    } else {
      onPromptChange(editedPrompt.trim());
    }
    setHasChanges(false);
    setIsOpen(false);
  };

  const handleTextChange = (newText: string) => {
    setEditedPrompt(newText);
    setHasChanges(newText.trim() !== (customPrompt || defaultPrompt).trim());
  };

  const isCustomized = customPrompt !== undefined && customPrompt !== defaultPrompt;

  return (
    <div className="relative">
      {/* Settings button */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled || !value}
        className={`p-1.5 rounded-lg transition-all ${
          disabled || !value
            ? "text-gray-600 cursor-not-allowed"
            : isCustomized
            ? "text-pink-400 hover:text-pink-300 hover:bg-pink-500/10"
            : "text-gray-500 hover:text-gray-300 hover:bg-gray-700/50"
        }`}
        title={
          language === "sv"
            ? isCustomized
              ? "Redigera anpassad prompt"
              : "Redigera prompt"
            : isCustomized
            ? "Edit custom prompt"
            : "Edit prompt"
        }
      >
        <Settings className={`w-4 h-4 ${isCustomized ? "fill-current" : ""}`} />
      </button>

      {/* Editor modal/dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleClose}
          />

          {/* Editor panel */}
          <div className="absolute right-0 top-full mt-2 z-50 w-[400px] max-w-[90vw] bg-gray-800 rounded-xl border border-gray-700 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div>
                <h3 className="font-semibold text-white text-sm">
                  {language === "sv" ? "Redigera prompt" : "Edit Prompt"}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {label}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-xs text-gray-400 mb-2">
                {language === "sv"
                  ? "Detta är instruktionen som skickas till AI:n för denna inställning:"
                  : "This is the instruction sent to the AI for this setting:"}
              </p>

              <textarea
                value={editedPrompt}
                onChange={(e) => handleTextChange(e.target.value)}
                className="w-full h-32 bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm text-gray-200 placeholder-gray-500 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none resize-none font-mono"
                placeholder={
                  language === "sv"
                    ? "Skriv din anpassade prompt här..."
                    : "Write your custom prompt here..."
                }
              />

              {isCustomized && !hasChanges && (
                <p className="text-xs text-pink-400 mt-2 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  {language === "sv" ? "Anpassad prompt aktiv" : "Custom prompt active"}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-700 bg-gray-800/50 rounded-b-xl">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {language === "sv" ? "Återställ standard" : "Reset to default"}
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {language === "sv" ? "Avbryt" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                    hasChanges
                      ? "bg-pink-600 hover:bg-pink-700 text-white"
                      : "bg-gray-700 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {language === "sv" ? "Spara" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
