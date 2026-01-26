import PptxGenJS from "pptxgenjs";
import { GeneratedPresentation, PresentationStyle, Slide } from "./types";
import { palettes, getHexColor, Palette, CustomColors } from "./palettes";

const fontMappings = {
  modern: { title: "Arial", body: "Arial" },
  classic: { title: "Georgia", body: "Georgia" },
  tech: { title: "Consolas", body: "Consolas" },
};

// Helper to get effective palette from custom colors or predefined
function getEffectivePalette(style: PresentationStyle): Palette {
  if (style.palette === "custom" && style.customColors) {
    // Convert custom colors to palette format
    return {
      name: "Custom",
      darkBg: style.customColors.color3.replace("#", ""),
      navyBg: style.customColors.color4.replace("#", ""),
      primary: style.customColors.color1.replace("#", ""),
      secondary: style.customColors.color2.replace("#", ""),
      accent: style.customColors.color1.replace("#", ""), // Use primary as accent
      contrast: style.customColors.color2.replace("#", ""),
      textLight: style.customColors.color5.replace("#", ""),
      textMuted: style.customColors.color5.replace("#", "") + "99", // Slightly transparent
    };
  }
  return palettes[style.palette];
}

// Dynamic background variations - inspired by Doings PPTX
interface DynamicSlideStyle {
  backgroundColor: string;
  accentColor: string;
  showAccentLine: boolean;
  accentLinePosition: "top" | "bottom" | "left" | "none";
  showBox: boolean;
  boxColor: string;
  boxOpacity: number;
}

function getDynamicSlideStyle(
  slideIndex: number,
  slideType: string,
  palette: Palette
): DynamicSlideStyle {
  // Create variety of background colors based on palette
  const backgrounds = [
    palette.darkBg,
    palette.navyBg,
    // Slightly lighter variants for variation
    adjustColor(palette.darkBg, 15),
    adjustColor(palette.navyBg, 10),
  ];

  // Accent colors cycle through
  const accents = [
    palette.primary,
    palette.secondary,
    palette.accent,
    palette.contrast || palette.primary,
  ];

  // Determine style based on slide index and type
  const bgIndex = slideIndex % backgrounds.length;
  const accentIndex = slideIndex % accents.length;

  // Vary accent line position
  const linePositions: ("top" | "bottom" | "left" | "none")[] = ["top", "left", "bottom", "none", "top", "left"];
  const linePosition = linePositions[slideIndex % linePositions.length];

  // Show boxes on certain slide types and indices
  const showBox = ["list", "comparison", "timeline"].includes(slideType) || slideIndex % 3 === 0;

  return {
    backgroundColor: backgrounds[bgIndex],
    accentColor: accents[accentIndex],
    showAccentLine: slideIndex > 0 && linePosition !== "none",
    accentLinePosition: linePosition,
    showBox,
    boxColor: accents[(accentIndex + 1) % accents.length],
    boxOpacity: 15 + (slideIndex % 3) * 5, // 15-25% opacity
  };
}

// Adjust color brightness (positive = lighter, negative = darker)
function adjustColor(hexColor: string, amount: number): string {
  const hex = hexColor.replace("#", "");
  const r = Math.min(255, Math.max(0, parseInt(hex.slice(0, 2), 16) + amount));
  const g = Math.min(255, Math.max(0, parseInt(hex.slice(2, 4), 16) + amount));
  const b = Math.min(255, Math.max(0, parseInt(hex.slice(4, 6), 16) + amount));
  return r.toString(16).padStart(2, "0") +
         g.toString(16).padStart(2, "0") +
         b.toString(16).padStart(2, "0");
}

// Add decorative accent lines to a slide
function addDynamicAccents(
  pptxSlide: PptxGenJS.Slide,
  dynamicStyle: DynamicSlideStyle,
  _palette: Palette
) {
  if (!dynamicStyle.showAccentLine) return;

  const lineColor = dynamicStyle.accentColor;

  switch (dynamicStyle.accentLinePosition) {
    case "top":
      pptxSlide.addShape("rect", {
        x: 0,
        y: 0,
        w: "100%",
        h: 0.08,
        fill: { color: lineColor },
      });
      break;
    case "bottom":
      pptxSlide.addShape("rect", {
        x: 0,
        y: 5.55,
        w: "100%",
        h: 0.08,
        fill: { color: lineColor },
      });
      break;
    case "left":
      pptxSlide.addShape("rect", {
        x: 0,
        y: 0,
        w: 0.12,
        h: "100%",
        fill: { color: lineColor },
      });
      break;
  }
}

