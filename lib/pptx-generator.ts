import PptxGenJS from "pptxgenjs";
import { GeneratedPresentation, PresentationStyle, Slide } from "./types";
import { palettes, getHexColor } from "./palettes";

// Font mappings for different styles
const fontMappings = {
  modern: { title: "Arial", body: "Arial" },
  classic: { title: "Georgia", body: "Georgia" },
  tech: { title: "Consolas", body: "Consolas" },
};

export async function generatePptx(
  presentation: GeneratedPresentation,
  style: PresentationStyle
): Promise<Buffer> {
  const pptx = new PptxGenJS();
  const palette = palettes[style.palette];
  const fonts = fontMappings[style.fontStyle];

  // Set presentation properties
  pptx.author = "TED Talk Generator";
  pptx.title = presentation.title;
  pptx.subject = "TED Talk Presentation";
  pptx.company = "Generated with AI";

  // Define master slide
  pptx.defineSlideMaster({
    title: "TED_MASTER",
    background:
      style.backgroundStyle === "light"
        ? { color: "FFFFFF" }
        : style.backgroundStyle === "gradient"
        ? { color: palette.darkBg }
        : { color: palette.darkBg },
  });

  // Generate each slide
  for (const slide of presentation.slides) {
    addSlide(pptx, slide, palette, fonts, style);
  }

  // Generate buffer
  const data = await pptx.write({ outputType: "nodebuffer" });
  return data as Buffer;
}

function addSlide(
  pptx: PptxGenJS,
  slide: Slide,
  palette: typeof palettes.doings,
  fonts: { title: string; body: string },
  style: PresentationStyle
) {
  const pptxSlide = pptx.addSlide({ masterName: "TED_MASTER" });

  // Set background
  if (style.backgroundStyle === "gradient") {
    pptxSlide.background = {
      color: palette.darkBg,
    };
  } else if (style.backgroundStyle === "light") {
    pptxSlide.background = { color: "FFFFFF" };
  } else {
    pptxSlide.background = { color: palette.darkBg };
  }

  const textColor = style.backgroundStyle === "light" ? "1a1a2e" : palette.textLight;
  const mutedColor = style.backgroundStyle === "light" ? "666666" : palette.textMuted;

  // Add speaker notes
  if (slide.speakerNotes) {
    pptxSlide.addNotes(slide.speakerNotes);
  }

  // Add slide type indicator
  pptxSlide.addText(slide.type.toUpperCase(), {
    x: 0.5,
    y: 0.3,
    w: 2,
    h: 0.3,
    fontSize: 10,
    color: palette.accent,
    fontFace: fonts.body,
    bold: true,
  });

  switch (slide.type) {
    case "statement":
      addStatementSlide(pptxSlide, slide, palette, fonts, textColor, mutedColor);
      break;
    case "story":
      addStorySlide(pptxSlide, slide, palette, fonts, textColor);
      break;
    case "list":
      addListSlide(pptxSlide, slide, palette, fonts, textColor, mutedColor);
      break;
    case "comparison":
      addComparisonSlide(pptxSlide, slide, palette, fonts, textColor, mutedColor);
      break;
    case "timeline":
      addTimelineSlide(pptxSlide, slide, palette, fonts, textColor);
      break;
    case "cta":
      addCtaSlide(pptxSlide, slide, palette, fonts, textColor);
      break;
  }
}

