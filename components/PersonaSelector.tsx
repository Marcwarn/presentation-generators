"use client";

import { useState, useEffect } from "react";
import { User, Save, Trash2, ChevronDown, Plus, Check, X } from "lucide-react";
import { Persona } from "@/lib/prompts";

interface PersonaSelectorProps {
  language: "en" | "sv";
  customPrompts: Record<string, string>;
  onLoadPersona: (persona: Persona) => void;
  onClearCustomPrompts: () => void;
  disabled?: boolean;
}

export default function PersonaSelector({
  language,
  customPrompts,
  onLoadPersona,
  onClearCustomPrompts,
  disabled = false,
}: PersonaSelectorProps) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newPersonaName, setNewPersonaName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Load personas from API
  useEffect(() => {
    const loadPersonas = async () => {
      try {
        const response = await fetch("/api/personas");
        const data = await response.json();
        if (data.success) {
          setPersonas(data.personas);
        }
      } catch (err) {
        console.error("Failed to load personas:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadPersonas();
  }, []);

  const hasCustomPrompts = Object.keys(customPrompts).length > 0;

  const handleSavePersona = async () => {
    if (!newPersonaName.trim() || !hasCustomPrompts) return;

    setError(null);
    try {
      const response = await fetch("/api/personas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPersonaName.trim(),
          customPrompts,
        }),
      });

      const data = await response.json();
      if (data.success && data.persona) {
        setPersonas((prev) => [data.persona, ...prev]);
        setNewPersonaName("");
        setIsSaving(false);
      } else {
        setError(data.error || "Failed to save persona");
      }
    } catch (err) {
      console.error("Failed to save persona:", err);
      setError(language === "sv" ? "Kunde inte spara persona" : "Failed to save persona");
    }
  };

  const handleDeletePersona = async (personaId: string) => {
    try {
      const response = await fetch(`/api/personas?id=${personaId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        setPersonas((prev) => prev.filter((p) => p.id !== personaId));
      }
    } catch (err) {
      console.error("Failed to delete persona:", err);
    }
    setDeleteConfirm(null);
  };

  const handleLoadPersona = (persona: Persona) => {
    onLoadPersona(persona);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Main button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
          disabled
            ? "border-gray-700 text-gray-600 cursor-not-allowed"
            : hasCustomPrompts
            ? "border-pink-500/50 text-pink-400 hover:bg-pink-500/10"
            : "border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300"
        }`}
      >
        <User className="w-4 h-4" />
        <span className="text-sm">
          {language === "sv" ? "Personas" : "Personas"}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false);
              setIsSaving(false);
              setDeleteConfirm(null);
            }}
          />

          <div className="absolute left-0 top-full mt-2 z-50 w-80 bg-gray-800 rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold text-white text-sm">
                {language === "sv" ? "Hantera Personas" : "Manage Personas"}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {language === "sv"
                  ? "Spara och ladda dina anpassade prompt-inställningar"
                  : "Save and load your custom prompt settings"}
              </p>
            </div>

            {/* Current status */}
            {hasCustomPrompts && (
              <div className="px-4 py-3 bg-pink-500/10 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-pink-400">
                    {language === "sv"
                      ? `${Object.keys(customPrompts).length} anpassade prompts aktiva`
                      : `${Object.keys(customPrompts).length} custom prompts active`}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClearCustomPrompts();
                    }}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    {language === "sv" ? "Rensa alla" : "Clear all"}
                  </button>
                </div>
              </div>
            )}

            {/* Save new persona */}
            {hasCustomPrompts && (
              <div className="p-4 border-b border-gray-700">
                {!isSaving ? (
                  <button
                    type="button"
                    onClick={() => setIsSaving(true)}
                    className="flex items-center gap-2 w-full px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {language === "sv" ? "Spara som ny persona" : "Save as new persona"}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newPersonaName}
                      onChange={(e) => setNewPersonaName(e.target.value)}
                      placeholder={language === "sv" ? "Personans namn..." : "Persona name..."}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:border-pink-500 outline-none"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSavePersona();
                        if (e.key === "Escape") setIsSaving(false);
                      }}
                    />
                    {error && <p className="text-xs text-red-400">{error}</p>}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsSaving(false)}
                        className="flex-1 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {language === "sv" ? "Avbryt" : "Cancel"}
                      </button>
                      <button
                        type="button"
                        onClick={handleSavePersona}
                        disabled={!newPersonaName.trim()}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          newPersonaName.trim()
                            ? "bg-pink-600 hover:bg-pink-700 text-white"
                            : "bg-gray-700 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <Save className="w-3.5 h-3.5" />
                        {language === "sv" ? "Spara" : "Save"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Personas list */}
            <div className="max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-400 text-sm">
                  {language === "sv" ? "Laddar..." : "Loading..."}
                </div>
              ) : personas.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  {language === "sv"
                    ? "Inga sparade personas ännu"
                    : "No saved personas yet"}
                </div>
              ) : (
                <div className="p-2">
                  {personas.map((persona) => (
                    <div
                      key={persona.id}
                      className="group flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/50"
                    >
                      {deleteConfirm === persona.id ? (
                        <div className="flex items-center gap-2 w-full">
                          <span className="text-xs text-gray-400 flex-1">
                            {language === "sv" ? "Ta bort?" : "Delete?"}
                          </span>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(null)}
                            className="p-1 text-gray-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePersona(persona.id)}
                            className="p-1 text-red-400 hover:text-red-300"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleLoadPersona(persona)}
                            className="flex-1 text-left"
                          >
                            <p className="text-sm text-white">{persona.name}</p>
                            <p className="text-xs text-gray-500">
                              {Object.keys(persona.customPrompts).length}{" "}
                              {language === "sv" ? "prompts" : "prompts"}
                            </p>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(persona.id)}
                            className="p-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
