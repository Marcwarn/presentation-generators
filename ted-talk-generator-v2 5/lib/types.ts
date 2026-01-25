import { PaletteKey } from "./palettes";

export type SlideType =
  | "statement"
  | "story"
  | "list"
  | "comparison"
  | "timeline"
  | "cta";

export type Audience = "c-suite" | "team" | "customers" | "general";
export type Duration = 10 | 20 | 30;
export type Tonality = "inspiring" | "informative" | "provocative";
export type BackgroundStyle = "dark" | "light" | "gradient";
export type Language = "en" | "sv";

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
}

export interface PresentationInput {
  content: string;
  topic: string;
  audience: Audience;
  duration: Duration;
  tonality: Tonality;
  language: Language;
}

export interface PresentationStyle {
  palette: PaletteKey;
  backgroundStyle: BackgroundStyle;
  fontStyle: "modern" | "classic" | "tech";
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
}

// Translations
export const translations = {
  en: {
    appTitle: "TED Talk Generator",
    appSubtitle: "Transform content into powerful presentations",
    createPresentation: "Create Your Presentation",
    topic: "Presentation Topic",
    topicPlaceholder: "e.g., The Future of AI in Healthcare",
    content: "Content / Transcript / Notes",
    contentPlaceholder: "Paste your transcript, meeting notes, article, or any content you want to transform into a TED Talk presentation...",
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
    generate: "Generate TED Talk Presentation",
    generating: "Generating your TED Talk...",
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
    tedStructure: "TED Talk Structure",
    audiences: {
      "c-suite": "C-Suite",
      team: "Team",
      customers: "Customers",
      general: "General",
    },
    tonalities: {
      inspiring: "Inspiring",
      informative: "Informative",
      provocative: "Provocative",
    },
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
    appTitle: "TED Talk Generator",
    appSubtitle: "Förvandla innehåll till kraftfulla presentationer",
    createPresentation: "Skapa din presentation",
    topic: "Presentationsämne",
    topicPlaceholder: "t.ex. Framtiden för AI inom sjukvården",
    content: "Innehåll / Transkript / Anteckningar",
    contentPlaceholder: "Klistra in ditt transkript, mötesanteckningar, artikel eller annat innehåll du vill förvandla till en TED Talk-presentation...",
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
    generate: "Generera TED Talk-presentation",
    generating: "Genererar din TED Talk...",
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
    tedStructure: "TED Talk-struktur",
    audiences: {
      "c-suite": "Ledningsgrupp",
      team: "Team",
      customers: "Kunder",
      general: "Allmän",
    },
    tonalities: {
      inspiring: "Inspirerande",
      informative: "Informativ",
      provocative: "Provocerande",
    },
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
