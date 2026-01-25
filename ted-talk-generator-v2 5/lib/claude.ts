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

const SYSTEM_PROMPT_EN = `You are an expert at creating TED Talk-style presentations.

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
- quote: For story slides (NEVER attribute to specific people or sources)
- leftColumn/rightColumn: For comparison slides (each with title and items array)
- steps: For timeline slides (array of {title, description})
- speakerNotes: 1-2 minutes of speaking notes

CRITICAL - CONTENT TRANSFORMATION RULES:
- NEVER mention "Speaker 1", "Speaker 2", "Talare 1", or any speaker references
- NEVER attribute quotes to specific people, podcasts, books, or sources
- NEVER use phrases like "According to...", "As mentioned in...", "From the conversation..."
- NEVER include attribution field - leave it empty or omit it
- Transform all insights into universal statements as if they are YOUR insights
- Rewrite quotes in your own words - extract the meaning, not the exact phrasing
- The output should feel like ORIGINAL content, not a summary of source material
- Speaker notes should sound like the presenter's own thoughts, not references to others

Think minimalist - little text, big headlines, one message per slide.

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no code blocks.`;

const SYSTEM_PROMPT_SV = `Du är en expert på att skapa presentationer i TED Talk-stil.

Givet användarens innehåll, skapa en strukturerad presentation som följer TED Talk-formatet:
1. Hook - Fånga uppmärksamhet med ett djärvt påstående eller fråga
2. Problem - Vad är utmaningen?
3. Berättelse - Ett verkligt exempel eller fallstudie
4. Insikt - Vad vi lärde oss
5. Ramverk - Hur man tänker annorlunda
6. Praktiskt - Konkreta steg
7. Uppmaning till handling - Vad göra härnäst

För varje slide, ange:
- type: En av "statement", "story", "list", "comparison", "timeline", "cta"
- title: Max 8 ord, slagkraftigt
- subtitle: Valfritt, för kontext
- content: Array med punkter (för list-typ)
- quote: För story-slides (ALDRIG med attribution till specifika personer eller källor)
- leftColumn/rightColumn: För comparison-slides (vardera med title och items array)
- steps: För timeline-slides (array av {title, description})
- speakerNotes: 1-2 minuters talarnotiser på svenska

KRITISKT - REGLER FÖR INNEHÅLLSTRANSFORMATION:
- ALDRIG nämn "Talare 1", "Talare 2", "Speaker 1", eller några talarreferenser
- ALDRIG attributera citat till specifika personer, poddar, böcker eller källor
- ALDRIG använd fraser som "Enligt...", "Som nämndes i...", "Från samtalet..."
- ALDRIG inkludera attribution-fält - lämna det tomt eller utelämna det
- Transformera alla insikter till universella påståenden som om de är DINA insikter
- Skriv om citat med egna ord - extrahera meningen, inte den exakta formuleringen
- Outputen ska kännas som ORIGINALINNEHÅLL, inte en sammanfattning av källmaterial
- Talarnotiser ska låta som presentatörens egna tankar, inte referenser till andra

Tänk minimalistiskt - lite text, stora rubriker, ett budskap per slide.
SKRIV ALLT INNEHÅLL PÅ SVENSKA.

VIKTIGT: Returnera ENDAST giltig JSON, ingen markdown-formatering, inga kodblock.`;

function buildUserPrompt(input: PresentationInput): string {
  const slideCount = input.duration === 10 ? 8 : input.duration === 20 ? 12 : 16;
  const lang = input.language === "sv" ? "svenska" : "English";

  return `Create a TED Talk presentation based on the following:

SOURCE MATERIAL (treat as inspiration only - DO NOT quote directly or mention sources):
${input.content}

TOPIC: ${input.topic}
TARGET AUDIENCE: ${input.audience}
DURATION: ${input.duration} minutes (approximately ${slideCount} slides)
TONALITY: ${input.tonality}
LANGUAGE: ${lang} - ALL content must be in ${lang}

IMPORTANT INSTRUCTIONS:
- Extract the KEY INSIGHTS and IDEAS from the source material
- Rewrite everything in YOUR OWN WORDS as original content
- NEVER mention speakers, sources, podcasts, books, or where the ideas came from
- NO attributions - present all insights as universal truths or the presenter's own perspective
- The final presentation should feel like completely original thought leadership

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
    }
  ]
}

Use a variety of slide types. Ensure the presentation flows naturally and tells a compelling story.`;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
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
    id: generateId(),
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
): Promise<Omit<GeneratedPresentation, "createdAt" | "input" | "style">> {
  const systemPrompt = input.language === "sv" ? SYSTEM_PROMPT_SV : SYSTEM_PROMPT_EN;

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: buildUserPrompt(input),
      },
    ],
    system: systemPrompt,
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

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
      id: generateId(),
      title: parsed.title || input.topic,
      slides: (parsed.slides || []).map(validateSlide),
    };
  } catch (error) {
    console.error("Failed to parse Claude response:", error);

    return {
      id: generateId(),
      title: input.topic,
      slides: [
        {
          id: generateId(),
          type: "statement",
          title: input.topic,
          subtitle: input.language === "sv" ? "En TED Talk-presentation" : "A TED Talk Presentation",
          speakerNotes: input.language === "sv"
            ? "Välkomna allihop. Idag ska vi utforska ett viktigt ämne."
            : "Welcome everyone. Today we'll explore an important topic.",
        },
        {
          id: generateId(),
          type: "cta",
          title: input.language === "sv" ? "Agera nu" : "Take Action",
          subtitle: input.language === "sv" ? "Ditt nästa steg börjar nu" : "Your next step starts now",
          speakerNotes: input.language === "sv"
            ? "Tack för er uppmärksamhet. Nu är det dags att agera."
            : "Thank you for your attention. Now it's time to take action.",
        },
      ],
    };
  }
}
