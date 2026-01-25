import PptxGenJS from "pptxgenjs";
import { GeneratedPresentation, Slide } from "./types";

// ====================
// DOINGS PRO COLOR PALETTE
// Exact colors from "Släpp Sargen" design documentation
// ====================
const COLORS = {
  // Backgrounds
  bg: "0A0A14",           // Svart - primär bakgrund
  bgNavy: "0D1B2A",       // Marinblå - alternativ bakgrund
  bgMid: "1B2838",        // Mellanton - boxar och containers

  // Accent colors (rotation per slide)
  magenta: "E85A9C",      // PRIMÄR ACCENT - rubriker, huvudaccent
  gold: "C9A227",         // SEKUNDÄR - variation på rubriker
  coral: "F5A68C",        // Under-rubriker, kontrastpunkter
  teal: "4A7C7C",         // Kontrastfärg, tredje nivå
  pink: "F5B8C8",         // Citat-ramar, varningsrutor (mjuk)

  // Text
  text: "FFFFFF",         // Primär text
  textMuted: "9FAFBF",    // Sekundär text
  textSubtle: "D4E0EC",   // Subtil text
  border: "3D4F5F"        // Ramar och linjer
};

// Accent color rotation for sidebar (changes per slide)
const ACCENT_ROTATION = [
  { sidebar: COLORS.magenta, accent: COLORS.magenta },
  { sidebar: COLORS.gold, accent: COLORS.gold },
  { sidebar: COLORS.teal, accent: COLORS.teal },
  { sidebar: COLORS.coral, accent: COLORS.coral },
];

interface SlideColors {
  sidebar: string;
  accent: string;
}

function getSlideColors(index: number): SlideColors {
  return ACCENT_ROTATION[index % ACCENT_ROTATION.length];
}

// Get alternating background color
function getBackgroundColor(index: number): string {
  return index % 2 === 0 ? COLORS.bg : COLORS.bgNavy;
}

// Helper to split title for two-tone effect
function splitTitleForTwoTone(title: string): [string, string] {
  const words = title.split(" ");
  if (words.length === 1) {
    return [title, ""];
  }
  const midpoint = Math.ceil(words.length / 2);
  const firstPart = words.slice(0, midpoint).join(" ");
  const secondPart = words.slice(midpoint).join(" ");
  return [firstPart, secondPart];
}

export async function generateDoingsProPptx(
  presentation: GeneratedPresentation
): Promise<Buffer> {
  const pptx = new PptxGenJS();

  pptx.author = "TED Talk Generator - Doings Pro";
  pptx.title = presentation.title;
  pptx.subject = "TED Talk Presentation";

  // Set slide size to 16:9 (10" x 5.63")
  pptx.defineLayout({ name: "LAYOUT_16x9", width: 10, height: 5.63 });
  pptx.layout = "LAYOUT_16x9";

  for (let i = 0; i < presentation.slides.length; i++) {
    const slide = presentation.slides[i];
    const colors = getSlideColors(i);
    const bgColor = getBackgroundColor(i);
    addDoingsProSlide(pptx, slide, colors, bgColor, i);
  }

  const data = await pptx.write({ outputType: "nodebuffer" });
  return data as Buffer;
}

function addDoingsProSlide(
  pptx: PptxGenJS,
  slideData: Slide,
  colors: SlideColors,
  bgColor: string,
  index: number
) {
  const slide = pptx.addSlide();

  // Dark background
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: 10,
    h: 5.63,
    fill: { type: "solid", color: bgColor }
  });

  // Left sidebar accent (0.08" wide, full height)
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: 0.08,
    h: 5.63,
    fill: { type: "solid", color: colors.sidebar }
  });

  // Add speaker notes
  if (slideData.speakerNotes) {
    slide.addNotes(slideData.speakerNotes);
  }

  switch (slideData.type) {
    case "statement":
      addStatementSlide(slide, slideData, colors, index);
      break;
    case "story":
      addStorySlide(slide, slideData, colors);
      break;
    case "list":
      addListSlide(slide, slideData, colors);
      break;
    case "comparison":
      addComparisonSlide(slide, slideData, colors, bgColor);
      break;
    case "timeline":
      addTimelineSlide(slide, slideData, colors, bgColor);
      break;
    case "cta":
      addCtaSlide(slide, slideData, colors);
      break;
    default:
      addStatementSlide(slide, slideData, colors, index);
  }
}