// Add decorative colored box/container to a slide
function addDynamicBox(
  pptxSlide: PptxGenJS.Slide,
  dynamicStyle: DynamicSlideStyle,
  x: number,
  y: number,
  w: number,
  h: number
) {
  if (!dynamicStyle.showBox) return;

  pptxSlide.addShape("roundRect", {
    x,
    y,
    w,
    h,
    fill: { color: dynamicStyle.boxColor, transparency: 100 - dynamicStyle.boxOpacity },
    rectRadius: 0.1,
  });
}

export async function generatePptx(
  presentation: GeneratedPresentation,
  style: PresentationStyle
): Promise<Buffer> {
  const pptx = new PptxGenJS();
  const palette = getEffectivePalette(style);
  const fonts = fontMappings[style.fontStyle];

  pptx.author = "Keynote Builder";
  pptx.title = presentation.title;
  pptx.subject = "Keynote Presentation";
  pptx.company = "Generated with AI";

  pptx.defineSlideMaster({
    title: "TED_MASTER",
    background:
      style.backgroundStyle === "light"
        ? { color: "FFFFFF" }
        : { color: palette.darkBg },
  });

  for (let i = 0; i < presentation.slides.length; i++) {
    const slide = presentation.slides[i];
    addSlide(pptx, slide, palette, fonts, style, i);
  }

  const data = await pptx.write({ outputType: "nodebuffer" });
  return data as Buffer;
}

function addSlide(
  pptx: PptxGenJS,
  slide: Slide,
  palette: typeof palettes.doings,
  fonts: { title: string; body: string },
  style: PresentationStyle,
  slideIndex: number = 0
) {
  const pptxSlide = pptx.addSlide({ masterName: "TED_MASTER" });

  // Get dynamic style for this slide (used in "dynamic" mode)
  const dynamicStyle = getDynamicSlideStyle(slideIndex, slide.type, palette);

  // Set background based on style mode
  if (style.backgroundStyle === "dynamic") {
    // Dynamic mode: varied backgrounds per slide
    pptxSlide.background = { color: dynamicStyle.backgroundColor };
  } else if (style.backgroundStyle === "gradient") {
    pptxSlide.background = { color: palette.darkBg };
  } else if (style.backgroundStyle === "light") {
    pptxSlide.background = { color: "FFFFFF" };
  } else {
    pptxSlide.background = { color: palette.darkBg };
  }

  // Add dynamic accents (decorative lines) in dynamic mode
  if (style.backgroundStyle === "dynamic") {
    addDynamicAccents(pptxSlide, dynamicStyle, palette);
  }

  const isLightBg = style.backgroundStyle === "light" || style.palette === "minimal";
  const textColor = isLightBg ? "1a1a1a" : palette.textLight;
  const mutedColor = isLightBg ? "666666" : palette.textMuted;

  // In dynamic mode, vary the accent color per slide
  const slideAccent = style.backgroundStyle === "dynamic" ? dynamicStyle.accentColor : palette.accent;

  // Add background image if present
  if (slide.image) {
    pptxSlide.addImage({
      data: slide.image,
      x: 5,
      y: 0,
      w: 5,
      h: 5.63,
      sizing: { type: "cover", w: 5, h: 5.63 }
    });
    // Add gradient overlay for text readability
    const overlayColor = isLightBg ? "FFFFFF" : palette.darkBg;
    pptxSlide.addShape("rect", {
      x: 5,
      y: 0,
      w: 5,
      h: 5.63,
      fill: { type: "solid", color: overlayColor, transparency: 50 }
    });
  }

  if (slide.speakerNotes) {
    pptxSlide.addNotes(slide.speakerNotes);
  }

  // Slide type label with dynamic accent color
  const labelXOffset = style.backgroundStyle === "dynamic" && dynamicStyle.accentLinePosition === "left" ? 0.7 : 0.5;
  pptxSlide.addText(slide.type.toUpperCase(), {
    x: labelXOffset,
    y: 0.3,
    w: 2,
    h: 0.3,
    fontSize: 10,
    color: slideAccent,
    fontFace: fonts.body,
    bold: true,
  });

  // Add slide number badge in dynamic mode
  if (style.backgroundStyle === "dynamic" && slideIndex > 0) {
    pptxSlide.addShape("ellipse", {
      x: 9.2,
      y: 0.2,
      w: 0.5,
      h: 0.5,
      fill: { color: slideAccent },
    });
    pptxSlide.addText((slideIndex + 1).toString(), {
      x: 9.2,
      y: 0.2,
      w: 0.5,
      h: 0.5,
      fontSize: 14,
      color: "FFFFFF",
      fontFace: fonts.body,
      bold: true,
      align: "center",
      valign: "middle",
    });
  }

  switch (slide.type) {
    case "statement":
      addStatementSlide(pptxSlide, slide, palette, fonts, textColor, mutedColor, style, dynamicStyle, slideIndex);
      break;
    case "story":
      addStorySlide(pptxSlide, slide, palette, fonts, textColor, style, dynamicStyle);
      break;
    case "list":
      addListSlide(pptxSlide, slide, palette, fonts, textColor, style, dynamicStyle);
      break;
    case "comparison":
      addComparisonSlide(pptxSlide, slide, palette, fonts, textColor, mutedColor, style, dynamicStyle);
      break;
    case "timeline":
      addTimelineSlide(pptxSlide, slide, palette, fonts, textColor, style, dynamicStyle);
      break;
    case "cta":
      addCtaSlide(pptxSlide, slide, palette, fonts, textColor, style, dynamicStyle);
      break;
  }
}