function addStatementSlide(
  slide: PptxGenJS.Slide,
  data: Slide,
  palette: typeof palettes.doings,
  fonts: { title: string; body: string },
  textColor: string,
  mutedColor: string
) {
  // Large centered title
  slide.addText(data.title, {
    x: 0.5,
    y: 2,
    w: 9,
    h: 1.5,
    fontSize: 48,
    color: palette.primary,
    fontFace: fonts.title,
    bold: true,
    align: "center",
    valign: "middle",
  });

  // Subtitle
  if (data.subtitle) {
    slide.addText(data.subtitle, {
      x: 0.5,
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
}

function addStorySlide(
  slide: PptxGenJS.Slide,
  data: Slide,
  palette: typeof palettes.doings,
  fonts: { title: string; body: string },
  textColor: string
) {
  // Opening quote mark
  slide.addText('"', {
    x: 0.5,
    y: 1.2,
    w: 1,
    h: 1,
    fontSize: 72,
    color: palette.accent,
    fontFace: fonts.title,
    bold: true,
  });

  // Quote text
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

  // Attribution
  if (data.attribution) {
    slide.addText(data.attribution, {
      x: 1,
      y: 4,
      w: 8,
      h: 0.5,
      fontSize: 18,
      color: palette.secondary,
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
  mutedColor: string
) {
  // Title
  slide.addText(data.title, {
    x: 0.5,
    y: 0.8,
    w: 9,
    h: 0.8,
    fontSize: 36,
    color: palette.primary,
    fontFace: fonts.title,
    bold: true,
  });

  // List items
  if (data.content && data.content.length > 0) {
    const listItems = data.content.map((item) => ({
      text: item,
      options: {
        bullet: { type: "bullet" as const, color: palette.accent },
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
  mutedColor: string
) {
  // Title
  slide.addText(data.title, {
    x: 0.5,
    y: 0.8,
    w: 9,
    h: 0.8,
    fontSize: 36,
    color: palette.primary,
    fontFace: fonts.title,
    bold: true,
    align: "center",
  });

  // Left column
  const leftTitle = data.leftColumn?.title || "Before";
  slide.addText(leftTitle, {
    x: 0.5,
    y: 1.8,
    w: 4.25,
    h: 0.5,
    fontSize: 24,
    color: palette.secondary,
    fontFace: fonts.title,
    bold: true,
  });

  if (data.leftColumn?.items) {
    const leftItems = data.leftColumn.items.map((item) => ({
      text: item,
      options: {
        bullet: { type: "bullet" as const, color: palette.secondary },
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

  // Right column
  const rightTitle = data.rightColumn?.title || "After";
  slide.addText(rightTitle, {
    x: 5.25,
    y: 1.8,
    w: 4.25,
    h: 0.5,
    fontSize: 24,
    color: palette.contrast,
    fontFace: fonts.title,
    bold: true,
  });

  if (data.rightColumn?.items) {
    const rightItems = data.rightColumn.items.map((item) => ({
      text: item,
      options: {
        bullet: { type: "bullet" as const, color: palette.contrast },
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

  // Divider line
  slide.addShape("rect", {
    x: 4.875,
    y: 1.8,
    w: 0.02,
    h: 3,
    fill: { color: mutedColor },
  });
}

function addTimelineSlide(
  slide: PptxGenJS.Slide,
  data: Slide,
  palette: typeof palettes.doings,
  fonts: { title: string; body: string },
  textColor: string
) {
  // Title
  slide.addText(data.title, {
    x: 0.5,
    y: 0.8,
    w: 9,
    h: 0.8,
    fontSize: 36,
    color: palette.primary,
    fontFace: fonts.title,
    bold: true,
    align: "center",
  });

  if (data.steps && data.steps.length > 0) {
    const stepCount = Math.min(data.steps.length, 5);
    const stepWidth = 8.5 / stepCount;
    const startX = 0.75;

    // Draw connecting line
    slide.addShape("rect", {
      x: startX + 0.4,
      y: 2.4,
      w: stepWidth * (stepCount - 1) + 0.2,
      h: 0.05,
      fill: { color: palette.accent },
    });

    // Draw steps
    data.steps.slice(0, 5).forEach((step, index) => {
      const x = startX + index * stepWidth;

      // Circle
      slide.addShape("ellipse", {
        x: x + stepWidth / 2 - 0.35,
        y: 2.1,
        w: 0.7,
        h: 0.7,
        fill: { color: palette.accent },
      });

      // Step number
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

      // Step title
      slide.addText(step.title, {
        x: x,
        y: 3,
        w: stepWidth,
        h: 0.6,
        fontSize: 14,
        color: textColor,
        fontFace: fonts.title,
        bold: true,
        align: "center",
        valign: "top",
      });

      // Step description
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
  textColor: string
) {
  // Large title
  slide.addText(data.title, {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 1.2,
    fontSize: 48,
    color: palette.primary,
    fontFace: fonts.title,
    bold: true,
    align: "center",
    valign: "middle",
  });

  // Subtitle
  if (data.subtitle) {
    slide.addText(data.subtitle, {
      x: 0.5,
      y: 2.8,
      w: 9,
      h: 0.8,
      fontSize: 24,
      color: textColor,
      fontFace: fonts.body,
      align: "center",
    });
  }

  // CTA button shape
  slide.addShape("roundRect", {
    x: 3.5,
    y: 3.8,
    w: 3,
    h: 0.7,
    fill: { color: palette.accent },
    rectRadius: 0.35,
  });

  slide.addText("Take Action →", {
    x: 3.5,
    y: 3.8,
    w: 3,
    h: 0.7,
    fontSize: 18,
    color: "FFFFFF",
    fontFace: fonts.title,
    bold: true,
    align: "center",
    valign: "middle",
  });
}
