import { PaletteKey, HaikeiBackground, CustomColors } from "./palettes";

export type SlideType =
  | "statement"
  | "story"
  | "list"
  | "comparison"
  | "timeline"
  | "cta";

export type Audience = "c-suite" | "team" | "customers" | "general" | "investors" | "students" | "experts" | "mixed";
export type Duration = 5 | 10 | 20 | 30 | 45;
export type Tonality = "inspiring" | "informative" | "provocative";
export type PresentationType = "keynote" | "educational" | "informative" | "pitch" | "workshop" | "summary" | "proposal";
export type KnowledgeLevel = "beginner" | "intermediate" | "advanced" | "mixed";
export type SlideCount = 10 | 15 | 20 | 30 | 40 | 50 | 70;
export type BackgroundStyle = "dark" | "light" | "gradient" | "dynamic";
export type Language = "en" | "sv";
export type PresentationParts = 1 | 2 | 3 | 4 | 5;

export interface Slide {
  id: string;
  type: SlideType;
  title: string;
  subtitle?: string;
  content?: string[];
  quote?: string;
  attribution?: string;
  leftColumn?: { title: string; items: string[] };
  rightColumn?: { title: string; items: string[] };
  steps?: { title: string; description: string }[];
  speakerNotes: string;
  image?: string; // Base64 encoded image
}

export type ImageStyle = "none" | "professional" | "abstract" | "illustrative";

export interface PresentationInput {
  content: string;
  topic: string;
  audience: Audience;
  duration: Duration;
  tonality: Tonality;
  language: Language;
  presentationType: PresentationType;
  knowledgeLevel: KnowledgeLevel;
  imageStyle: ImageStyle;
  slideCount: SlideCount;
  customPrompt?: string; // User's custom instructions
  presentationParts: PresentationParts; // Split into multiple files
}

export interface PresentationStyle {
  palette: PaletteKey;
  backgroundStyle: BackgroundStyle;
  fontStyle: "modern" | "classic" | "tech";
  haikeiBackground?: HaikeiBackground;
  customColors?: CustomColors;
}

export interface GeneratedPresentation {
  id: string;
  title: string;
  slides: Slide[];
  createdAt: string;
  input: PresentationInput;
  style: PresentationStyle;
}

export interface GenerateRequest {
  input: PresentationInput;
  style: PresentationStyle;
}

export interface GenerateResponse {
  success: boolean;
  presentation?: GeneratedPresentation;
  error?: string;
  imageStats?: {
    imagesGenerated: number;
    errors: number;
  };
}