function addStatementSlide(
  slide: PptxGenJS.Slide,
  data: Slide,
  palette: typeof palettes.doings,
  fonts: { title: string; body: string },
  textColor: string,
  mutedColor: string,
  style?: PresentationStyle,
  dynamicStyle?: DynamicSlideStyle,
  slideIndex?: number
) {
  const isDynamic = style?.backgroundStyle === "dynamic" && dynamicStyle;
  const xOffset = isDynamic && dynamicStyle.accentLinePosition === "left" ? 0.7 : 0.5;
  const titleColor = isDynamic ? dynamicStyle.accentColor : palette.primary;

  // Add decorative box in dynamic mode for title slides
  if (isDynamic && slideIndex && slideIndex % 4 === 0) {
    addDynamicBox(slide, dynamicStyle, 0.3, 1.8, 9.4, 2.2);
  }

  slide.addText(data.title, {
    x: xOffset,
    y: 2,
    w: 9,
    h: 1.5,
    fontSize: 48,
    color: titleColor,
    fontFace: fonts.title,
    bold: true,
    align: "center",
    valign: "middle",
  });

  if (data.subtitle) {
    slide.addText(data.subtitle, {
      x: xOffset,
      y: 3.5,
      w: 9,
      h: 0.8,
      fontSize: 24,
      color: mutedColor,
      fontFace: fonts.body,
      align: "center",
      valign: "top",
    });
  }

  // Add decorative accent at bottom in dynamic mode
  if (isDynamic && slideIndex && slideIndex % 3 === 1) {
    const secondaryAccent = palette.secondary;
    slide.addShape("rect", {
      x: 3,
      y: 4.8,
      w: 4,
      h: 0.05,
      fill: { color: secondaryAccent },
    });
  }
}

