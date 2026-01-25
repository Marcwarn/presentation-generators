export type PaletteKey = "doingsPro" | "doings" | "corporate" | "bold" | "minimal" | "sunset" | "ocean" | "custom";

// Haikei-inspired background styles
export type HaikeiBackground = "none" | "wave" | "layeredWaves" | "blob" | "blobScene" | "blurryGradient" | "circleScatter";

export interface Palette {
  name: string;
  darkBg: string;
  navyBg: string;
  primary: string;
  secondary: string;
  accent: string;
  contrast: string;
  textLight: string;
  textMuted: string;
}

export const palettes: Record<PaletteKey, Palette> = {
  doingsPro: {
    name: "Doings Pro ✨",
    darkBg: "0A0A14",
    navyBg: "0D1B2A",
    primary: "E85A9C",
    secondary: "C9A227",
    accent: "F5A68C",
    contrast: "4A7C7C",
    textLight: "FFFFFF",
    textMuted: "9FAFBF",
  },
  doings: {
    name: "Doings",
    darkBg: "0d0d14",
    navyBg: "1a1a2e",
    primary: "E85A9C",
    secondary: "F5A68C",
    accent: "C9A227",
    contrast: "4A7C7C",
    textLight: "FFFFFF",
    textMuted: "A0A0B0",
  },
  corporate: {
    name: "Corporate",
    darkBg: "1a1a2e",
    navyBg: "2d3748",
    primary: "3182ce",
    secondary: "63b3ed",
    accent: "f6ad55",
    contrast: "48bb78",
    textLight: "FFFFFF",
    textMuted: "A0AEC0",
  },
  bold: {
    name: "Bold",
    darkBg: "000000",
    navyBg: "1a1a1a",
    primary: "ff6b6b",
    secondary: "feca57",
    accent: "48dbfb",
    contrast: "1dd1a1",
    textLight: "FFFFFF",
    textMuted: "888888",
  },
  minimal: {
    name: "Minimal",
    darkBg: "fafafa",
    navyBg: "f0f0f0",
    primary: "1a1a1a",
    secondary: "4a4a4a",
    accent: "0066cc",
    contrast: "666666",
    textLight: "1a1a1a",
    textMuted: "888888",
  },
  sunset: {
    name: "Sunset",
    darkBg: "1a0a1a",
    navyBg: "2d1a2d",
    primary: "ff6b35",
    secondary: "f7c59f",
    accent: "efa00b",
    contrast: "d65780",
    textLight: "FFFFFF",
    textMuted: "B0A0B0",
  },
  ocean: {
    name: "Ocean",
    darkBg: "0a1628",
    navyBg: "132f4c",
    primary: "5bb5f0",
    secondary: "8eddf9",
    accent: "00d4aa",
    contrast: "7c4dff",
    textLight: "FFFFFF",
    textMuted: "94a3b8",
  },
  custom: {
    name: "Custom",
    darkBg: "0A0A14",
    navyBg: "0D1B2A",
    primary: "E85A9C",
    secondary: "C9A227",
    accent: "F5A68C",
    contrast: "4A7C7C",
    textLight: "FFFFFF",
    textMuted: "9FAFBF",
  },
};

// Custom color interface for user-defined palettes
export interface CustomColors {
  color1: string; // Primary/accent
  color2: string; // Secondary
  color3: string; // Background dark
  color4: string; // Background light
  color5: string; // Text/contrast
}

export const defaultCustomColors: CustomColors = {
  color1: "#E85A9C", // Pink
  color2: "#F5A68C", // Peach
  color3: "#0D1B2A", // Dark navy
  color4: "#1B3A4B", // Navy
  color5: "#FFFFFF", // White
};

// Haikei background configurations
export interface HaikeiConfig {
  name: string;
  description: string;
  icon: string;
}

export const haikeiBackgrounds: Record<HaikeiBackground, HaikeiConfig> = {
  none: {
    name: "None",
    description: "Solid color background",
    icon: "🚫",
  },
  wave: {
    name: "Wave",
    description: "Single flowing wave",
    icon: "🌊",
  },
  layeredWaves: {
    name: "Layered Waves",
    description: "Multiple layered waves",
    icon: "〰️",
  },
  blob: {
    name: "Blob",
    description: "Organic blob shape",
    icon: "💧",
  },
  blobScene: {
    name: "Blob Scene",
    description: "Multiple flowing blobs",
    icon: "🫧",
  },
  blurryGradient: {
    name: "Blurry Gradient",
    description: "Soft gradient blur",
    icon: "🌈",
  },
  circleScatter: {
    name: "Circle Scatter",
    description: "Scattered circles pattern",
    icon: "⚪",
  },
};

export const getHexColor = (color: string): string => {
  return color.startsWith("#") ? color : `#${color}`;
};
