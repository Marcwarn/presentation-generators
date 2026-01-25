import { NextRequest, NextResponse } from "next/server";

const GOOGLE_AI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict';

export async function POST(request: NextRequest) {
  try {
    const { prompt, style = 'minimalist' } = await request.json();

    const apiKey = process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Google AI API key not configured" },
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
      photorealistic: 'Professional photography, high resolution, realistic lighting, corporate style',
      artistic: 'Artistic illustration, vibrant colors, creative composition, modern design',
      minimalist: 'Minimalist design, clean lines, simple shapes, professional presentation style, dark background with accent colors',
    };

    const enhancedPrompt = `${prompt}. ${styleModifiers[style] || styleModifiers.minimalist}. Suitable for a professional presentation slide. 16:9 aspect ratio.`;

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
      console.error("Google AI API error:", error);
      return NextResponse.json(
        { error: `Image generation failed: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.predictions || data.predictions.length === 0) {
      return NextResponse.json(
        { error: "No image generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      image: data.predictions[0].bytesBase64Encoded,
      mimeType: 'image/png',
    });
  } catch (error) {
    console.error("Generate image error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate image" },
      { status: 500 }
    );
  }
}
