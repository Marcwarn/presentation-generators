import { NextRequest, NextResponse } from "next/server";

// Gemini models that support image generation
const GEMINI_MODELS = [
  'gemini-2.0-flash-exp-image-generation',  // Primary
  'gemini-2.0-flash',                        // Fallback
];

export async function POST(request: NextRequest) {
  try {
    const { prompt, style = 'minimalist' } = await request.json();

    const apiKey = process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Google AI API key not configured. Add GOOGLE_AI_API_KEY to your environment variables." },
        { status: 500 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: "No prompt provided" },
        { status: 400 }
      );
    }

    const styleModifiers: Record<string, string> = {
      photorealistic: 'Professional photography, high resolution, realistic lighting, corporate style, no text or words in the image',
      artistic: 'Artistic illustration, vibrant colors, creative composition, modern design, abstract, no text or words in the image',
      minimalist: 'Minimalist design, clean lines, simple geometric shapes, professional presentation style, dark background with subtle accent colors, no text or words in the image',
    };

    const enhancedPrompt = `Generate an image: ${prompt}. Style: ${styleModifiers[style] || styleModifiers.minimalist}. The image should be suitable for a professional presentation slide with 16:9 aspect ratio. Do NOT include any text, words, letters, or numbers in the image.`;

    // Try each model until one works
    let lastError = '';

    for (const model of GEMINI_MODELS) {
      try {
        const result = await tryGenerateWithModel(model, enhancedPrompt, apiKey);
        if (result) {
          return NextResponse.json(result);
        }
      } catch (error) {
        console.log(`Model ${model} failed, trying next...`);
        lastError = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    return NextResponse.json(
      { error: `Image generation failed with all models. Last error: ${lastError}` },
      { status: 500 }
    );

  } catch (error) {
    console.error("Generate image error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate image" },
      { status: 500 }
    );
  }
}

async function tryGenerateWithModel(
  model: string,
  prompt: string,
  apiKey: string
): Promise<{ image: string; mimeType: string } | null> {

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
    const error = await response.text();
    console.error(`Gemini API error (${model}):`, response.status, error);
    throw new Error(`${model}: ${response.status} - ${error}`);
  }

  const data = await response.json();

  // Extract image from Gemini response
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error(`${model}: No response`);
  }

  const parts = data.candidates[0]?.content?.parts || [];
  const imagePart = parts.find((part: any) => part.inlineData);

  if (!imagePart || !imagePart.inlineData) {
    // Check if there's a text response explaining why
    const textPart = parts.find((part: any) => part.text);
    if (textPart?.text) {
      console.log(`${model} returned text instead of image:`, textPart.text.substring(0, 200));
    }
    return null; // No image, try next model
  }

  return {
    image: imagePart.inlineData.data,
    mimeType: imagePart.inlineData.mimeType || 'image/png',
  };
}
