"use client";

import { useState } from "react";
import { Download, Loader2, CheckCircle } from "lucide-react";
import { GeneratedPresentation, PresentationStyle } from "@/lib/types";

interface DownloadButtonProps {
  presentation: GeneratedPresentation | null;
  style: PresentationStyle;
  disabled?: boolean;
}

export default function DownloadButton({
  presentation,
  style,
  disabled,
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

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
        }),
      });

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${presentation.title.replace(/[^a-z0-9]/gi, "_")}_TED_Talk.pptx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download presentation. Please try again.");
    } finally {
      setIsDownloading(false);
    }
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
          Preparing Download...
        </>
      ) : downloadSuccess ? (
        <>
          <CheckCircle className="w-5 h-5" />
          Downloaded!
        </>
      ) : (
        <>
          <Download className="w-5 h-5" />
          Download PowerPoint
        </>
      )}
    </button>
  );
}
