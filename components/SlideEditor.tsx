"use client";

import { useState } from "react";
import { X, Save, Image, Wand2 } from "lucide-react";
import { Slide, Language, translations } from "@/lib/types";
import ImageGenerator from "./ImageGenerator";

interface SlideEditorProps {
  slide: Slide;
  onSave: (updatedSlide: Slide) => void;
  onClose: () => void;
  language: Language;
}

export default function SlideEditor({
  slide,
  onSave,
  onClose,
  language,
}: SlideEditorProps) {
  const [editedSlide, setEditedSlide] = useState<Slide>({ ...slide });
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const t = translations[language];

  const handleSave = () => {
    onSave(editedSlide);
    onClose();
  };

  const updateField = (field: keyof Slide, value: string | string[]) => {
    setEditedSlide((prev) => ({ ...prev, [field]: value }));
  };

  const updateContent = (index: number, value: string) => {
    const newContent = [...(editedSlide.content || [])];
    newContent[index] = value;
    setEditedSlide((prev) => ({ ...prev, content: newContent }));
  };

  const addContentItem = () => {
    setEditedSlide((prev) => ({
      ...prev,
      content: [...(prev.content || []), ""],
    }));
  };

  const removeContentItem = (index: number) => {
    const newContent = (editedSlide.content || []).filter((_, i) => i !== index);
    setEditedSlide((prev) => ({ ...prev, content: newContent }));
  };

  const handleImageGenerated = (imageBase64: string) => {
    // Update local state
    const updatedSlide = { ...editedSlide, image: imageBase64 };
    setEditedSlide(updatedSlide);
    // Auto-save the image immediately so user doesn't have to click "Save"
    onSave(updatedSlide);
  };

  const removeImage = () => {
    setEditedSlide((prev) => {
      const { image, ...rest } = prev;
      return rest as Slide;
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white">{t.editSlide}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === "sv" ? "Rubrik" : "Title"}
              </label>
              <input
                type="text"
                value={editedSlide.title}
                onChange={(e) => updateField("title", e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === "sv" ? "Underrubrik" : "Subtitle"}
              </label>
              <input
                type="text"
                value={editedSlide.subtitle || ""}
                onChange={(e) => updateField("subtitle", e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* Image Section */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Image className="w-4 h-4 inline mr-2" />
                {language === "sv" ? "Bild" : "Image"}
              </label>

              {editedSlide.image ? (
                <div className="space-y-2">
                  <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src={editedSlide.image.startsWith("data:")
                        ? editedSlide.image
                        : `data:image/png;base64,${editedSlide.image}`}
                      alt="Slide"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowImageGenerator(true)}
                      className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Wand2 className="w-4 h-4" />
                      {language === "sv" ? "Byt bild" : "Replace image"}
                    </button>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowImageGenerator(true)}
                  className="w-full py-4 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-pink-500 hover:text-pink-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Wand2 className="w-5 h-5" />
                  {language === "sv" ? "Generera bild med AI" : "Generate image with AI"}
                </button>
              )}
            </div>

            {/* Quote (for story slides) */}
            {editedSlide.type === "story" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {language === "sv" ? "Citat" : "Quote"}
                  </label>
                  <textarea
                    value={editedSlide.quote || ""}
                    onChange={(e) => updateField("quote", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                  />
                </div>
              </>
            )}

            {/* Content items (for list slides) */}
            {editedSlide.type === "list" && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {language === "sv" ? "Punkter" : "List Items"}
                </label>
                <div className="space-y-2">
                  {(editedSlide.content || []).map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateContent(index, e.target.value)}
                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                      <button
                        onClick={() => removeContentItem(index)}
                        className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addContentItem}
                    className="w-full py-2 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-pink-500 hover:text-pink-400 transition-colors"
                  >
                    + {language === "sv" ? "Lägg till punkt" : "Add item"}
                  </button>
                </div>
              </div>
            )}

            {/* Speaker Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t.speakerNotes}
              </label>
              <textarea
                value={editedSlide.speakerNotes}
                onChange={(e) => updateField("speakerNotes", e.target.value)}
                rows={4}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-4 border-t border-gray-800">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {t.saveChanges}
            </button>
          </div>
        </div>
      </div>

      {/* Image Generator Modal */}
      {showImageGenerator && (
        <ImageGenerator
          slideTitle={editedSlide.title}
          slideContent={editedSlide.subtitle || editedSlide.speakerNotes}
          currentImage={editedSlide.image}
          onImageGenerated={handleImageGenerated}
          onClose={() => setShowImageGenerator(false)}
          language={language}
        />
      )}
    </>
  );
}
