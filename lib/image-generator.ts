// Google AI Image Generation (Imagen)

const GOOGLE_AI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict';

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

  const response = await fetch(`${GOOGLE_AI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      instances: [
        {
          prompt: enhancedPrompt,
        },
      ],
      parameters: {
        sampleCount: 1,
        aspectRatio: '16:9',
        safetyFilterLevel: 'block_few',
        personGeneration: 'allow_adult',
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google AI API error: ${error}`);
  }

  const data = await response.json();

  if (!data.predictions || data.predictions.length === 0) {
    throw new Error('No image generated');
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
