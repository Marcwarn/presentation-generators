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

const SYSTEM_PROMPT_EN = `You are an expert at creating professional keynote presentations for Doings - a Swedish consultancy that develops culture, structure, communication and the right behaviors for sustainable change.

ABOUT DOINGS:
Doings is "for a Change!" - they help organizations go from words to action. Their expertise spans:
- Strategy & Structure
- Brand & Communication
- Culture & Leadership
- Behaviors & Habits

They work with: Culture & Values, Reorganizations, Leadership Development, Growth, Change Management, New Establishments, Acquisitions, Mergers, People Analytics, Mentorship, Leadership Coaching, Strategic Process Facilitation, People Change Management, Management Team Development, Employer Branding, Brand, Communication, Marketing, and Sustainability.

PRESENTATION STRUCTURE:

Slide 1 - Title slide:
- Powerful quote or insight from the content
- Presentation title
- Professional, branded feel

Slide 2 - The Starting Point:
- What problem/challenge does the content address?
- Why is this relevant now?

Slides 3-7 - Key Insights (one per slide):
- Headline: Short, impactful
- Main message: 1-2 sentences
- Deeper context: Practical examples or implications

Slide 8 - Summary:
- All keys on one slide
- Visual overview

Slide 9 - Closing/CTA:
- Reflective question to the audience
- Clear next steps

For each slide, provide:
- type: One of "statement", "story", "list", "comparison", "timeline", "cta"
- title: Maximum 8 words, impactful
- subtitle: Optional, for context
- content: Array of bullet points (for list type)
- quote: For story slides (NEVER attribute to specific people or sources)
- leftColumn/rightColumn: For comparison slides (each with title and items array)
- steps: For timeline slides (array of {title, description})
- speakerNotes: 1-2 minutes of speaking notes with suggestions for what the presenter can say

CRITICAL - CONTENT TRANSFORMATION RULES:
- NEVER mention "Speaker 1", "Speaker 2", or any speaker references
- NEVER attribute quotes to specific people, podcasts, books, or sources
- NEVER use phrases like "According to...", "As mentioned in...", "From the conversation..."
- NEVER include attribution field - leave it empty or omit it
- Transform all insights into universal statements as if they are YOUR insights
- Rewrite quotes in your own words - extract the meaning, not the exact phrasing
- The output should feel like ORIGINAL content, not a summary of source material
- Speaker notes should sound like the presenter's own thoughts, not references to others

DOINGS TONALITY (this is critical):
- Pragmatic but visionary - always ground big ideas in practical reality
- Research-based but accessible - use evidence without being academic
- Challenging but warm - push thinking while building trust
- Action-oriented - always point toward concrete next steps
- Focus on DOING, not just knowing - move from insight to implementation
- Never "fluffy" or vague - every statement should have substance
- Emphasize sustainable change - not quick fixes but lasting transformation
- Human-centered - people and behaviors are at the core

KEY THEMES TO WEAVE IN (when relevant):
- The gap between strategy and execution
- Culture eats strategy for breakfast (but structure enables culture)
- Behaviors drive results
- Change happens through people
- From words to action

DESIGN PRINCIPLES:
- Maximum 3 messages per slide
- Lots of "white space"
- Alternate between emphasis slides and detail slides
- Think minimalist - little text, big headlines, one message per slide

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no code blocks.`;

