"use client";

import { useState } from "react";
import {
  FileText,
  Users,
  Clock,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { PresentationInput, Audience, Duration, Tonality } from "@/lib/types";

interface InputFormProps {
  onSubmit: (input: PresentationInput) => void;
  isLoading: boolean;
}

const audiences: { value: Audience; label: string; description: string }[] = [
  { value: "c-suite", label: "C-Suite", description: "Executive leadership" },
  { value: "team", label: "Team", description: "Internal team members" },
  { value: "customers", label: "Customers", description: "External clients" },
  { value: "general", label: "General", description: "Mixed audience" },
];

const durations: { value: Duration; label: string }[] = [
  { value: 10, label: "10 min" },
  { value: 20, label: "20 min" },
  { value: 30, label: "30 min" },
];

const tonalities: { value: Tonality; label: string; emoji: string }[] = [
  { value: "inspiring", label: "Inspiring", emoji: "✨" },
  { value: "informative", label: "Informative", emoji: "📊" },
  { value: "provocative", label: "Provocative", emoji: "🔥" },
];

export default function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState<Audience>("general");
  const [duration, setDuration] = useState<Duration>(20);
  const [tonality, setTonality] = useState<Tonality>("inspiring");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !topic.trim()) return;

    onSubmit({
      content,
      topic,
      audience,
      duration,
      tonality,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Topic Input */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
          <Sparkles className="w-4 h-4 text-pink-400" />
          Presentation Topic
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., The Future of AI in Healthcare"
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Content Textarea */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
          <FileText className="w-4 h-4 text-pink-400" />
          Content / Transcript / Notes
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste your transcript, meeting notes, article, or any content you want to transform into a TED Talk presentation..."
          rows={8}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          {content.length} characters
        </p>
      </div>

      {/* Audience Selection */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
          <Users className="w-4 h-4 text-pink-400" />
          Target Audience
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {audiences.map((a) => (
            <button
              key={a.value}
              type="button"
              onClick={() => setAudience(a.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                audience === a.value
                  ? "bg-pink-500 text-white"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Duration Selection */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
          <Clock className="w-4 h-4 text-pink-400" />
          Duration
        </label>
        <div className="flex gap-2">
          {durations.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDuration(d.value)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                duration === d.value
                  ? "bg-pink-500 text-white"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tonality Selection */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
          <Sparkles className="w-4 h-4 text-pink-400" />
          Tonality
        </label>
        <div className="flex gap-2">
          {tonalities.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTonality(t.value)}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                tonality === t.value
                  ? "bg-pink-500 text-white"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700"
              }`}
            >
              <span className="mr-2">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !content.trim() || !topic.trim()}
        className="w-full py-4 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Generating your TED Talk...
          </span>
        ) : (
          "Generate TED Talk Presentation"
        )}
      </button>
    </form>
  );
}
