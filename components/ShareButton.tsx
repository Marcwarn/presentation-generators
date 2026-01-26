"use client";

import { useState } from "react";
import { Share2, Copy, Check, X } from "lucide-react";
import { Language } from "@/lib/types";

interface ShareButtonProps {
  presentationId: string;
  language: Language;
}

export default function ShareButton({ presentationId, language }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/share/${presentationId}`
    : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: language === "sv" ? "Min presentation" : "My Presentation",
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or share failed, open modal instead
        setIsOpen(true);
      }
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        title={language === "sv" ? "Dela presentation" : "Share presentation"}
      >
        <Share2 className="w-4 h-4" />
        <span className="hidden sm:inline">
          {language === "sv" ? "Dela" : "Share"}
        </span>
      </button>

      {/* Share Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {language === "sv" ? "Dela presentation" : "Share Presentation"}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-white rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-400 text-sm mb-4">
              {language === "sv"
                ? "Kopiera länken nedan för att dela din presentation med andra."
                : "Copy the link below to share your presentation with others."}
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  copied
                    ? "bg-green-600 text-white"
                    : "bg-pink-600 hover:bg-pink-700 text-white"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{language === "sv" ? "Kopierad!" : "Copied!"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>{language === "sv" ? "Kopiera" : "Copy"}</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-gray-500 text-xs mt-4">
              {language === "sv"
                ? "OBS: Delade presentationer sparas i 30 dagar. Bilder ingår inte i delade presentationer."
                : "Note: Shared presentations are saved for 30 days. Images are not included in shared presentations."}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
