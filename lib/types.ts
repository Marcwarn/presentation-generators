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

export interface Slide {
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
}

export interface PresentationStyle {
  palette: PaletteKey;
  backgroundStyle: BackgroundStyle;
  fontStyle: "modern" | "classic" | "tech";
}

export interface GeneratedPresentation {
  title: string;
  slides: Slide[];
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
