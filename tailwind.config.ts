import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        doings: {
          dark: "#0d0d14",
          navy: "#1a1a2e",
          primary: "#E85A9C",
          secondary: "#F5A68C",
          accent: "#C9A227",
          contrast: "#4A7C7C",
        },
        corporate: {
          dark: "#1a1a2e",
          navy: "#2d3748",
          primary: "#3182ce",
          secondary: "#63b3ed",
          accent: "#f6ad55",
          contrast: "#48bb78",
        },
        bold: {
          dark: "#000000",
          navy: "#1a1a1a",
          primary: "#ff6b6b",
          secondary: "#feca57",
          accent: "#48dbfb",
          contrast: "#1dd1a1",
        },
      },
    },
  },
  plugins: [],
};

export default config;
