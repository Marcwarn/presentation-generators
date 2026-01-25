import Anthropic from "@anthropic-ai/sdk";
import {
  PresentationInput,
  GeneratedPresentation,
  Slide,
  SlideType,
} from "./types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert at creating TED Talk-style presentations.

Given the user's content, create a structured presentation following the TED Talk format:
1. Hook - Capture attention with a bold statement or question
2. Problem - What is the challenge?
3. Story - A real example or case study
4. Insight - What we learned
5. Framework - How to think differently
6. Practical - Concrete steps
7. Call to action - What to do next

For each slide, provide:
- type: One of "statement", "story", "list", "comparison", "timeline", "cta"
- title: Maximum 8 words, impactful
- subtitle: Optional, for context
- content: Array of bullet points (for list type)
- quote: For story slides
- attribution: For story slides
- leftColumn/rightColumn: For comparison slides (each with title and items array)
- steps: For timeline slides (array of {title, description})
- speakerNotes: 1-2 minutes of speaking notes

Think minimalist - little text, big headlines, one message per slide.

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no code blocks. The response must be a valid JSON object.`;

function buildUserPrompt(input: PresentationInput): string {
  const slideCount = input.duration === 10 ? 8 : input.duration === 20 ? 12 : 16;

  return `Create a TED Talk presentation based on the following:

CONTENT/TRANSCRIPT:
${input.content}

TOPIC: ${input.topic}
TARGET AUDIENCE: ${input.audience}
DURATION: ${input.duration} minutes (approximately ${slideCount} slides)
TONALITY: ${input.tonality}

Generate a presentation with exactly ${slideCount} slides following the TED Talk structure.

Return the response as a JSON object with this exact structure:
{
  "title": "Presentation Title",
  "slides": [
    {
      "type": "statement",
      "title": "Opening Hook",
      "subtitle": "Optional subtitle",
      "speakerNotes": "Speaker notes here..."
    },
    {
      "type": "list",
      "title": "Key Points",
      "content": ["Point 1", "Point 2", "Point 3"],
      "speakerNotes": "Speaker notes..."
    },
    {
      "type": "story",
      "title": "The Story",
      "quote": "A powerful quote",
      "attribution": "- Person Name",
      "speakerNotes": "Speaker notes..."
    },
    {
      "type": "comparison",
      "title": "Before vs After",
      "leftColumn": { "title": "Before", "items": ["Item 1", "Item 2"] },
      "rightColumn": { "title": "After", "items": ["Item 1", "Item 2"] },
      "speakerNotes": "Speaker notes..."
    },
    {
      "type": "timeline",
      "title": "The Journey",
      "steps": [
        { "title": "Step 1", "description": "Description" },
        { "title": "Step 2", "description": "Description" }
      ],
      "speakerNotes": "Speaker notes..."
    },
    {
      "type": "cta",
      "title": "Take Action",
      "subtitle": "Your next step",
      "speakerNotes": "Speaker notes..."
    }
  ]
}

Use a variety of slide types appropriate for the content. Ensure the presentation flows naturally and tells a compelling story.`;
}

function validateSlide(slide: Partial<Slide>): Slide {
  const validTypes: SlideType[] = [
    "statement",
    "story",
    "list",
    "comparison",
    "timeline",
    "cta",
  ];

  const type = validTypes.includes(slide.type as SlideType)
    ? (slide.type as SlideType)
    : "statement";

  return {
    type,
    title: slide.title || "Untitled Slide",
    subtitle: slide.subtitle,
    content: slide.content,
    quote: slide.quote,
    attribution: slide.attribution,
    leftColumn: slide.leftColumn,
    rightColumn: slide.rightColumn,
    steps: slide.steps,
    speakerNotes: slide.speakerNotes || "",
  };
}

export async function generatePresentation(
  input: PresentationInput
): Promise<GeneratedPresentation> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: buildUserPrompt(input),
      },
    ],
    system: SYSTEM_PROMPT,
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Clean up the response - remove markdown code blocks if present
  let cleanedResponse = responseText.trim();
  if (cleanedResponse.startsWith("```json")) {
    cleanedResponse = cleanedResponse.slice(7);
  } else if (cleanedResponse.startsWith("```")) {
    cleanedResponse = cleanedResponse.slice(3);
  }
  if (cleanedResponse.endsWith("```")) {
    cleanedResponse = cleanedResponse.slice(0, -3);
  }
  cleanedResponse = cleanedResponse.trim();

  try {
    const parsed = JSON.parse(cleanedResponse);

    return {
      title: parsed.title || input.topic,
      slides: (parsed.slides || []).map(validateSlide),
    };
  } catch (error) {
    console.error("Failed to parse Claude response:", error);
    console.error("Raw response:", responseText);

    // Return a fallback presentation
    return {
      title: input.topic,
      slides: [
        {
          type: "statement",
          title: input.topic,
          subtitle: "A TED Talk Presentation",
          speakerNotes:
            "Welcome everyone. Today we'll explore an important topic.",
        },
        {
          type: "list",
          title: "Key Points",
          content: [
            "Main insight from the content",
            "Supporting evidence",
            "Practical implications",
          ],
          speakerNotes:
            "Let me walk you through the key points we'll cover today.",
        },
        {
          type: "cta",
          title: "Take Action",
          subtitle: "Your next step starts now",
          speakerNotes:
            "Thank you for your attention. Now it's time to take action.",
        },
      ],
    };
  }
}
