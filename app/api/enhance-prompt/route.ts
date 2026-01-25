import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface EnhanceRequest {
  topic: string;
  content: string;
  currentPrompt: string;
  audience: string;
  presentationType: string;
  language: "en" | "sv";
}

const SYSTEM_PROMPT_EN = `You are an expert presentation strategist and prompt engineer. Your job is to analyze a user's presentation topic and their current custom instructions, then suggest improvements and additions they might have missed.

Think about:
1. PERSPECTIVES: What viewpoints or angles could strengthen the presentation? (e.g., customer perspective, financial perspective, competitor view)
2. ROLES: What expert roles could inform the content? (e.g., industry analyst, skeptical CFO, enthusiastic early adopter)
3. MISSING ASPECTS: What important aspects might they have forgotten? (e.g., risks, objections, success metrics, timeline)
4. NUANCES: What subtleties could make the presentation more sophisticated? (e.g., cultural considerations, industry-specific context)
5. HOOKS: What powerful opening angles could grab attention?
6. DATA POINTS: What types of data or evidence would strengthen the argument?
7. STORYTELLING: What narrative elements could make it more memorable?

RESPOND WITH A CONCISE LIST of suggestions (5-8 bullet points) that the user can add to their custom instructions.
Be specific and actionable. Don't be generic.
Write in the same language as requested.
Format: Start each line with "• " and keep each suggestion to 1-2 sentences max.`;

const SYSTEM_PROMPT_SV = `Du är en expert på presentationsstrategi och prompt engineering. Ditt jobb är att analysera användarens presentationsämne och deras nuvarande instruktioner, och sedan föreslå förbättringar och tillägg de kan ha missat.

Tänk på:
1. PERSPEKTIV: Vilka synvinklar eller vinklar kan stärka presentationen? (t.ex. kundperspektiv, finansiellt perspektiv, konkurrentvy)
2. ROLLER: Vilka expertroller kan informera innehållet? (t.ex. branschanalytiker, skeptisk CFO, entusiastisk early adopter)
3. MISSADE ASPEKTER: Vilka viktiga aspekter kan de ha glömt? (t.ex. risker, invändningar, framgångsmått, tidslinje)
4. NYANSER: Vilka subtiliteter kan göra presentationen mer sofistikerad? (t.ex. kulturella överväganden, branschspecifik kontext)
5. HOOKS: Vilka kraftfulla öppningsvinklar kan fånga uppmärksamhet?
6. DATAPUNKTER: Vilka typer av data eller bevis skulle stärka argumentet?
7. STORYTELLING: Vilka narrativa element kan göra den mer minnesvärd?

SVARA MED EN KONCIS LISTA av förslag (5-8 punkter) som användaren kan lägga till sina egna instruktioner.
Var specifik och handlingsinriktad. Var inte generisk.
Skriv på svenska.
Format: Börja varje rad med "• " och håll varje förslag till max 1-2 meningar.`;

export async function POST(request: NextRequest) {
  try {
    const body: EnhanceRequest = await request.json();

    const { topic, content, currentPrompt, audience, presentationType, language } = body;

    if (!topic) {
      return NextResponse.json(
        { success: false, error: "Topic is required" },
        { status: 400 }
      );
    }

    const systemPrompt = language === "sv" ? SYSTEM_PROMPT_SV : SYSTEM_PROMPT_EN;

    const userMessage = language === "sv"
      ? `ÄMNE: ${topic}

MÅLGRUPP: ${audience}
PRESENTATIONSTYP: ${presentationType}

INNEHÅLL/KONTEXT (sammanfattning):
${content ? content.substring(0, 1000) + (content.length > 1000 ? "..." : "") : "Inget innehåll angivet än."}

NUVARANDE EGNA INSTRUKTIONER:
${currentPrompt || "Inga egna instruktioner än."}

Analysera detta och ge konkreta förslag på vad användaren kan lägga till i sina instruktioner för att få en bättre presentation. Tänk på perspektiv, roller, missade aspekter, nyanser, hooks, data och storytelling.`
      : `TOPIC: ${topic}

AUDIENCE: ${audience}
PRESENTATION TYPE: ${presentationType}

CONTENT/CONTEXT (summary):
${content ? content.substring(0, 1000) + (content.length > 1000 ? "..." : "") : "No content provided yet."}

CURRENT CUSTOM INSTRUCTIONS:
${currentPrompt || "No custom instructions yet."}

Analyze this and provide concrete suggestions for what the user can add to their instructions to get a better presentation. Consider perspectives, roles, missing aspects, nuances, hooks, data, and storytelling.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({
      success: true,
      suggestions: responseText,
    });
  } catch (error) {
    console.error("Enhance prompt API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to enhance prompt",
      },
      { status: 500 }
    );
  }
}
