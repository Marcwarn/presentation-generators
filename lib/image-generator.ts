// Google AI Image Generation (Imagen 3 via Gemini API)

export interface GeneratedImage {
  base64: string;
  mimeType: string;
}

export async function generateImage(
  prompt: string,
  apiKey: string,
  style: 'photorealistic' | 'artistic' | 'minimalist' = 'minimalist'
): Promise<GeneratedImage> {
  const enhancedPrompt = buildEnhancedPrompt(prompt, style);

  // Use Gemini 2.0 Flash with image generation capability
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: enhancedPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ['image', 'text'],
          responseMimeType: 'text/plain',
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google AI API error:', response.status, errorText);

    // Try fallback to Imagen 3 endpoint
    return generateImageWithImagen(enhancedPrompt, apiKey);
  }

  const data = await response.json();

  // Extract image from Gemini response
  const candidates = data.candidates || [];
  for (const candidate of candidates) {
    const parts = candidate.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        return {
          base64: part.inlineData.data,
          mimeType: part.inlineData.mimeType || 'image/png',
        };
      }
    }
  }

  throw new Error('No image in response');
}

// Fallback to Imagen 3 direct API
async function generateImageWithImagen(
  prompt: string,
  apiKey: string
): Promise<GeneratedImage> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: '16:9',
          safetyFilterLevel: 'block_only_high',
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Imagen API error (${response.status}): ${error}`);
  }

  const data = await response.json();

  if (!data.predictions || data.predictions.length === 0) {
    throw new Error('No image generated from Imagen');
  }

  return {
    base64: data.predictions[0].bytesBase64Encoded,
    mimeType: 'image/png',
  };
}

function buildEnhancedPrompt(prompt: string, style: string): string {
  const styleModifiers: Record<string, string> = {
    photorealistic: 'Professional photography, high resolution, realistic lighting, corporate style',
    artistic: 'Artistic illustration, vibrant colors, creative composition, modern design',
    minimalist: 'Minimalist design, clean lines, simple shapes, professional presentation style, dark background with accent colors',
  };

  return `${prompt}. ${styleModifiers[style]}. Suitable for a professional presentation slide. 16:9 aspect ratio.`;
}

export async function generateSlideImage(
  slideTitle: string,
  slideContent: string,
  apiKey: string
): Promise<GeneratedImage> {
  const prompt = `Create a visual representation for a presentation slide about: "${slideTitle}". Context: ${slideContent.substring(0, 200)}`;

  return generateImage(prompt, apiKey, 'minimalist');
}