// ====================
// STATEMENT SLIDE
// Two-tone headline + quote box + insight box
// ====================
function addStatementSlide(
  slide: PptxGenJS.Slide,
  data: Slide,
  colors: SlideColors,
  index: number
) {
  // Category tag at top
  slide.addText(data.type.toUpperCase(), {
    x: 0.8,
    y: 0.5,
    w: 8,
    h: 0.3,
    fontSize: 11,
    color: colors.accent,
    fontFace: "Arial",
  });

  // Two-tone headline
  const [firstPart, secondPart] = splitTitleForTwoTone(data.title);
  slide.addText([
    { text: firstPart.toUpperCase() + "\n", options: { color: COLORS.text } },
    { text: secondPart.toUpperCase(), options: { color: colors.accent } }
  ], {
    x: 0.8,
    y: 0.85,
    w: 8,
    h: 1.2,
    fontSize: 38,
    fontFace: "Arial Black",
    bold: true,
    lineSpacing: 40
  });

  // Quote box with pink border (if subtitle exists)
  if (data.subtitle) {
    slide.addShape("rect", {
      x: 0.8,
      y: 2.2,
      w: 5,
      h: 2.3,
      fill: { type: "solid", color: COLORS.bgMid },
      line: { color: COLORS.pink, width: 2, dashType: "solid" }
    });

    slide.addText(`"${data.subtitle}"`, {
      x: 1.0,
      y: 2.4,
      w: 4.6,
      h: 1.8,
      fontSize: 16,
      color: COLORS.text,
      fontFace: "Arial",
      italic: true,
      valign: "top"
    });

  }

  // Insight box on the right
  const secondaryAccent = ACCENT_ROTATION[(index + 1) % ACCENT_ROTATION.length].accent;
  slide.addText("INSIKT", {
    x: 6.2,
    y: 2.2,
    w: 3,
    h: 0.3,
    fontSize: 11,
    color: secondaryAccent,
    fontFace: "Arial"
  });

  const insightText = data.speakerNotes?.substring(0, 100) || "Nyckelinsikt för denna slide.";
  slide.addText(insightText, {
    x: 6.2,
    y: 2.6,
    w: 3,
    h: 1,
    fontSize: 14,
    color: COLORS.textSubtle,
    fontFace: "Arial"
  });

  // AHA-moment box
  slide.addShape("rect", {
    x: 6.2,
    y: 3.8,
    w: 3,
    h: 0.9,
    fill: { type: "solid", color: COLORS.bg },
    line: { color: COLORS.border, width: 1 }
  });

  slide.addText("AHA-MOMENT", {
    x: 6.4,
    y: 3.9,
    w: 2.6,
    h: 0.3,
    fontSize: 11,
    color: COLORS.gold,
    fontFace: "Arial",
    bold: true
  });

  slide.addText("Tänk på det. Har DU testat detta?", {
    x: 6.4,
    y: 4.2,
    w: 2.6,
    h: 0.4,
    fontSize: 12,
    color: COLORS.textMuted,
    fontFace: "Arial"
  });

  // Decorative accent lines (bottom right)
  slide.addShape("rect", {
    x: 8.5,
    y: 4.5,
    w: 1.0,
    h: 0.08,
    fill: { type: "solid", color: COLORS.gold }
  });
  slide.addShape("rect", {
    x: 8.7,
    y: 4.65,
    w: 0.8,
    h: 0.08,
    fill: { type: "solid", color: COLORS.coral }
  });
}

