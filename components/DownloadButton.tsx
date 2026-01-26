"use client";

import { useState } from "react";
import { Download, Loader2, CheckCircle, Archive } from "lucide-react";
import { GeneratedPresentation, PresentationStyle, Language, PresentationParts, translations } from "@/lib/types";

interface DownloadButtonProps {
  presentation: GeneratedPresentation | null;
  style: PresentationStyle;
  language: Language;
  disabled?: boolean;
  parts?: PresentationParts;
}

export default function DownloadButton({
  presentation,
  style,
  language,
  disabled,
  parts = 1,
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const t = translations[language];

  const isMultiPart = parts > 1;

  const handleDownload = async () => {
    if (!presentation) return;

    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          presentation,
          style,
          parts,
        }),
      });

      if (!response.ok) {
        // Try to get the actual error message from the server
        let errorMessage = "Download failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If we can't parse JSON, use status text
          errorMessage = `Download failed: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Filename based on single vs multi-part
      const safeTitle = presentation.title.replace(/[^a-z0-9]/gi, "_");
      a.download = isMultiPart
        ? `${safeTitle}_Keynote_${parts}_parts.zip`
        : `${safeTitle}_Keynote.pptx`;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (error) {
      console.error("Download error:", error);
      alert(language === "sv"
        ? "Kunde inte ladda ner presentationen. Försök igen."
        : "Failed to download presentation. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Download button text based on parts
  const getDownloadText = () => {
    if (isMultiPart) {
      return language === "sv"
        ? `Ladda ner ${parts} filer (ZIP)`
        : `Download ${parts} files (ZIP)`;
    }
    return t.download;
  };

  return (
    <button
      onClick={handleDownload}
      disabled={disabled || !presentation || isDownloading}
      className={`w-full py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
        downloadSuccess
          ? "bg-green-500 text-white"
          : "bg-white text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      }`}
    >
      {isDownloading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          {t.downloading}
        </>
      ) : downloadSuccess ? (
        <>
          <CheckCircle className="w-5 h-5" />
          {t.downloaded}
        </>
      ) : (
        <>
          {isMultiPart ? <Archive className="w-5 h-5" /> : <Download className="w-5 h-5" />}
          {getDownloadText()}
        </>
      )}
    </button>
  );
}