function addStorySlide(
  slide: PptxGenJS.Slide,
  data: Slide,
  palette: typeof palettes.doings,
  fonts: { title: string; body: string },
  textColor: string,
  style?: PresentationStyle,
  dynamicStyle?: DynamicSlideStyle
) {
  const isDynamic = style?.backgroundStyle === "dynamic" && dynamicStyle;
  const xOffset = isDynamic && dynamicStyle.accentLinePosition === "left" ? 0.7 : 0.5;
  const quoteAccent = isDynamic ? dynamicStyle.accentColor : palette.accent;

  // Add quote box background in dynamic mode
  if (isDynamic) {
    slide.addShape("roundRect", {
      x: 0.8,
      y: 1.5,
      w: 8.4,
      h: 2.8,
      fill: { color: dynamicStyle.boxColor, transparency: 85 },
      line: { color: quoteAccent, width: 2 },
      rectRadius: 0.15,
    });
  }

  slide.addText('"', {
    x: xOffset,
    y: 1.2,
    w: 1,
    h: 1,
    fontSize: 72,
    color: quoteAccent,
    fontFace: fonts.title,
    bold: true,
  });

  const quoteText = data.quote || data.title;
  slide.addText(quoteText, {
    x: 1,
    y: 1.8,
    w: 8,
    h: 2,
    fontSize: 28,
    color: textColor,
    fontFace: fonts.body,
    italic: true,
    align: "center",
    valign: "middle",
  });

  if (data.attribution) {
    const attrColor = isDynamic ? dynamicStyle.boxColor : palette.secondary;
    slide.addText(data.attribution, {
      x: 1,
      y: 4,
      w: 8,
      h: 0.5,
      fontSize: 18,
      color: attrColor,
      fontFace: fonts.body,
      align: "center",
    });
  }
}

function addListSlide(
  slide: PptxGenJS.Slide,
  data: Slide,
  palette: typeof palettes.doings,
  fonts: { title: string; body: string },
  textColor: string,
  style?: PresentationStyle,
  dynamicStyle?: DynamicSlideStyle
) {
  const isDynamic = style?.backgroundStyle === "dynamic" && dynamicStyle;
  const xOffset = isDynamic && dynamicStyle.accentLinePosition === "left" ? 0.7 : 0.5;
  const titleColor = isDynamic ? dynamicStyle.accentColor : palette.primary;
  const bulletColor = isDynamic ? dynamicStyle.boxColor : palette.accent;

  // Add subtle background box for list content in dynamic mode
  if (isDynamic) {
    slide.addShape("roundRect", {
      x: 0.5,
      y: 1.6,
      w: 9,
      h: 3.8,
      fill: { color: dynamicStyle.backgroundColor, transparency: 50 },
      line: { color: bulletColor, width: 1 },
      rectRadius: 0.1,
    });
  }

  slide.addText(data.title, {
    x: xOffset,
    y: 0.8,
    w: 9,
    h: 0.8,
    fontSize: 36,
    color: titleColor,
    fontFace: fonts.title,
    bold: true,
  });

  if (data.content && data.content.length > 0) {
    const listItems = data.content.map((item, idx) => ({
      text: item,
      options: {
        bullet: { type: "bullet" as const, color: isDynamic ? [bulletColor, dynamicStyle.accentColor][idx % 2] : palette.accent },
        color: textColor,
        fontSize: 20,
        fontFace: fonts.body,
        paraSpaceAfter: 12,
      },
    }));

    slide.addText(listItems, {
      x: 0.8,
      y: 1.8,
      w: 8.4,
      h: 3.5,
      valign: "top",
    });
  }
}