// ====================
// STORY SLIDE
// Large quote with attribution + takeaway box
// ====================
function addStorySlide(
  slide: PptxGenJS.Slide,
  data: Slide,
  colors: SlideColors
) {
  // Category tag
  slide.addText("HISTORIA", {
    x: 0.8,
    y: 0.4,
    w: 8,
    h: 0.3,
    fontSize: 11,
    color: colors.accent,
    fontFace: "Arial"
  });

  // Title with accent color
  slide.addText(data.title.toUpperCase(), {
    x: 0.8,
    y: 0.75,
    w: 9,
    h: 0.6,
    fontSize: 34,
    color: COLORS.gold,
    fontFace: "Arial Black",
    bold: true
  });

  // Large quote box
  slide.addShape("rect", {
    x: 0.4,
    y: 1.5,
    w: 5.8,
    h: 3.8,
    fill: { type: "solid", color: COLORS.bgMid }
  });

  const quoteText = data.quote || data.subtitle || data.title;
  slide.addText(`"${quoteText}"`, {
    x: 0.6,
    y: 1.65,
    w: 5.4,
    h: 2.5,
    fontSize: 16,
    color: COLORS.text,
    fontFace: "Arial",
    italic: true,
    valign: "top"
  });

  // Attribution
  if (data.attribution) {
    slide.addText(`— ${data.attribution}`, {
      x: 0.6,
      y: 4.8,
      w: 5.4,
      h: 0.3,
      fontSize: 11,
      color: COLORS.textMuted,
      fontFace: "Arial"
    });
  }

  // Takeaway box on right with accent border
  slide.addShape("rect", {
    x: 6.5,
    y: 1.5,
    w: 3.2,
    h: 2.5,
    fill: { type: "solid", color: COLORS.bg },
    line: { color: colors.accent, width: 2 }
  });

  slide.addText("TAKEAWAY", {
    x: 6.7,
    y: 1.65,
    w: 2.8,
    h: 0.3,
    fontSize: 11,
    color: colors.accent,
    fontFace: "Arial"
  });

  const takeawayText = data.speakerNotes?.substring(0, 150) || "Nyckelinsikt från denna historia.";
  slide.addText(takeawayText, {
    x: 6.7,
    y: 2.05,
    w: 2.8,
    h: 1.8,
    fontSize: 13,
    color: COLORS.textSubtle,
    fontFace: "Arial"
  });

  // WOW-moment box
  slide.addShape("rect", {
    x: 6.5,
    y: 4.2,
    w: 3.2,
    h: 0.8,
    fill: { type: "solid", color: COLORS.bg },
    line: { color: COLORS.pink, width: 2, dashType: "dash" }
  });

  slide.addText("Resonerar detta med dig?", {
    x: 6.5,
    y: 4.35,
    w: 3.2,
    h: 0.5,
    fontSize: 12,
    color: COLORS.pink,
    fontFace: "Arial",
    align: "center"
  });
}

// ====================
// LIST SLIDE
// Step boxes with colored top accents
// ====================
function addListSlide(
  slide: PptxGenJS.Slide,
  data: Slide,
  colors: SlideColors
) {
  // Category tag
  slide.addText("NYCKELPUNKTER", {
    x: 0.8,
    y: 0.35,
    w: 8,
    h: 0.25,
    fontSize: 11,
    color: colors.accent,
    fontFace: "Arial"
  });

  // Two-tone title
  const [firstPart, secondPart] = splitTitleForTwoTone(data.title);
  slide.addText([
    { text: firstPart.toUpperCase() + " ", options: { color: COLORS.text } },
    { text: secondPart.toUpperCase(), options: { color: COLORS.magenta } }
  ], {
    x: 0.8,
    y: 0.65,
    w: 9,
    h: 0.55,
    fontSize: 36,
    fontFace: "Arial Black",
    bold: true
  });

  // Step boxes
  const items = data.content || [];
  const stepCount = Math.min(items.length, 4);
  const stepW = 2.15;
  const stepGap = 0.2;
  const stepH = 3.5;
  const stepY = 1.4;

  const stepColors = [COLORS.magenta, COLORS.gold, COLORS.coral, COLORS.teal];

  items.slice(0, 4).forEach((item, i) => {
    const x = 0.5 + i * (stepW + stepGap);

    // Box background
    slide.addShape("rect", {
      x: x,
      y: stepY,
      w: stepW,
      h: stepH,
      fill: { type: "solid", color: COLORS.bgMid }
    });

    // Colored top accent line
    slide.addShape("rect", {
      x: x,
      y: stepY,
      w: stepW,
      h: 0.04,
      fill: { type: "solid", color: stepColors[i] }
    });

    // Step number (01, 02, etc)
    const num = String(i + 1).padStart(2, "0");
    slide.addText(num, {
      x: x + 0.15,
      y: stepY + 0.2,
      w: 1.8,
      h: 0.6,
      fontSize: 38,
      color: stepColors[i],
      fontFace: "Arial Black"
    });

    // Step title
    const stepTitle = typeof item === "string" ? `Steg ${i + 1}` : (item as any).title || `Steg ${i + 1}`;
    slide.addText(stepTitle.toUpperCase(), {
      x: x + 0.15,
      y: stepY + 0.85,
      w: 1.85,
      h: 0.4,
      fontSize: 13,
      color: COLORS.text,
      fontFace: "Arial",
      bold: true
    });

    // Step description
    const stepDesc = typeof item === "string" ? item : (item as any).description || item;
    slide.addText(stepDesc, {
      x: x + 0.15,
      y: stepY + 1.3,
      w: 1.85,
      h: 2,
      fontSize: 11,
      color: COLORS.textMuted,
      fontFace: "Arial",
      valign: "top"
    });
  });
}

