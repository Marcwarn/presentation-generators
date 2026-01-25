// Google Vertex AI Imagen 3 Image Generation

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

  // Try Imagen 3 via Generative Language API
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [
          { prompt: enhancedPrompt }
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: '16:9',
          personGeneration: 'DONT_ALLOW',
          safetySetting: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Imagen API error:', response.status, errorText);
    throw new Error(`Google Imagen API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  if (!data.predictions || data.predictions.length === 0) {
    throw new Error('No image generated from Imagen');
  }

  // Imagen returns bytesBase64Encoded
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
