"use client";

import { useState, useRef, useEffect } from "react";
import { FileText, Users, Clock, Sparkles, Globe, Upload, Link, X, Mic, MicOff, Target, BookOpen, GraduationCap, ImageIcon, Layers, Wand2, MessageSquarePlus, SplitSquareVertical, RefreshCw, Trash2 } from "lucide-react";
import {
  PresentationInput,
  Audience,
  Duration,
  Tonality,
  Language,
  PresentationType,
  KnowledgeLevel,
  ImageStyle,
  SlideCount,
  PresentationParts,
  translations,
} from "@/lib/types";

interface InputFormProps {
  onSubmit: (input: PresentationInput) => void;
  isLoading: boolean;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

const audiences: Audience[] = ["c-suite", "team", "customers", "general", "investors", "students", "experts", "mixed"];
const durations: Duration[] = [5, 10, 20, 30, 45];
const tonalities: { value: Tonality; emoji: string }[] = [
  { value: "inspiring", emoji: "✨" },
  { value: "informative", emoji: "📊" },
  { value: "provocative", emoji: "🔥" },
];
const presentationTypes: { value: PresentationType; emoji: string }[] = [
  { value: "keynote", emoji: "🎤" },
  { value: "educational", emoji: "📚" },
  { value: "informative", emoji: "📋" },
  { value: "pitch", emoji: "💼" },
  { value: "workshop", emoji: "🛠️" },
  { value: "summary", emoji: "📝" },
  { value: "proposal", emoji: "📄" },
];
const knowledgeLevels: { value: KnowledgeLevel; emoji: string }[] = [
  { value: "beginner", emoji: "🌱" },
  { value: "intermediate", emoji: "🌿" },
  { value: "advanced", emoji: "🌳" },
  { value: "mixed", emoji: "🎯" },
];

const imageStyles: { value: ImageStyle; emoji: string }[] = [
  { value: "none", emoji: "🚫" },
  { value: "professional", emoji: "📸" },
  { value: "abstract", emoji: "🎨" },
  { value: "illustrative", emoji: "✏️" },
];

const slideCounts: SlideCount[] = [10, 15, 20, 30, 40, 50, 70];

const presentationParts: PresentationParts[] = [1, 2, 3, 4, 5];

const ACCEPTED_FILE_TYPES = ".txt,.md,.pdf,.docx,.pptx";

export default function InputForm({
  onSubmit,
  isLoading,
  language,
  onLanguageChange,
}: InputFormProps) {
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState<Audience>("general");
  const [duration, setDuration] = useState<Duration>(20);
  const [tonality, setTonality] = useState<Tonality>("inspiring");
  const [presentationType, setPresentationType] = useState<PresentationType>("keynote");
  const [knowledgeLevel, setKnowledgeLevel] = useState<KnowledgeLevel>("mixed");
  const [imageStyle, setImageStyle] = useState<ImageStyle>("none");
  const [slideCount, setSlideCount] = useState<SlideCount>(20);
  const [parts, setParts] = useState<PresentationParts>(1);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [enhanceStatus, setEnhanceStatus] = useState<"idle" | "success" | "error">("idle");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[language] as typeof translations.en;

  // Cleanup media recorder on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
      }
    };
  }, [mediaRecorder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !topic.trim()) return;

    onSubmit({
      content,
      topic,
      audience,
      duration,
      tonality,
      language,
      presentationType,
      knowledgeLevel,
      imageStyle,
      slideCount,
      presentationParts: parts,
      customPrompt: customPrompt.trim() || undefined,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingFile(true);
    setUploadedFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/parse-file', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to parse file');
      }

      const { text } = await response.json();
      setContent(prev => prev ? prev + "\n\n" + text : text);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to parse file');
      setUploadedFileName(null);
    } finally {
      setIsParsingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlFetch = async () => {
    if (!urlInput.trim()) return;

    setIsParsingFile(true);

    try {
      const formData = new FormData();
      formData.append('url', urlInput);

      const response = await fetch('/api/parse-file', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch URL');
      }

      const { text } = await response.json();
      setContent(prev => prev ? prev + "\n\n" + text : text);
      setUploadedFileName(urlInput);
      setShowUrlInput(false);
      setUrlInput("");
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to fetch URL');
    } finally {
      setIsParsingFile(false);
    }
  };

  const clearUploadedFile = () => {
    setUploadedFileName(null);
    setContent("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());

        // Here we would normally send to a speech-to-text API
        // For now, we'll show a message that the feature requires API integration
        const transcribedText = await transcribeAudio(audioBlob);
        if (transcribedText) {
          setContent(prev => prev ? prev + "\n\n" + transcribedText : transcribedText);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks([]);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert(language === "sv"
        ? "Kunde inte starta mikrofonen. Kontrollera att du har gett tillåtelse."
        : "Could not start microphone. Please check that you have granted permission.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // Transcribe audio using Groq Whisper API
  const transcribeAudio = async (audioBlob: Blob): Promise<string | null> => {
    try {
      const formData = new FormData();
      // Convert blob to file with proper extension
      const audioFile = new File([audioBlob], "recording.webm", {
        type: audioBlob.type || "audio/webm",
      });
      formData.append("audio", audioFile);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Transcription failed");
      }

      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error("Transcription error:", error);
      alert(language === "sv"
        ? "Kunde inte transkribera ljudet. Kontrollera att GROQ_API_KEY är konfigurerad."
        : "Could not transcribe audio. Check that GROQ_API_KEY is configured.");
      return null;
    }
  };

  // Enhance prompt with AI
  const handleEnhancePrompt = async () => {
    if (!topic.trim()) {
      alert(language === "sv"
        ? "Ange ett ämne först innan du förbättrar prompten."
        : "Please enter a topic first before enhancing the prompt.");
      return;
    }

    setIsEnhancingPrompt(true);
    setEnhanceStatus("idle");

    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          content: content.substring(0, 2000),
          currentPrompt: customPrompt,
          audience,
          presentationType,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to enhance prompt");
      }

      const data = await response.json();

      if (data.success && data.suggestions) {
        // Append suggestions to custom prompt
        const newPrompt = customPrompt
          ? `${customPrompt}\n\n--- AI-förslag ---\n${data.suggestions}`
          : data.suggestions;
        setCustomPrompt(newPrompt);
        setEnhanceStatus("success");
        setTimeout(() => setEnhanceStatus("idle"), 3000);
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (error) {
      console.error("Enhance prompt error:", error);
      setEnhanceStatus("error");
      setTimeout(() => setEnhanceStatus("idle"), 3000);
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Language Selection */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
          <Globe className="w-4 h-4 text-pink-400" />
          {t.language}
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onLanguageChange("en")}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              language === "en"
                ? "bg-pink-500 text-white"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700"
            }`}
          >
            🇬🇧 English
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange("sv")}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              language === "sv"
                ? "bg-pink-500 text-white"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700"
            }`}
          >
            🇸🇪 Svenska
          </button>
        </div>
      </div>

      {/* Topic Input */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
          <Sparkles className="w-4 h-4 text-pink-400" />
          {t.topic}
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={t.topicPlaceholder}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Content Input with File Upload and Voice */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
          <FileText className="w-4 h-4 text-pink-400" />
          {t.content}
        </label>

        {/* Upload buttons and voice recording */}
        <div className="flex flex-wrap gap-2 mb-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_FILE_TYPES}
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
              isParsingFile
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700 hover:border-pink-500/50"
            }`}
          >
            <Upload className="w-4 h-4" />
            {language === "sv" ? "Ladda upp" : "Upload"}
          </label>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700 hover:border-pink-500/50 transition-all"
          >
            <Link className="w-4 h-4" />
            URL
          </button>

          {/* Voice Recording Button */}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              isRecording
                ? "bg-red-500 text-white animate-pulse"
                : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700 hover:border-pink-500/50"
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-4 h-4" />
                {t.stopRecording}
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                {t.startRecording}
              </>
            )}
          </button>
        </div>

        {/* Recording indicator */}
        {isRecording && (
          <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-red-900/30 border border-red-700/50 rounded-lg">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm text-red-300">{t.recording}</span>
          </div>
        )}

        {/* URL input field */}
        {showUrlInput && (
          <div className="flex gap-2 mb-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/article"
              className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
            />
            <button
              type="button"
              onClick={handleUrlFetch}
              disabled={isParsingFile || !urlInput.trim()}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg text-sm font-medium hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {language === "sv" ? "Hämta" : "Fetch"}
            </button>
          </div>
        )}

        {/* Uploaded file indicator */}
        {uploadedFileName && (
          <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-green-900/30 border border-green-700/50 rounded-lg">
            <FileText className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-300 flex-1 truncate">{uploadedFileName}</span>
            <button
              type="button"
              onClick={clearUploadedFile}
              className="text-green-400 hover:text-green-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Loading indicator */}
        {isParsingFile && (
          <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-blue-900/30 border border-blue-700/50 rounded-lg">
            <svg className="animate-spin h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm text-blue-300">
              {language === "sv" ? "Bearbetar fil..." : "Processing file..."}
            </span>
          </div>
        )}

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t.contentPlaceholder}
          rows={8}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          {content.length} {t.characters}
        </p>
      </div>

      {/* Presentation Type Selection */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
          <Target className="w-4 h-4 text-pink-400" />
          {t.presentationType}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {presentationTypes.map((pt) => (
            <button
              key={pt.value}
              type="button"
              onClick={() => setPresentationType(pt.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                presentationType === pt.value
                  ? "bg-pink-500 text-white"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700"
              }`}
            >
              <span className="mr-1">{pt.emoji}</span>
              {t.presentationTypes[pt.value]}
            </button>
          ))}
        </div>
      </div>

      {/* Audience Selection */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
          <Users className="w-4 h-4 text-pink-400" />
          {t.audience}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {audiences.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAudience(a)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                audience === a
                  ? "bg-pink-500 text-white"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700"
              }`}
            >
              {t.audiences[a]}
            </button>
          ))}
        </div>
      </div>

      {/* Knowledge Level Selection */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
          <GraduationCap className="w-4 h-4 text-pink-400" />
          {t.knowledgeLevel}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {knowledgeLevels.map((kl) => (
            <button
              key={kl.value}
              type="button"
              onClick={() => setKnowledgeLevel(kl.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                knowledgeLevel === kl.value
                  ? "bg-pink-500 text-white"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700"
              }`}
            >
              <span className="mr-1">{kl.emoji}</span>
              {t.knowledgeLevels[kl.value]}
            </button>
          ))}
        </div>
      </div>

      {/* Duration Selection */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
          <Clock className="w-4 h-4 text-pink-400" />
          {t.duration}
        </label>
        <div className="flex gap-2 flex-wrap">
          {durations.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDuration(d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                duration === d
                  ? "bg-pink-500 text-white"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700"
              }`}
            >
              {d} min
            </button>
          ))}
        </div>
      </div>

      {/* Tonality Selection */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
          <BookOpen className="w-4 h-4 text-pink-400" />
          {t.tonality}
        </label>
        <div className="flex gap-2">
          {tonalities.map((ton) => (
            <button
              key={ton.value}
              type="button"
              onClick={() => setTonality(ton.value)}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                tonality === ton.value
                  ? "bg-pink-500 text-white"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700"
              }`}
            >
              <span className="mr-2">{ton.emoji}</span>
              {t.tonalities[ton.value]}
            </button>
          ))}
        </div>
      </div>

      {/* Image Style Selection */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
          <ImageIcon className="w-4 h-4 text-pink-400" />
          {t.imageStyle}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {imageStyles.map((is) => (
            <button
              key={is.value}
              type="button"
              onClick={() => setImageStyle(is.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                imageStyle === is.value
                  ? "bg-pink-500 text-white"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700"
              }`}
            >
              <span className="mr-1">{is.emoji}</span>
              {t.imageStyles[is.value]}
            </button>
          ))}
        </div>
        {imageStyle !== "none" && (
          <p className="text-xs text-amber-400/80 mt-2">
            {language === "sv"
              ? "⚡ AI-bilder genereras med Google Imagen 3. Kräver GOOGLE_AI_API_KEY i miljövariabler."
              : "⚡ AI images generated with Google Imagen 3. Requires GOOGLE_AI_API_KEY in environment."}
          </p>
        )}
      </div>

      {/* Slide Count Selection */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
          <Layers className="w-4 h-4 text-pink-400" />
          {t.slideCount}
        </label>
        <div className="flex gap-2 flex-wrap">
          {slideCounts.map((sc) => (
            <button
              key={sc}
              type="button"
              onClick={() => setSlideCount(sc)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                slideCount === sc
                  ? "bg-pink-500 text-white"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700"
              }`}
            >
              {sc}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {language === "sv"
            ? `${slideCount} slides ≈ ${Math.round(slideCount * 1.5)} min presentation`
            : `${slideCount} slides ≈ ${Math.round(slideCount * 1.5)} min presentation`}
        </p>
      </div>

      {/* Presentation Parts Selection */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
          <SplitSquareVertical className="w-4 h-4 text-pink-400" />
          {(t as typeof translations.en).presentationParts || (language === "sv" ? "Dela upp presentation" : "Split Presentation")}
        </label>
        <div className="flex gap-2 flex-wrap">
          {presentationParts.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setParts(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                parts === p
                  ? "bg-pink-500 text-white"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700"
              }`}
            >
              {(t as typeof translations.en).presentationPartsOptions?.[p] || (p === 1 ? (language === "sv" ? "En fil" : "One file") : `${p} ${language === "sv" ? "delar" : "parts"}`)}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {(t as typeof translations.en).presentationPartsHelp || (language === "sv"
            ? "Dela upp i flera PowerPoint-filer (bra för kurser/utbildningar)"
            : "Split into multiple PowerPoint files (useful for courses/training)")}
        </p>
        {parts > 1 && (
          <p className="text-xs text-amber-400/80 mt-1">
            {language === "sv"
              ? `📁 ${parts} separata filer genereras med ~${Math.ceil(slideCount / parts)} slides vardera`
              : `📁 ${parts} separate files will be generated with ~${Math.ceil(slideCount / parts)} slides each`}
          </p>
        )}
      </div>

      {/* Custom Prompt Section */}
      <div className="border border-purple-500/30 rounded-lg p-4 bg-purple-900/10">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
          <MessageSquarePlus className="w-4 h-4 text-purple-400" />
          {t.customPrompt}
        </label>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder={t.customPromptPlaceholder}
          rows={4}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none mb-3"
        />
        <div className="flex flex-wrap items-center gap-2">
          {/* Enhance with AI button */}
          <button
            type="button"
            onClick={handleEnhancePrompt}
            disabled={isEnhancingPrompt || !topic.trim()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isEnhancingPrompt
                ? "bg-purple-700 text-purple-200 cursor-wait"
                : enhanceStatus === "success"
                ? "bg-green-600 text-white"
                : enhanceStatus === "error"
                ? "bg-red-600 text-white"
                : "bg-purple-600 hover:bg-purple-500 text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isEnhancingPrompt ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t.enhancingPrompt}
              </>
            ) : enhanceStatus === "success" ? (
              <>✓ {t.promptEnhanced}</>
            ) : enhanceStatus === "error" ? (
              <>✗ {t.promptEnhanceError}</>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                {t.enhancePrompt}
              </>
            )}
          </button>

          {/* Regenerate AI suggestions button - only show if there's content */}
          {customPrompt && customPrompt.includes("---") && (
            <button
              type="button"
              onClick={handleEnhancePrompt}
              disabled={isEnhancingPrompt || !topic.trim()}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-700 hover:bg-gray-600 text-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title={language === "sv" ? "Generera nya AI-förslag" : "Generate new AI suggestions"}
            >
              <RefreshCw className="w-4 h-4" />
              {language === "sv" ? "Nya förslag" : "New suggestions"}
            </button>
          )}

          {/* Clear prompt button - only show if there's content */}
          {customPrompt && (
            <button
              type="button"
              onClick={() => setCustomPrompt("")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-800/50 hover:bg-red-900/30 text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-500/50 transition-all"
              title={language === "sv" ? "Rensa instruktioner" : "Clear instructions"}
            >
              <Trash2 className="w-4 h-4" />
              {language === "sv" ? "Rensa" : "Clear"}
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {language === "sv"
            ? "Få AI-hjälp med perspektiv, vinklar och vad du kan ha missat"
            : "Get AI help with perspectives, angles, and what you might have missed"}
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !content.trim() || !topic.trim()}
        className="w-full py-4 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
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
            {t.generating}
          </span>
        ) : (
          t.generate
        )}
      </button>
    </form>
  );
}