const SYSTEM_PROMPT_SV = `Du är expert på att skapa professionella keynote-presentationer för Doings - en svensk konsultbyrå som utvecklar kultur, struktur, kommunikation och rätt beteenden för en hållbar förändring.

OM DOINGS:
Doings är "for a Change!" - de hjälper organisationer att gå från ord till handling. Deras expertis spänner över:
- Strategin & Strukturen
- Varumärket & Kommunikationen
- Kulturen & Ledarskapet
- Beteenden & Vanor

De arbetar med: Kultur & Värderingar, Omorganisationer, Ledarutveckling, Tillväxt, Förändringsledning, Nyetablering, Bolagsförvärv, Bolagsfusion, People Analytics, Mentorskap, Ledarskapscoaching, Strategisk processledning, People Change Management, Ledningsgruppsutveckling, Employer Branding, Varumärke, Kommunikation, Marknadsföring och Hållbarhetsarbete.

PRESENTATIONSSTRUKTUR:

Slide 1 - Titelsida:
- Kraftfullt citat eller insikt från innehållet
- Presentationstitel
- Professionell, varumärkesanpassad känsla

Slide 2 - Utgångspunkten:
- Vilket problem/utmaning adresserar innehållet?
- Varför är detta relevant nu?

Slide 3-7 - Nyckelinsikter (en per slide):
- Rubrik: Kort, slagkraftigt
- Huvudbudskap: 1-2 meningar
- Fördjupning: Praktiska exempel eller konsekvenser

Slide 8 - Sammanfattning:
- Alla nycklar på en slide
- Visuell översikt

Slide 9 - Avslutning/CTA:
- Reflekterande fråga till publiken
- Tydliga nästa steg

För varje slide, ange:
- type: En av "statement", "story", "list", "comparison", "timeline", "cta"
- title: Max 8 ord, slagkraftigt
- subtitle: Valfritt, för kontext
- content: Array med punkter (för list-typ)
- quote: För story-slides (ALDRIG med attribution till specifika personer eller källor)
- leftColumn/rightColumn: För comparison-slides (vardera med title och items array)
- steps: För timeline-slides (array av {title, description})
- speakerNotes: 1-2 minuters talarnotiser på svenska med förslag på vad föreläsaren kan säga

KRITISKT - REGLER FÖR INNEHÅLLSTRANSFORMATION:
- ALDRIG nämn "Talare 1", "Talare 2", "Speaker 1", eller några talarreferenser
- ALDRIG attributera citat till specifika personer, poddar, böcker eller källor
- ALDRIG använd fraser som "Enligt...", "Som nämndes i...", "Från samtalet..."
- ALDRIG inkludera attribution-fält - lämna det tomt eller utelämna det
- Transformera alla insikter till universella påståenden som om de är DINA insikter
- Skriv om citat med egna ord - extrahera meningen, inte den exakta formuleringen
- Outputen ska kännas som ORIGINALINNEHÅLL, inte en sammanfattning av källmaterial
- Talarnotiser ska låta som presentatörens egna tankar, inte referenser till andra

DOINGS TONALITET (detta är kritiskt):
- Pragmatisk men visionär - grunda alltid stora idéer i praktisk verklighet
- Forskningsbaserad men tillgänglig - använd evidens utan att vara akademisk
- Utmanande men varm - utmana tänkandet samtidigt som du bygger förtroende
- Handlingsorienterad - peka alltid mot konkreta nästa steg
- Fokus på att GÖRA, inte bara veta - gå från insikt till genomförande
- Aldrig "fluffig" eller vag - varje påstående ska ha substans
- Betona hållbar förändring - inte snabba fixar utan varaktig transformation
- Människocentrerad - människor och beteenden är kärnan

NYCKELTEMAN ATT VÄVA IN (när relevant):
- Gapet mellan strategi och exekvering
- Kultur äter strategi till frukost (men struktur möjliggör kultur)
- Beteenden driver resultat
- Förändring sker genom människor
- Från ord till handling

DESIGNPRINCIPER:
- Max 3 budskap per slide
- Mycket "white space"
- Växla mellan betoning och detaljer
- Tänk minimalistiskt - lite text, stora rubriker, ett budskap per slide

SKRIV ALLT INNEHÅLL PÅ SVENSKA.

VIKTIGT: Returnera ENDAST giltig JSON, ingen markdown-formatering, inga kodblock.`;

// Kept for backward compatibility but slideCount from input is preferred
function getSlideCountFromDuration(duration: number): number {
  switch(duration) {
    case 5: return 5;
    case 10: return 8;
    case 20: return 12;
    case 30: return 16;
    case 45: return 22;
    default: return 12;
  }
}

function getPresentationTypeInstructions(type: string, lang: string): string {
  const instructions: Record<string, { en: string; sv: string }> = {
    keynote: {
      en: "This is a KEYNOTE presentation - focus on inspiration, big ideas, emotional storytelling, and a powerful call to action. Use dramatic openings and memorable closing statements.",
      sv: "Detta är en KEYNOTE-presentation - fokusera på inspiration, stora idéer, emotionell storytelling och en kraftfull uppmaning till handling. Använd dramatiska öppningar och minnesvärda avslutningar."
    },
    educational: {
      en: "This is an EDUCATIONAL presentation - focus on teaching and learning. Break down complex concepts, use examples and analogies, include practice exercises or reflection questions. Build knowledge step by step.",
      sv: "Detta är en UTBILDANDE presentation - fokusera på undervisning och inlärning. Bryt ner komplexa koncept, använd exempel och analogier, inkludera övningar eller reflektionsfrågor. Bygg kunskap steg för steg."
    },
    informative: {
      en: "This is an INFORMATIVE presentation - focus on facts, data, and clear communication. Present information objectively, use evidence and statistics, ensure clarity and comprehension.",
      sv: "Detta är en INFORMERANDE presentation - fokusera på fakta, data och tydlig kommunikation. Presentera information objektivt, använd bevis och statistik, säkerställ klarhet och förståelse."
    },
    pitch: {
      en: "This is a PITCH/SALES presentation - focus on persuasion, benefits, and value proposition. Address pain points, present solutions, include proof points and testimonials (without naming sources), end with clear next steps.",
      sv: "Detta är en PITCH/FÖRSÄLJNINGS-presentation - fokusera på övertalning, fördelar och värdeerbjudande. Adressera smärtpunkter, presentera lösningar, inkludera bevispoäng, avsluta med tydliga nästa steg."
    },
    workshop: {
      en: "This is a WORKSHOP presentation - focus on hands-on learning and participation. Include interactive elements, group activities, exercises, and practical applications. Encourage engagement.",
      sv: "Detta är en WORKSHOP-presentation - fokusera på praktiskt lärande och deltagande. Inkludera interaktiva element, gruppaktiviteter, övningar och praktiska tillämpningar. Uppmuntra engagemang."
    },
    summary: {
      en: "This is a SUMMARY/REPORT presentation - focus on concise overview and key takeaways. Highlight main findings, conclusions, and recommendations. Be concise and structured.",
      sv: "Detta är en SAMMANFATTNINGS/RAPPORT-presentation - fokusera på koncis översikt och huvudpunkter. Lyft fram huvudsakliga fynd, slutsatser och rekommendationer. Var koncis och strukturerad."
    }
  };
  return instructions[type]?.[lang === "sv" ? "sv" : "en"] || instructions.keynote[lang === "sv" ? "sv" : "en"];
}