// ====================
// COMPARISON SLIDE
// Two columns with warning stripes
// ====================
function addComparisonSlide(
  slide: PptxGenJS.Slide,
  data: Slide,
  colors: SlideColors,
  bgColor: string
) {
  // Warning stripes at top and bottom
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: 10,
    h: 0.06,
    fill: { type: "solid", color: COLORS.coral }
  });
  slide.addShape("rect", {
    x: 0,
    y: 5.57,
    w: 10,
    h: 0.06,
    fill: { type: "solid", color: COLORS.coral }
  });

  // Override sidebar with background (center-focused layout)
  slide.addShape("rect", {
    x: 0,
    y: 0.06,
    w: 0.08,
    h: 5.51,
    fill: { type: "solid", color: bgColor }
  });

  // Centered headline
  slide.addText(data.title.toUpperCase(), {
    x: 0,
    y: 0.6,
    w: 10,
    h: 0.6,
    fontSize: 42,
    color: COLORS.magenta,
    fontFace: "Arial Black",
    bold: true,
    align: "center"
  });

  // Central message box with pink border
  if (data.subtitle) {
    slide.addShape("rect", {
      x: 1.5,
      y: 1.5,
      w: 7,
      h: 1.8,
      fill: { type: "solid", color: COLORS.bgMid },
      line: { color: COLORS.pink, width: 3 }
    });

    slide.addText(`"${data.subtitle}"`, {
      x: 1.7,
      y: 1.6,
      w: 6.6,
      h: 1.6,
      fontSize: 26,
      color: COLORS.text,
      fontFace: "Arial",
      bold: true,
      align: "center",
      valign: "middle"
    });
  }

  // Left column - statistics
  slide.addText("70%+", {
    x: 1.5,
    y: 3.7,
    w: 2.5,
    h: 0.7,
    fontSize: 44,
    color: COLORS.magenta,
    fontFace: "Arial Black",
    align: "center"
  });

  const leftLabel = data.leftColumn?.title || "av användarna väljer\ndetta alternativ";
  slide.addText(leftLabel, {
    x: 1.5,
    y: 4.4,
    w: 2.5,
    h: 0.6,
    fontSize: 11,
    color: COLORS.textMuted,
    fontFace: "Arial",
    align: "center"
  });

  // Divider line
  slide.addShape("rect", {
    x: 4.9,
    y: 3.8,
    w: 0.02,
    h: 1.1,
    fill: { type: "solid", color: COLORS.border }
  });

  // Right column - statistics
  slide.addText("0%", {
    x: 6,
    y: 3.7,
    w: 2.5,
    h: 0.7,
    fontSize: 44,
    color: COLORS.teal,
    fontFace: "Arial Black",
    align: "center"
  });

  const rightLabel = data.rightColumn?.title || "har kontroll över\ndetta";
  slide.addText(rightLabel, {
    x: 6,
    y: 4.4,
    w: 2.5,
    h: 0.6,
    fontSize: 11,
    color: COLORS.textMuted,
    fontFace: "Arial",
    align: "center"
  });
}