function addComparisonSlide(
  slide: PptxGenJS.Slide,
  data: Slide,
  palette: typeof palettes.doings,
  fonts: { title: string; body: string },
  textColor: string,
  mutedColor: string,
  style?: PresentationStyle,
  dynamicStyle?: DynamicSlideStyle
) {
  const isDynamic = style?.backgroundStyle === "dynamic" && dynamicStyle;
  const xOffset = isDynamic && dynamicStyle.accentLinePosition === "left" ? 0.7 : 0.5;
  const titleColor = isDynamic ? dynamicStyle.accentColor : palette.primary;
  const leftColor = isDynamic ? dynamicStyle.boxColor : palette.secondary;
  const rightColor = isDynamic ? dynamicStyle.accentColor : palette.contrast;

  // Add colored boxes for each column in dynamic mode
  if (isDynamic) {
    // Left column box
    slide.addShape("roundRect", {
      x: 0.3,
      y: 1.6,
      w: 4.4,
      h: 3.4,
      fill: { color: leftColor, transparency: 90 },
      line: { color: leftColor, width: 2 },
      rectRadius: 0.1,
    });
    // Right column box
    slide.addShape("roundRect", {
      x: 5.1,
      y: 1.6,
      w: 4.4,
      h: 3.4,
      fill: { color: rightColor, transparency: 90 },
      line: { color: rightColor, width: 2 },
      rectRadius: 0.1,
    });
  }

  slide.addText(data.title, {
    x: xOffset,
    y: 0.8,
    w: 9,
    h: 0.8,
    fontSize: 36,
    color: titleColor,
    fontFace: fonts.title,
    bold: true,
    align: "center",
  });

  const leftTitle = data.leftColumn?.title || "Before";
  slide.addText(leftTitle, {
    x: 0.5,
    y: 1.8,
    w: 4.25,
    h: 0.5,
    fontSize: 24,
    color: leftColor,
    fontFace: fonts.title,
    bold: true,
  });

  if (data.leftColumn?.items) {
    const leftItems = data.leftColumn.items.map((item) => ({
      text: item,
      options: {
        bullet: { type: "bullet" as const, color: leftColor },
        color: textColor,
        fontSize: 16,
        fontFace: fonts.body,
        paraSpaceAfter: 8,
      },
    }));

    slide.addText(leftItems, {
      x: 0.5,
      y: 2.4,
      w: 4.25,
      h: 2.5,
      valign: "top",
    });
  }

  const rightTitle = data.rightColumn?.title || "After";
  slide.addText(rightTitle, {
    x: 5.25,
    y: 1.8,
    w: 4.25,
    h: 0.5,
    fontSize: 24,
    color: rightColor,
    fontFace: fonts.title,
    bold: true,
  });

  if (data.rightColumn?.items) {
    const rightItems = data.rightColumn.items.map((item) => ({
      text: item,
      options: {
        bullet: { type: "bullet" as const, color: rightColor },
        color: textColor,
        fontSize: 16,
        fontFace: fonts.body,
        paraSpaceAfter: 8,
      },
    }));

    slide.addText(rightItems, {
      x: 5.25,
      y: 2.4,
      w: 4.25,
      h: 2.5,
      valign: "top",
    });
  }

  // Divider line with dynamic accent
  const dividerColor = isDynamic ? dynamicStyle.accentColor : mutedColor;
  slide.addShape("rect", {
    x: 4.875,
    y: 1.8,
    w: isDynamic ? 0.05 : 0.02,
    h: 3,
    fill: { color: dividerColor },
  });
}

function addTimelineSlide(
  slide: PptxGenJS.Slide,
  data: Slide,
  palette: typeof palettes.doings,
  fonts: { title: string; body: string },
  textColor: string,
  style?: PresentationStyle,
  dynamicStyle?: DynamicSlideStyle
) {
  const isDynamic = style?.backgroundStyle === "dynamic" && dynamicStyle;
  const xOffset = isDynamic && dynamicStyle.accentLinePosition === "left" ? 0.7 : 0.5;
  const titleColor = isDynamic ? dynamicStyle.accentColor : palette.primary;
  const lineColor = isDynamic ? dynamicStyle.boxColor : palette.accent;

  slide.addText(data.title, {
    x: xOffset,
    y: 0.8,
    w: 9,
    h: 0.8,
    fontSize: 36,
    color: titleColor,
    fontFace: fonts.title,
    bold: true,
    align: "center",
  });

  if (data.steps && data.steps.length > 0) {
    const stepCount = Math.min(data.steps.length, 5);
    const stepWidth = 8.5 / stepCount;
    const startX = 0.75;

    // Timeline connector line
    slide.addShape("rect", {
      x: startX + 0.4,
      y: 2.4,
      w: stepWidth * (stepCount - 1) + 0.2,
      h: isDynamic ? 0.08 : 0.05,
      fill: { color: lineColor },
    });

    data.steps.slice(0, 5).forEach((step, index) => {
      const x = startX + index * stepWidth;
      // Alternate colors in dynamic mode
      const stepColor = isDynamic
        ? [dynamicStyle.accentColor, dynamicStyle.boxColor, palette.secondary, palette.primary][index % 4]
        : palette.accent;

      slide.addShape("ellipse", {
        x: x + stepWidth / 2 - 0.35,
        y: 2.1,
        w: 0.7,
        h: 0.7,
        fill: { color: stepColor },
      });

      slide.addText((index + 1).toString(), {
        x: x + stepWidth / 2 - 0.35,
        y: 2.1,
        w: 0.7,
        h: 0.7,
        fontSize: 20,
        color: "FFFFFF",
        fontFace: fonts.title,
        bold: true,
        align: "center",
        valign: "middle",
      });

      slide.addText(step.title, {
        x: x,
        y: 3,
        w: stepWidth,
        h: 0.6,
        fontSize: 14,
        color: isDynamic ? stepColor : textColor,
        fontFace: fonts.title,
        bold: true,
        align: "center",
        valign: "top",
      });

      if (step.description) {
        slide.addText(step.description, {
          x: x,
          y: 3.6,
          w: stepWidth,
          h: 1,
          fontSize: 11,
          color: palette.textMuted,
          fontFace: fonts.body,
          align: "center",
          valign: "top",
        });
      }
    });
  }
}

