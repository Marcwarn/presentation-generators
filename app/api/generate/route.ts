import { NextRequest, NextResponse } from "next/server";
import { generatePresentation } from "@/lib/claude";
import { GenerateRequest, GenerateResponse, ImageStyle, Slide } from "@/lib/types";
import { generateImage } from "@/lib/image-generator";

// Map our image styles to the generator styles
function getGeneratorStyle(imageStyle: ImageStyle): 'photorealistic' | 'artistic' | 'minimalist' {
  switch (imageStyle) {
    case 'professional':
      return 'photorealistic';
    case 'abstract':
      return 'artistic';
    case 'illustrative':
      return 'minimalist';
    default:
      return 'minimalist';
  }
}

// Generate images for slides that benefit from visuals
async function generateSlideImages(
  slides: Slide[],
  imageStyle: ImageStyle,
  topic: string
): Promise<Slide[]> {
  const googleApiKey = process.env.GOOGLE_AI_API_KEY;

  if (!googleApiKey || imageStyle === 'none') {
    return slides;
  }

  const generatorStyle = getGeneratorStyle(imageStyle);

  // Generate images for certain slide types (not all slides need images)
  const slidesWithImages = await Promise.all(
    slides.map(async (slide, index) => {
      // Skip title/CTA slides, and only add images to every other content slide for variety
      const shouldHaveImage =
        slide.type !== 'cta' &&
        (slide.type === 'statement' || slide.type === 'story' || (index % 2 === 0));

      if (!shouldHaveImage) {
        return slide;
      }

      try {
        const prompt = buildSlidePrompt(slide, topic, imageStyle);
        const image = await generateImage(prompt, googleApiKey, generatorStyle);

        return {
          ...slide,
          image: `data:${image.mimeType};base64,${image.base64}`,
        };
      } catch (error) {
        console.error(`Failed to generate image for slide ${index + 1}:`, error);
        return slide; // Return slide without image on error
      }
    })
  );

  return slidesWithImages;
}

function buildSlidePrompt(slide: Slide, topic: string, imageStyle: ImageStyle): string {
  const basePrompt = `${slide.title}`;
  const context = slide.subtitle || slide.quote || (slide.content && slide.content[0]) || '';

  const styleHints: Record<ImageStyle, string> = {
    none: '',
    professional: 'corporate photography, business context, professional setting',
    abstract: 'abstract art, geometric shapes, dynamic composition, modern design',
    illustrative: 'clean illustration, flat design, modern icons, infographic style',
  };

  return `Create a visual for: "${basePrompt}". Topic: ${topic}. ${context ? `Context: ${context.substring(0, 100)}` : ''} Style: ${styleHints[imageStyle]}. For dark presentation background.`;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();

    if (!body.input?.content || !body.input?.topic) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: content and topic",
        } as GenerateResponse,
        { status: 400 }
      );
    }

    // Generate presentation structure with Claude
    const presentation = await generatePresentation(body.input);

    // If image style is set, generate images for slides
    if (body.input.imageStyle && body.input.imageStyle !== 'none') {
      console.log(`Generating ${body.input.imageStyle} images for slides...`);
      presentation.slides = await generateSlideImages(
        presentation.slides,
        body.input.imageStyle,
        body.input.topic
      );
    }

    return NextResponse.json({
      success: true,
      presentation,
    } as GenerateResponse);
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate presentation",
      } as GenerateResponse,
      { status: 500 }
    );
  }
}