// Translations
export const translations = {
  en: {
    appTitle: "Keynote Builder",
    appSubtitle: "Transform content into powerful presentations",
    createPresentation: "Create Your Presentation",
    topic: "Presentation Topic",
    topicPlaceholder: "e.g., Leadership in Times of Change",
    content: "Content / Transcript / Notes",
    contentPlaceholder: "Paste your transcript, podcast notes, meeting notes, article, or any content you want to transform into a keynote presentation...",
    audience: "Target Audience",
    duration: "Duration",
    tonality: "Tonality",
    language: "Language",
    styleOptions: "Style Options",
    colorTheme: "Color Theme",
    backgroundStyle: "Background Style",
    fontStyle: "Font Style",
    preview: "Preview",
    speakerNotes: "Speaker Notes",
    download: "Download PowerPoint",
    downloading: "Preparing Download...",
    downloaded: "Downloaded!",
    generate: "Generate Keynote Presentation",
    generating: "Generating your keynote...",
    characters: "characters",
    slides: "slides",
    selected: "Selected",
    history: "History",
    noHistory: "No saved presentations yet",
    loadPresentation: "Load",
    deletePresentation: "Delete",
    clearHistory: "Clear All",
    editSlide: "Edit Slide",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    keynoteStructure: "Keynote Structure",
    audiences: {
      "c-suite": "C-Suite",
      team: "Team",
      customers: "Customers",
      general: "General",
      investors: "Investors",
      students: "Students",
      experts: "Experts",
      mixed: "Mixed audience",
    },
    tonalities: {
      inspiring: "Inspiring",
      informative: "Informative",
      provocative: "Provocative",
    },
    presentationType: "Presentation Type",
    presentationTypes: {
      keynote: "Keynote",
      educational: "Educational",
      informative: "Informative",
      pitch: "Pitch / Sales",
      workshop: "Workshop",
      summary: "Summary / Report",
      proposal: "Proposal / Quote",
    },
    knowledgeLevel: "Knowledge Level",
    knowledgeLevels: {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced",
      mixed: "Mixed levels",
    },
    voiceInput: "Voice Input",
    recording: "Recording...",
    stopRecording: "Stop",
    startRecording: "Record",
    imageStyle: "Slide Images",
    imageStyles: {
      none: "No images",
      professional: "Professional photos",
      abstract: "Abstract / Artistic",
      illustrative: "Illustrations",
    },
    slideCount: "Number of Slides",
    slideCounts: {
      10: "10 slides (quick)",
      15: "15 slides",
      20: "20 slides",
      30: "30 slides",
      40: "40 slides",
      50: "50 slides",
      70: "70 slides (comprehensive)",
    },
    presentationParts: "Split Presentation",
    presentationPartsOptions: {
      1: "One file",
      2: "2 parts",
      3: "3 parts",
      4: "4 parts",
      5: "5 parts",
    },
    presentationPartsHelp: "Split into multiple PowerPoint files (useful for courses/training)",
    customPrompt: "Custom Instructions (Optional)",
    customPromptPlaceholder: "Add your own instructions, perspectives, specific angles, or context. E.g., 'Focus on ROI arguments', 'Include competitor comparisons', 'Emphasize sustainability aspects'...",
    enhancePrompt: "✨ Enhance with AI",
    enhancingPrompt: "Analyzing...",
    promptEnhanced: "Suggestions added!",
    promptEnhanceError: "Could not enhance prompt",
    steps: [
      "Hook - Capture attention",
      "Problem - Define the challenge",
      "Story - Share a real example",
      "Insight - Reveal what you learned",
      "Framework - New way to think",
      "Practical - Concrete steps",
      "CTA - Call to action",
    ],
  },
  sv: {
    appTitle: "Keynote Builder",
    appSubtitle: "Förvandla innehåll till kraftfulla presentationer",
    createPresentation: "Skapa din presentation",
    topic: "Presentationsämne",
    topicPlaceholder: "t.ex. Ledarskap i förändring",
    content: "Innehåll / Transkript / Anteckningar",
    contentPlaceholder: "Klistra in ditt transkript, poddanteckningar, mötesanteckningar, artikel eller annat innehåll du vill förvandla till en keynote-presentation...",
    audience: "Målgrupp",
    duration: "Längd",
    tonality: "Tonalitet",
    language: "Språk",
    styleOptions: "Stilalternativ",
    colorTheme: "Färgtema",
    backgroundStyle: "Bakgrundsstil",
    fontStyle: "Typsnitt",
    preview: "Förhandsgranskning",
    speakerNotes: "Talarnotiser",
    download: "Ladda ner PowerPoint",
    downloading: "Förbereder nedladdning...",
    downloaded: "Nedladdad!",
    generate: "Generera Keynote-presentation",
    generating: "Genererar din keynote...",
    characters: "tecken",
    slides: "slides",
    selected: "Vald",
    history: "Historik",
    noHistory: "Inga sparade presentationer än",
    loadPresentation: "Ladda",
    deletePresentation: "Ta bort",
    clearHistory: "Rensa alla",
    editSlide: "Redigera slide",
    saveChanges: "Spara ändringar",
    cancel: "Avbryt",
    keynoteStructure: "Keynote-struktur",
    audiences: {
      "c-suite": "Ledningsgrupp",
      team: "Team",
      customers: "Kunder",
      general: "Allmän",
      investors: "Investerare",
      students: "Studenter",
      experts: "Experter",
      mixed: "Blandad publik",
    },
    tonalities: {
      inspiring: "Inspirerande",
      informative: "Informativ",
      provocative: "Provocerande",
    },
    presentationType: "Presentationstyp",
    presentationTypes: {
      keynote: "Keynote",
      educational: "Utbildning",
      informative: "Informerande",
      pitch: "Pitch / Försäljning",
      workshop: "Workshop",
      summary: "Sammanfattning / Rapport",
      proposal: "Offert / Förslag",
    },
    knowledgeLevel: "Kunskapsnivå",
    knowledgeLevels: {
      beginner: "Nybörjare",
      intermediate: "Mellan",
      advanced: "Avancerad",
      mixed: "Blandade nivåer",
    },
    voiceInput: "Röstinmatning",
    recording: "Spelar in...",
    stopRecording: "Stoppa",
    startRecording: "Spela in",
    imageStyle: "Bilder i slides",
    imageStyles: {
      none: "Inga bilder",
      professional: "Professionella foton",
      abstract: "Abstrakt / Konstnärligt",
      illustrative: "Illustrationer",
    },
    slideCount: "Antal slides",
    slideCounts: {
      10: "10 slides (snabb)",
      15: "15 slides",
      20: "20 slides",
      30: "30 slides",
      40: "40 slides",
      50: "50 slides",
      70: "70 slides (omfattande)",
    },
    presentationParts: "Dela upp presentation",
    presentationPartsOptions: {
      1: "En fil",
      2: "2 delar",
      3: "3 delar",
      4: "4 delar",
      5: "5 delar",
    },
    presentationPartsHelp: "Dela upp i flera PowerPoint-filer (bra för kurser/utbildningar)",
    customPrompt: "Egna instruktioner (Valfritt)",
    customPromptPlaceholder: "Lägg till egna instruktioner, perspektiv, specifika vinklar eller kontext. T.ex. 'Fokusera på ROI-argument', 'Inkludera konkurrentjämförelser', 'Betona hållbarhetsaspekter'...",
    enhancePrompt: "✨ Förbättra med AI",
    enhancingPrompt: "Analyserar...",
    promptEnhanced: "Förslag tillagda!",
    promptEnhanceError: "Kunde inte förbättra prompten",
    steps: [
      "Hook - Fånga uppmärksamhet",
      "Problem - Definiera utmaningen",
      "Berättelse - Dela ett verkligt exempel",
      "Insikt - Avslöja vad du lärde dig",
      "Ramverk - Nytt sätt att tänka",
      "Praktiskt - Konkreta steg",
      "CTA - Uppmaning till handling",
    ],
  },
};

export type TranslationKey = keyof typeof translations.en;
