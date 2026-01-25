export type PaletteKey = "doings" | "corporate" | "bold";

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
};

export const getHexColor = (color: string): string => {
  return color.startsWith("#") ? color : `#${color}`;
};