function getKnowledgeLevelInstructions(level: string, lang: string): string {
  const instructions: Record<string, { en: string; sv: string }> = {
    beginner: {
      en: "AUDIENCE KNOWLEDGE LEVEL: Beginner - Explain all terms and concepts, avoid jargon, use simple analogies, provide background context, don't assume prior knowledge.",
      sv: "PUBLIKENS KUNSKAPSNIVÅ: Nybörjare - Förklara alla termer och koncept, undvik jargong, använd enkla analogier, ge bakgrundskontext, anta inte förkunskaper."
    },
    intermediate: {
      en: "AUDIENCE KNOWLEDGE LEVEL: Intermediate - Audience has foundational knowledge. Can use some technical terms but explain advanced concepts. Focus on deepening understanding.",
      sv: "PUBLIKENS KUNSKAPSNIVÅ: Mellan - Publiken har grundläggande kunskap. Kan använda vissa tekniska termer men förklara avancerade koncept. Fokusera på att fördjupa förståelsen."
    },
    advanced: {
      en: "AUDIENCE KNOWLEDGE LEVEL: Advanced - Audience are experts. Can use technical language freely. Focus on cutting-edge insights, nuances, and sophisticated analysis.",
      sv: "PUBLIKENS KUNSKAPSNIVÅ: Avancerad - Publiken är experter. Kan använda tekniskt språk fritt. Fokusera på banbrytande insikter, nyanser och sofistikerad analys."
    },
    mixed: {
      en: "AUDIENCE KNOWLEDGE LEVEL: Mixed - Audience has varying expertise. Layer your content: make core points accessible to all while including depth for experts. Use 'zoom in/zoom out' technique.",
      sv: "PUBLIKENS KUNSKAPSNIVÅ: Blandad - Publiken har varierande expertis. Skikta ditt innehåll: gör kärnpunkter tillgängliga för alla samtidigt som du inkluderar djup för experter."
    }
  };
  return instructions[level]?.[lang === "sv" ? "sv" : "en"] || instructions.mixed[lang === "sv" ? "sv" : "en"];
}

