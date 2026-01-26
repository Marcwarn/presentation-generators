// Default prompts for each setting in the presentation generator
// Users can customize these per-persona

export interface PromptTemplate {
  id: string;
  category: "audience" | "tonality" | "presentationType" | "knowledgeLevel" | "imageStyle";
  value: string;
  labelEn: string;
  labelSv: string;
  promptEn: string;
  promptSv: string;
}

export interface Persona {
  id: string;
  name: string;
  createdAt: string;
  customPrompts: Record<string, string>; // "category:value" -> custom prompt
}

// Helper to get prompt key
export function getPromptKey(category: string, value: string): string {
  return `${category}:${value}`;
}

// All default prompts
export const defaultPrompts: PromptTemplate[] = [
  // === AUDIENCE ===
  {
    id: "audience-c-suite",
    category: "audience",
    value: "c-suite",
    labelEn: "C-Suite",
    labelSv: "Ledningsgrupp",
    promptEn: "Target audience: C-level executives and senior leadership. Use strategic language, focus on ROI, business impact, and high-level insights. Keep it concise and decision-oriented. Avoid technical jargon unless necessary.",
    promptSv: "Målgrupp: C-level chefer och ledningsgrupp. Använd strategiskt språk, fokusera på ROI, affärspåverkan och övergripande insikter. Håll det koncist och beslutsorienterat. Undvik teknisk jargong om det inte är nödvändigt.",
  },
  {
    id: "audience-team",
    category: "audience",
    value: "team",
    labelEn: "Team",
    labelSv: "Team",
    promptEn: "Target audience: Team members and colleagues. Use collaborative language, be practical and actionable. Include specific tasks and responsibilities. Encourage engagement and participation.",
    promptSv: "Målgrupp: Teammedlemmar och kollegor. Använd samarbetsinriktat språk, var praktisk och handlingsorienterad. Inkludera specifika uppgifter och ansvar. Uppmuntra engagemang och deltagande.",
  },
  {
    id: "audience-customers",
    category: "audience",
    value: "customers",
    labelEn: "Customers",
    labelSv: "Kunder",
    promptEn: "Target audience: Customers and clients. Focus on benefits and value proposition. Use persuasive but honest language. Address pain points and show solutions. Build trust and credibility.",
    promptSv: "Målgrupp: Kunder och klienter. Fokusera på fördelar och värdeerbjudande. Använd övertygande men ärligt språk. Adressera smärtpunkter och visa lösningar. Bygg förtroende och trovärdighet.",
  },
  {
    id: "audience-general",
    category: "audience",
    value: "general",
    labelEn: "General",
    labelSv: "Allmän",
    promptEn: "Target audience: General public with mixed backgrounds. Use clear, accessible language. Avoid assumptions about prior knowledge. Include explanations for any technical terms. Be inclusive and engaging.",
    promptSv: "Målgrupp: Allmänheten med blandade bakgrunder. Använd tydligt, tillgängligt språk. Undvik antaganden om förkunskaper. Inkludera förklaringar för tekniska termer. Var inkluderande och engagerande.",
  },
  {
    id: "audience-investors",
    category: "audience",
    value: "investors",
    labelEn: "Investors",
    labelSv: "Investerare",
    promptEn: "Target audience: Investors and stakeholders. Emphasize market opportunity, growth potential, and financial metrics. Be data-driven and show traction. Address risks transparently. Focus on scalability and returns.",
    promptSv: "Målgrupp: Investerare och intressenter. Betona marknadsmöjligheter, tillväxtpotential och finansiella mått. Var datadriven och visa traktion. Adressera risker transparent. Fokusera på skalbarhet och avkastning.",
  },
  {
    id: "audience-students",
    category: "audience",
    value: "students",
    labelEn: "Students",
    labelSv: "Studenter",
    promptEn: "Target audience: Students and learners. Use educational approach with clear structure. Include examples and analogies. Build concepts progressively. Encourage questions and critical thinking.",
    promptSv: "Målgrupp: Studenter och elever. Använd pedagogiskt tillvägagångssätt med tydlig struktur. Inkludera exempel och analogier. Bygg upp koncept progressivt. Uppmuntra frågor och kritiskt tänkande.",
  },
  {
    id: "audience-experts",
    category: "audience",
    value: "experts",
    labelEn: "Experts",
    labelSv: "Experter",
    promptEn: "Target audience: Domain experts and specialists. Use precise terminology. Skip basic explanations. Focus on nuances, edge cases, and advanced concepts. Invite debate and deeper discussion.",
    promptSv: "Målgrupp: Domänexperter och specialister. Använd precis terminologi. Hoppa över grundläggande förklaringar. Fokusera på nyanser, specialfall och avancerade koncept. Bjud in till debatt och djupare diskussion.",
  },
  {
    id: "audience-mixed",
    category: "audience",
    value: "mixed",
    labelEn: "Mixed audience",
    labelSv: "Blandad publik",
    promptEn: "Target audience: Mixed group with varying expertise levels. Layer information from accessible to advanced. Provide context without being condescending. Use examples that work on multiple levels.",
    promptSv: "Målgrupp: Blandad grupp med varierande expertisnivåer. Lagra information från tillgänglig till avancerad. Ge kontext utan att vara nedlåtande. Använd exempel som fungerar på flera nivåer.",
  },

  // === TONALITY ===
  {
    id: "tonality-inspiring",
    category: "tonality",
    value: "inspiring",
    labelEn: "Inspiring",
    labelSv: "Inspirerande",
    promptEn: "Tone: Inspiring and motivational. Use powerful stories, emotional hooks, and visionary language. Paint a picture of possibilities. Include calls to action that energize. Create momentum and excitement.",
    promptSv: "Ton: Inspirerande och motiverande. Använd kraftfulla berättelser, känslomässiga krokar och visionärt språk. Måla en bild av möjligheter. Inkludera uppmaningar som ger energi. Skapa momentum och entusiasm.",
  },
  {
    id: "tonality-informative",
    category: "tonality",
    value: "informative",
    labelEn: "Informative",
    labelSv: "Informativ",
    promptEn: "Tone: Informative and educational. Present facts clearly and objectively. Use data and evidence. Structure information logically. Prioritize clarity over entertainment. Be thorough but concise.",
    promptSv: "Ton: Informativ och utbildande. Presentera fakta tydligt och objektivt. Använd data och bevis. Strukturera information logiskt. Prioritera tydlighet över underhållning. Var grundlig men koncis.",
  },
  {
    id: "tonality-provocative",
    category: "tonality",
    value: "provocative",
    labelEn: "Provocative",
    labelSv: "Provocerande",
    promptEn: "Tone: Provocative and thought-provoking. Challenge assumptions and conventional thinking. Ask uncomfortable questions. Present contrarian viewpoints. Spark debate and reflection. Be bold but respectful.",
    promptSv: "Ton: Provocerande och tankeväckande. Utmana antaganden och konventionellt tänkande. Ställ obekväma frågor. Presentera konträra synpunkter. Väck debatt och reflektion. Var djärv men respektfull.",
  },

  // === PRESENTATION TYPE ===
  {
    id: "type-keynote",
    category: "presentationType",
    value: "keynote",
    labelEn: "Keynote",
    labelSv: "Keynote",
    promptEn: "Format: Keynote presentation. Create a compelling narrative arc with a strong opening hook, building tension, key insights, and memorable conclusion. Focus on one big idea. Use storytelling techniques. Design for large audiences.",
    promptSv: "Format: Keynote-presentation. Skapa en fängslande narrativ båge med en stark öppningskrok, uppbyggd spänning, nyckelinsikter och minnesvärd avslutning. Fokusera på en stor idé. Använd berättartekniker. Designa för stora publiker.",
  },
  {
    id: "type-educational",
    category: "presentationType",
    value: "educational",
    labelEn: "Educational",
    labelSv: "Utbildning",
    promptEn: "Format: Educational presentation. Structure content for learning retention. Include learning objectives, clear explanations, examples, and knowledge checks. Build complexity gradually. Summarize key takeaways.",
    promptSv: "Format: Utbildningspresentation. Strukturera innehåll för inlärning. Inkludera lärandemål, tydliga förklaringar, exempel och kunskapskontroller. Bygg komplexitet gradvis. Sammanfatta viktiga punkter.",
  },
  {
    id: "type-informative",
    category: "presentationType",
    value: "informative",
    labelEn: "Informative",
    labelSv: "Informerande",
    promptEn: "Format: Informative presentation. Focus on clear communication of facts and updates. Use logical structure. Include relevant data and sources. Keep opinions separate from facts. Ensure completeness.",
    promptSv: "Format: Informativ presentation. Fokusera på tydlig kommunikation av fakta och uppdateringar. Använd logisk struktur. Inkludera relevant data och källor. Håll åsikter separerade från fakta. Säkerställ fullständighet.",
  },
  {
    id: "type-pitch",
    category: "presentationType",
    value: "pitch",
    labelEn: "Pitch / Sales",
    labelSv: "Pitch / Försäljning",
    promptEn: "Format: Pitch/Sales presentation. Lead with the problem and your unique solution. Show clear value proposition and differentiation. Include social proof and case studies. End with clear next steps and call to action.",
    promptSv: "Format: Pitch/Säljpresentation. Börja med problemet och din unika lösning. Visa tydligt värdeerbjudande och differentiering. Inkludera social proof och case studies. Avsluta med tydliga nästa steg och uppmaning.",
  },
  {
    id: "type-workshop",
    category: "presentationType",
    value: "workshop",
    labelEn: "Workshop",
    labelSv: "Workshop",
    promptEn: "Format: Workshop presentation. Design for interaction and participation. Include exercises, discussions, and hands-on activities. Break content into working sessions. Allow time for questions and practice.",
    promptSv: "Format: Workshop-presentation. Designa för interaktion och deltagande. Inkludera övningar, diskussioner och praktiska aktiviteter. Dela upp innehåll i arbetssessioner. Ge tid för frågor och övning.",
  },
  {
    id: "type-summary",
    category: "presentationType",
    value: "summary",
    labelEn: "Summary / Report",
    labelSv: "Sammanfattning / Rapport",
    promptEn: "Format: Summary/Report presentation. Distill complex information into key findings. Use executive summary approach. Highlight important metrics and trends. Include recommendations. Support with data visualizations.",
    promptSv: "Format: Sammanfattning/Rapport-presentation. Destillera komplex information till nyckelfynd. Använd executive summary-approach. Lyft fram viktiga mått och trender. Inkludera rekommendationer. Stöd med datavisualiseringar.",
  },
  {
    id: "type-proposal",
    category: "presentationType",
    value: "proposal",
    labelEn: "Proposal / Quote",
    labelSv: "Offert / Förslag",
    promptEn: "Format: Proposal/Quote presentation. Clearly state what you're offering. Break down scope, timeline, and pricing. Address potential objections. Show why you're the right choice. Include terms and next steps.",
    promptSv: "Format: Offert/Förslag-presentation. Ange tydligt vad du erbjuder. Specificera omfattning, tidslinje och prissättning. Adressera potentiella invändningar. Visa varför du är rätt val. Inkludera villkor och nästa steg.",
  },

  // === KNOWLEDGE LEVEL ===
  {
    id: "knowledge-beginner",
    category: "knowledgeLevel",
    value: "beginner",
    labelEn: "Beginner",
    labelSv: "Nybörjare",
    promptEn: "Knowledge level: Beginner. Assume no prior knowledge of the topic. Explain all concepts from basics. Use simple language and everyday analogies. Define technical terms. Build foundation before advancing.",
    promptSv: "Kunskapsnivå: Nybörjare. Anta ingen förkunskap om ämnet. Förklara alla koncept från grunden. Använd enkelt språk och vardagliga analogier. Definiera tekniska termer. Bygg grund innan du avancerar.",
  },
  {
    id: "knowledge-intermediate",
    category: "knowledgeLevel",
    value: "intermediate",
    labelEn: "Intermediate",
    labelSv: "Mellan",
    promptEn: "Knowledge level: Intermediate. Assume basic familiarity with core concepts. Focus on deeper understanding and application. Introduce more nuanced ideas. Connect to practical scenarios.",
    promptSv: "Kunskapsnivå: Mellan. Anta grundläggande förståelse för kärnkoncept. Fokusera på djupare förståelse och tillämpning. Introducera mer nyanserade idéer. Koppla till praktiska scenarier.",
  },
  {
    id: "knowledge-advanced",
    category: "knowledgeLevel",
    value: "advanced",
    labelEn: "Advanced",
    labelSv: "Avancerad",
    promptEn: "Knowledge level: Advanced. Assume strong expertise. Focus on cutting-edge developments, edge cases, and expert-level insights. Use technical terminology freely. Challenge existing understanding.",
    promptSv: "Kunskapsnivå: Avancerad. Anta stark expertis. Fokusera på senaste utvecklingen, specialfall och expertinsikter. Använd teknisk terminologi fritt. Utmana befintlig förståelse.",
  },
  {
    id: "knowledge-mixed",
    category: "knowledgeLevel",
    value: "mixed",
    labelEn: "Mixed levels",
    labelSv: "Blandade nivåer",
    promptEn: "Knowledge level: Mixed. Accommodate varying expertise in the audience. Layer information from accessible to advanced. Provide optional deep-dives. Use clear section markers for different levels.",
    promptSv: "Kunskapsnivå: Blandad. Anpassa för varierande expertis i publiken. Lagra information från tillgänglig till avancerad. Erbjud valfria fördjupningar. Använd tydliga sektionsmarkörer för olika nivåer.",
  },

  // === IMAGE STYLE ===
  {
    id: "image-none",
    category: "imageStyle",
    value: "none",
    labelEn: "No images",
    labelSv: "Inga bilder",
    promptEn: "Visual style: No AI-generated images. Rely on typography, layout, and text-based design. Use whitespace effectively. Focus on clear visual hierarchy through formatting.",
    promptSv: "Visuell stil: Inga AI-genererade bilder. Förlita dig på typografi, layout och textbaserad design. Använd whitespace effektivt. Fokusera på tydlig visuell hierarki genom formatering.",
  },
  {
    id: "image-professional",
    category: "imageStyle",
    value: "professional",
    labelEn: "Professional photos",
    labelSv: "Professionella foton",
    promptEn: "Visual style: Professional photography. Generate realistic, high-quality images suitable for corporate settings. Clean, polished aesthetic. Appropriate for business contexts. Modern and sophisticated.",
    promptSv: "Visuell stil: Professionell fotografi. Generera realistiska, högkvalitativa bilder lämpliga för företagsmiljöer. Ren, polerad estetik. Lämplig för affärssammanhang. Modern och sofistikerad.",
  },
  {
    id: "image-abstract",
    category: "imageStyle",
    value: "abstract",
    labelEn: "Abstract / Artistic",
    labelSv: "Abstrakt / Konstnärligt",
    promptEn: "Visual style: Abstract and artistic. Generate creative, conceptual imagery. Use colors, shapes, and patterns to convey ideas. Evocative rather than literal. Allow for interpretation.",
    promptSv: "Visuell stil: Abstrakt och konstnärligt. Generera kreativa, konceptuella bilder. Använd färger, former och mönster för att förmedla idéer. Suggestivt snarare än bokstavligt. Tillåt tolkning.",
  },
  {
    id: "image-illustrative",
    category: "imageStyle",
    value: "illustrative",
    labelEn: "Illustrations",
    labelSv: "Illustrationer",
    promptEn: "Visual style: Illustrations and graphics. Generate stylized, drawn imagery. Can include diagrams, icons, and infographic elements. Friendly and approachable aesthetic. Good for explaining concepts.",
    promptSv: "Visuell stil: Illustrationer och grafik. Generera stiliserade, ritade bilder. Kan inkludera diagram, ikoner och infografikelement. Vänlig och tillgänglig estetik. Bra för att förklara koncept.",
  },
];