function addCtaSlide(
  slide: PptxGenJS.Slide,
  data: Slide,
  palette: typeof palettes.doings,
  fonts: { title: string; body: string },
  textColor: string,
  style?: PresentationStyle,
  dynamicStyle?: DynamicSlideStyle
) {
  const isDynamic = style?.backgroundStyle === "dynamic" && dynamicStyle;
  const xOffset = isDynamic && dynamicStyle.accentLinePosition === "left" ? 0.7 : 0.5;
  const titleColor = isDynamic ? dynamicStyle.accentColor : palette.primary;
  const buttonColor = isDynamic ? dynamicStyle.boxColor : palette.accent;

  // Add dramatic accent lines in dynamic mode for CTA
  if (isDynamic) {
    // Top accent bar
    slide.addShape("rect", {
      x: 2,
      y: 0.8,
      w: 6,
      h: 0.1,
      fill: { color: dynamicStyle.accentColor },
    });
    // Decorative corner elements
    slide.addShape("rect", {
      x: 0.3,
      y: 0.5,
      w: 1,
      h: 0.05,
      fill: { color: dynamicStyle.boxColor },
    });
    slide.addShape("rect", {
      x: 8.7,
      y: 0.5,
      w: 1,
      h: 0.05,
      fill: { color: dynamicStyle.boxColor },
    });
  }

  slide.addText(data.title, {
    x: xOffset,
    y: 1.5,
    w: 9,
    h: 1.2,
    fontSize: 48,
    color: titleColor,
    fontFace: fonts.title,
    bold: true,
    align: "center",
    valign: "middle",
  });

  if (data.subtitle) {
    slide.addText(data.subtitle, {
      x: xOffset,
      y: 2.8,
      w: 9,
      h: 0.8,
      fontSize: 24,
      color: textColor,
      fontFace: fonts.body,
      align: "center",
    });
  }

  slide.addShape("roundRect", {
    x: 3.5,
    y: 3.8,
    w: 3,
    h: 0.7,
    fill: { color: buttonColor },
    rectRadius: 0.35,
  });

  slide.addText("→", {
    x: 3.5,
    y: 3.8,
    w: 3,
    h: 0.7,
    fontSize: 24,
    color: "FFFFFF",
    fontFace: fonts.title,
    bold: true,
    align: "center",
    valign: "middle",
  });

  // Bottom decorative elements in dynamic mode
  if (isDynamic) {
    slide.addShape("rect", {
      x: 3,
      y: 5,
      w: 1.5,
      h: 0.04,
      fill: { color: palette.secondary },
    });
    slide.addShape("rect", {
      x: 5.5,
      y: 5,
      w: 1.5,
      h: 0.04,
      fill: { color: dynamicStyle.accentColor },
    });
  }
}

// Client-side download function for browser use
export async function downloadPresentation(
  presentation: GeneratedPresentation
): Promise<void> {
  const pptx = new PptxGenJS();
  const style = presentation.style;
  const palette = getEffectivePalette(style);
  const fonts = fontMappings[style.fontStyle];

  pptx.author = "Keynote Builder";
  pptx.title = presentation.title;
  pptx.subject = "Presentation";
  pptx.company = "Generated with AI";

  pptx.defineSlideMaster({
    title: "TED_MASTER",
    background:
      style.backgroundStyle === "light"
        ? { color: "FFFFFF" }
        : { color: palette.darkBg },
  });

  for (let i = 0; i < presentation.slides.length; i++) {
    const slide = presentation.slides[i];
    addSlide(pptx, slide, palette, fonts, style, i);
  }

  // Generate filename from title
  const filename = presentation.title
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 50);

  await pptx.writeFile({ fileName: `${filename}.pptx` });
}