// ====================
// TIMELINE SLIDE
// Large headline + quote + stat boxes
// ====================
function addTimelineSlide(
  slide: PptxGenJS.Slide,
  data: Slide,
  colors: SlideColors,
  bgColor: string
) {
  // Top accent bar
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: 10,
    h: 0.08,
    fill: { type: "solid", color: COLORS.magenta }
  });

  // Override sidebar
  slide.addShape("rect", {
    x: 0,
    y: 0.08,
    w: 0.08,
    h: 5.55,
    fill: { type: "solid", color: bgColor }
  });

  // Large centered headline
  slide.addText(data.title.toUpperCase(), {
    x: 0,
    y: 0.5,
    w: 10,
    h: 0.7,
    fontSize: 48,
    color: COLORS.magenta,
    fontFace: "Arial Black",
    bold: true,
    align: "center"
  });

  // Subheadline
  if (data.subtitle) {
    slide.addText(data.subtitle, {
      x: 0,
      y: 1.2,
      w: 10,
      h: 0.4,
      fontSize: 18,
      color: COLORS.coral,
      fontFace: "Arial",
      align: "center"
    });
  }

  // Quote box with pink border
  const quoteText = data.speakerNotes?.substring(0, 200) || "Nyckelcitat för denna slide.";
  slide.addShape("rect", {
    x: 1.2,
    y: 1.8,
    w: 7.6,
    h: 1.2,
    fill: { type: "solid", color: COLORS.bgMid },
    line: { color: COLORS.pink, width: 3, dashType: "solid" }
  });

  slide.addText(`"${quoteText}"`, {
    x: 1.4,
    y: 1.95,
    w: 7.2,
    h: 0.9,
    fontSize: 18,
    color: COLORS.text,
    fontFace: "Arial",
    italic: true,
    valign: "middle"
  });

  // Three stat boxes
  const statColors = [COLORS.magenta, COLORS.gold, COLORS.teal];
  const stats = [
    { value: "1:a", label: "Högpresterare\nlämnar först" },
    { value: "2x", label: "Dyrare att\nersätta dem" },
    { value: "?", label: "Vem blir kvar\natt bygga framtiden?" }
  ];

  stats.forEach((stat, i) => {
    const x = 1 + i * 2.8;

    // Box background
    slide.addShape("rect", {
      x: x,
      y: 3.3,
      w: 2.4,
      h: 1.7,
      fill: { type: "solid", color: COLORS.bgMid }
    });

    // Colored top accent
    slide.addShape("rect", {
      x: x,
      y: 3.3,
      w: 2.4,
      h: 0.04,
      fill: { type: "solid", color: statColors[i] }
    });

    // Value
    slide.addText(stat.value, {
      x: x,
      y: 3.5,
      w: 2.4,
      h: 0.6,
      fontSize: 32,
      color: statColors[i],
      fontFace: "Arial Black",
      align: "center"
    });

    // Label
    slide.addText(stat.label, {
      x: x,
      y: 4.15,
      w: 2.4,
      h: 0.6,
      fontSize: 11,
      color: COLORS.textMuted,
      fontFace: "Arial",
      align: "center"
    });
  });
}