// Get prompt by category and value
export function getDefaultPrompt(category: string, value: string, language: "en" | "sv"): string {
  const prompt = defaultPrompts.find(p => p.category === category && p.value === value);
  if (!prompt) return "";
  return language === "sv" ? prompt.promptSv : prompt.promptEn;
}

// Get all prompts for a category
export function getPromptsForCategory(category: string): PromptTemplate[] {
  return defaultPrompts.filter(p => p.category === category);
}

// Build combined prompt from selections and customizations
export function buildCombinedPrompt(
  selections: {
    audience: string;
    tonality: string;
    presentationType: string;
    knowledgeLevel: string;
    imageStyle: string;
  },
  customPrompts: Record<string, string>,
  language: "en" | "sv"
): string {
  const parts: string[] = [];

  const categories = ["audience", "tonality", "presentationType", "knowledgeLevel", "imageStyle"] as const;

  for (const category of categories) {
    const value = selections[category];
    const key = getPromptKey(category, value);

    // Use custom prompt if exists, otherwise use default
    const customPrompt = customPrompts[key];
    if (customPrompt) {
      parts.push(customPrompt);
    } else {
      const defaultPrompt = getDefaultPrompt(category, value, language);
      if (defaultPrompt) {
        parts.push(defaultPrompt);
      }
    }
  }

  return parts.join("\n\n");
}

// Get label for a prompt
export function getPromptLabel(category: string, value: string, language: "en" | "sv"): string {
  const prompt = defaultPrompts.find(p => p.category === category && p.value === value);
  if (!prompt) return value;
  return language === "sv" ? prompt.labelSv : prompt.labelEn;
}
