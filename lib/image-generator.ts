// Google Gemini Image Generation
// Supports Gemini 2.0 Flash and future models

export interface GeneratedImage {
  base64: string;
  mimeType: string;
}

// Available Gemini models with image generation capability
const GEMINI_MODELS = [
  'gemini-2.0-flash-exp-image-generation',  // Primary - Gemini 2.0 Flash
  'gemini-2.0-flash',                        // Fallback
];

export async function generateImage(
  prompt: string,
  apiKey: string,
  style: 'photorealistic' | 'artistic' | 'minimalist' = 'minimalist'
): Promise<GeneratedImage> {
  const enhancedPrompt = buildEnhancedPrompt(prompt, style);

  // Try each model until one works
  let lastError: Error | null = null;

  for (const model of GEMINI_MODELS) {
    try {
      const result = await tryGenerateWithModel(model, enhancedPrompt, apiKey);
      if (result) {
        return result;
      }
    } catch (error) {
      console.log(`Model ${model} failed, trying next...`);
      lastError = error as Error;
    }
  }

  throw lastError || new Error('All Gemini models failed to generate image');
}

async function tryGenerateWithModel(
  model: string,
  prompt: string,
  apiKey: string
): Promise<GeneratedImage | null> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"]
        }
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Gemini API error (${model}):`, response.status, errorText);
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  // Extract image from Gemini response
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No response from Gemini');
  }

  const parts = data.candidates[0]?.content?.parts || [];
  const imagePart = parts.find((part: any) => part.inlineData);

  if (!imagePart || !imagePart.inlineData) {
    // No image in response - might be a text-only response
    return null;
  }

  return {
    base64: imagePart.inlineData.data,
    mimeType: imagePart.inlineData.mimeType || 'image/png',
  };
}

function buildEnhancedPrompt(prompt: string, style: string): string {
  const styleModifiers: Record<string, string> = {
    photorealistic: 'Professional photography, high resolution, realistic lighting, corporate style',
    artistic: 'Artistic illustration, vibrant colors, creative composition, modern design, abstract shapes',
    minimalist: 'Minimalist design, clean lines, simple geometric shapes, professional presentation style, dark background with subtle accent colors',
  };

  // CRITICAL: Explicitly forbid any text in the image multiple times
  return `Generate a PURELY VISUAL image (no text whatsoever): ${prompt}.

CRITICAL REQUIREMENTS:
- ABSOLUTELY NO TEXT, WORDS, LETTERS, NUMBERS, CAPTIONS, LABELS, OR TYPOGRAPHY IN THE IMAGE
- NO watermarks, titles, subtitles, or any written content
- The image must be 100% visual/graphical only
- This is a background image for a presentation - text will be overlaid separately

Style: ${styleModifiers[style]}.
Aspect ratio: 16:9 landscape format suitable for presentation slides.

REMINDER: Generate ONLY visuals - zero text elements.`;
}

export async function generateSlideImage(
  slideTitle: string,
  slideContent: string,
  apiKey: string,
  style: 'photorealistic' | 'artistic' | 'minimalist' = 'minimalist'
): Promise<GeneratedImage> {
  // Create a visual concept prompt based on slide content
  const prompt = `Create a visual representation for a presentation slide about: "${slideTitle}". The concept should convey: ${slideContent.substring(0, 150)}`;

  return generateImage(prompt, apiKey, style);
}