// ====================
// CTA SLIDE
// Double sidebar + action items + closing
// ====================
function addCtaSlide(
  slide: PptxGenJS.Slide,
  data: Slide,
  colors: SlideColors
) {
  // Add right sidebar too
  slide.addShape("rect", {
    x: 9.92,
    y: 0,
    w: 0.08,
    h: 5.63,
    fill: { type: "solid", color: COLORS.gold }
  });

  // Two-tone headline
  const [firstPart, secondPart] = splitTitleForTwoTone(data.title);
  slide.addText([
    { text: firstPart.toUpperCase() + "\n", options: { color: COLORS.magenta } },
    { text: secondPart.toUpperCase(), options: { color: COLORS.text } }
  ], {
    x: 0.5,
    y: 0.4,
    w: 9,
    h: 1,
    fontSize: 38,
    fontFace: "Arial Black",
    bold: true,
    lineSpacing: 40
  });

  // Left column - Quick wins label
  slide.addText("SNABBA VINSTER", {
    x: 0.5,
    y: 1.5,
    w: 4.5,
    h: 0.3,
    fontSize: 11,
    color: COLORS.gold,
    fontFace: "Arial"
  });

  // Action items
  const actionColors = [COLORS.magenta, COLORS.gold, COLORS.coral, COLORS.teal];
  const actions = [
    { time: "09:00", text: "Skaffa en personlig AI-licens" },
    { time: "10:00", text: "Gör din månadsrapport med AI" },
    { time: "14:00", text: "Prata med IT om Team-licenser" },
    { time: "16:00", text: "Identifiera 2-3 AI-entusiaster" }
  ];

  actions.forEach((action, i) => {
    const y = 1.9 + i * 0.75;

    // Action box
    slide.addShape("rect", {
      x: 0.5,
      y: y,
      w: 4.5,
      h: 0.65,
      fill: { type: "solid", color: COLORS.bgMid }
    });

    // Left accent line
    slide.addShape("rect", {
      x: 0.5,
      y: y,
      w: 0.03,
      h: 0.65,
      fill: { type: "solid", color: actionColors[i] }
    });

    // Time + action text
    slide.addText([
      { text: action.time, options: { color: actionColors[i], bold: true } },
      { text: ` — ${action.text}`, options: { color: COLORS.text } }
    ], {
      x: 0.65,
      y: y + 0.15,
      w: 4.2,
      h: 0.35,
      fontSize: 13,
      fontFace: "Arial"
    });
  });

  // Right column header
  slide.addText("SLUTA GÖMMA DIG BAKOM", {
    x: 5.3,
    y: 1.5,
    w: 4.2,
    h: 0.3,
    fontSize: 11,
    color: COLORS.coral,
    fontFace: "Arial"
  });

  // Excuses box
  slide.addShape("rect", {
    x: 5.3,
    y: 1.9,
    w: 4.2,
    h: 2.7,
    fill: { type: "solid", color: COLORS.bgMid }
  });

  const excuses = ['"Informationssäkerhet"', '"GDPR"', '"Ägarnas krav"', '"Vi har inte budget"'];
  excuses.forEach((excuse, i) => {
    slide.addText("• " + excuse, {
      x: 5.5,
      y: 2.0 + i * 0.55,
      w: 3.9,
      h: 0.4,
      fontSize: 14,
      color: COLORS.textSubtle,
      fontFace: "Arial"
    });
  });

  // Final CTA box with pink border
  slide.addShape("rect", {
    x: 5.5,
    y: 4.7,
    w: 3.8,
    h: 0.55,
    fill: { type: "solid", color: COLORS.bg },
    line: { color: COLORS.pink, width: 2 }
  });

  slide.addText("Informationen är inte så känslig som du tror.", {
    x: 5.6,
    y: 4.78,
    w: 3.6,
    h: 0.4,
    fontSize: 11,
    color: COLORS.pink,
    fontFace: "Arial",
    align: "center",
    bold: true
  });

  // Bottom gradient accent bars
  slide.addShape("rect", {
    x: 1,
    y: 5.4,
    w: 2.5,
    h: 0.03,
    fill: { type: "solid", color: COLORS.magenta }
  });
  slide.addShape("rect", {
    x: 3.7,
    y: 5.4,
    w: 2.5,
    h: 0.03,
    fill: { type: "solid", color: COLORS.gold }
  });
  slide.addShape("rect", {
    x: 6.5,
    y: 5.4,
    w: 2.5,
    h: 0.03,
    fill: { type: "solid", color: COLORS.teal }
  });
}

// Export for preview component
export const doingsProColors = COLORS;
export const doingsProAccentRotation = ACCENT_ROTATION;