function getAudienceInstructions(audience: string, lang: string): string {
  const instructions: Record<string, { en: string; sv: string }> = {
    "c-suite": {
      en: "TARGET AUDIENCE: C-Suite executives - Focus on strategic impact, ROI, competitive advantage, and bottom-line results. Be concise, data-driven, and solution-oriented.",
      sv: "MÅLGRUPP: Ledningsgrupp - Fokusera på strategisk påverkan, ROI, konkurrensfördelar och resultat. Var koncis, datadriven och lösningsorienterad."
    },
    team: {
      en: "TARGET AUDIENCE: Team members - Focus on collaboration, practical implementation, and how this affects their daily work. Be relatable and actionable.",
      sv: "MÅLGRUPP: Teammedlemmar - Fokusera på samarbete, praktisk implementering och hur detta påverkar deras dagliga arbete. Var relaterbar och handlingsorienterad."
    },
    customers: {
      en: "TARGET AUDIENCE: Customers - Focus on value, benefits, and how this solves their problems. Use their language, address their concerns, build trust.",
      sv: "MÅLGRUPP: Kunder - Fokusera på värde, fördelar och hur detta löser deras problem. Använd deras språk, adressera deras bekymmer, bygg förtroende."
    },
    general: {
      en: "TARGET AUDIENCE: General public - Make content accessible and engaging for anyone. Avoid insider language, use universal examples and relatable stories.",
      sv: "MÅLGRUPP: Allmänheten - Gör innehållet tillgängligt och engagerande för alla. Undvik insiderspråk, använd universella exempel och relaterbara berättelser."
    },
    investors: {
      en: "TARGET AUDIENCE: Investors - Focus on market opportunity, growth potential, competitive moat, financial metrics, and risk mitigation. Show traction and vision.",
      sv: "MÅLGRUPP: Investerare - Fokusera på marknadsmöjlighet, tillväxtpotential, konkurrensfördelar, finansiella nyckeltal och riskhantering. Visa traction och vision."
    },
    students: {
      en: "TARGET AUDIENCE: Students - Focus on learning outcomes, career relevance, and practical skills. Use engaging examples, encourage curiosity, and connect to their future.",
      sv: "MÅLGRUPP: Studenter - Fokusera på lärandemål, karriärrelevans och praktiska färdigheter. Använd engagerande exempel, uppmuntra nyfikenhet och koppla till deras framtid."
    },
    experts: {
      en: "TARGET AUDIENCE: Industry experts - Challenge conventional thinking, present novel insights, use precise terminology, and engage with current debates in the field.",
      sv: "MÅLGRUPP: Branschexperter - Utmana konventionellt tänkande, presentera nya insikter, använd precis terminologi och engagera med aktuella debatter i fältet."
    },
    mixed: {
      en: "TARGET AUDIENCE: Mixed audience - Balance accessibility with depth. Start broad, then layer in specifics. Use techniques that work for diverse groups.",
      sv: "MÅLGRUPP: Blandad publik - Balansera tillgänglighet med djup. Börja brett, lägg sedan till specifika detaljer. Använd tekniker som fungerar för olika grupper."
    }
  };
  return instructions[audience]?.[lang === "sv" ? "sv" : "en"] || instructions.general[lang === "sv" ? "sv" : "en"];
}

function buildUserPrompt(input: PresentationInput): string {
  // Use explicit slideCount if provided, otherwise fall back to duration-based calculation
  const slideCount = input.slideCount || getSlideCountFromDuration(input.duration);
  const lang = input.language === "sv" ? "sv" : "en";
  const langName = input.language === "sv" ? "svenska" : "English";

  const presentationType = input.presentationType || "keynote";
  const knowledgeLevel = input.knowledgeLevel || "mixed";

  // Instructions for how to structure larger presentations
  const largePresInstructions = slideCount > 30
    ? (lang === "sv"
      ? `\n\nVIKTIGT FÖR STOR PRESENTATION (${slideCount} slides):
- Dela upp innehållet i tydliga sektioner/kapitel
- Inkludera section divider slides mellan huvuddelarna
- Använd fler "story" och "comparison" slides för variation
- Varje huvudämne kan ha flera fördjupningsslides
- Inkludera mellansammanfattningar var 10-15 slides
- Avsluta varje sektion med en reflection eller övergångsslide`
      : `\n\nIMPORTANT FOR LARGE PRESENTATION (${slideCount} slides):
- Divide content into clear sections/chapters
- Include section divider slides between main parts
- Use more "story" and "comparison" slides for variation
- Each main topic can have multiple deep-dive slides
- Include interim summaries every 10-15 slides
- End each section with a reflection or transition slide`)
    : "";

  return `Create a presentation based on the following:

SOURCE MATERIAL (treat as inspiration only - DO NOT quote directly or mention sources):
${input.content}

TOPIC: ${input.topic}

${getPresentationTypeInstructions(presentationType, lang)}

${getAudienceInstructions(input.audience, lang)}

${getKnowledgeLevelInstructions(knowledgeLevel, lang)}

DURATION: ${input.duration} minutes
NUMBER OF SLIDES: Exactly ${slideCount} slides (this is critical - generate exactly this many)
TONALITY: ${input.tonality}
LANGUAGE: ${langName} - ALL content must be in ${langName}
${largePresInstructions}

IMPORTANT INSTRUCTIONS:
- Extract the KEY INSIGHTS and IDEAS from the source material
- Rewrite everything in YOUR OWN WORDS as original content
- NEVER mention speakers, sources, podcasts, books, or where the ideas came from
- NO attributions - present all insights as universal truths or the presenter's own perspective
- The final presentation should feel like completely original thought leadership
- ADAPT the structure based on presentation type (not all presentations need to follow strict TED Talk format)

Generate a presentation with exactly ${slideCount} slides.

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

Use a variety of slide types. Ensure the presentation flows naturally and tells a compelling story appropriate for the presentation type and audience.`;
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

  // Calculate max_tokens based on slide count (approximately 300 tokens per slide)
  const slideCount = input.slideCount || getSlideCountFromDuration(input.duration);
  const maxTokens = Math.min(Math.max(4096, slideCount * 400), 16000);

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
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
          subtitle: input.language === "sv" ? "En keynote-presentation" : "A Keynote Presentation",
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
