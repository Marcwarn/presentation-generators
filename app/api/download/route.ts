import { NextRequest, NextResponse } from "next/server";
import { generatePptx } from "@/lib/pptx-generator";
import { generateDoingsProPptx } from "@/lib/doings-pro-generator";
import { GeneratedPresentation, PresentationStyle, PresentationParts, Slide } from "@/lib/types";
import JSZip from "jszip";

interface DownloadRequest {
  presentation: GeneratedPresentation;
  style: PresentationStyle;
  parts?: PresentationParts;
}

// Helper to split slides into parts
function splitSlidesIntoParts(slides: Slide[], parts: number): Slide[][] {
  const result: Slide[][] = [];
  const slidesPerPart = Math.ceil(slides.length / parts);

  for (let i = 0; i < parts; i++) {
    const start = i * slidesPerPart;
    const end = Math.min(start + slidesPerPart, slides.length);
    if (start < slides.length) {
      result.push(slides.slice(start, end));
    }
  }

  return result;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    let body: DownloadRequest;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid request: Could not parse JSON body. The request may be too large." },
        { status: 400 }
      );
    }
    const { presentation, style, parts = 1 } = body;

    if (!presentation || !presentation.slides || presentation.slides.length === 0) {
      return NextResponse.json(
        { error: "No presentation data provided" },
        { status: 400 }
      );
    }

    if (!style || !style.palette) {
      return NextResponse.json(
        { error: "No style configuration provided" },
        { status: 400 }
      );
    }

    console.log(`Generating PPTX: ${presentation.slides.length} slides, palette: ${style.palette}, parts: ${parts}`);

    const safeTitle = presentation.title.replace(/[^a-z0-9]/gi, "_");

    // Single file download
    if (parts === 1) {
      const pptxBuffer = style.palette === "doingsPro"
        ? await generateDoingsProPptx(presentation)
        : await generatePptx(presentation, style);
      const uint8Array = new Uint8Array(pptxBuffer);

      const filename = `${safeTitle}_Keynote.pptx`;

      return new NextResponse(uint8Array, {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Length": pptxBuffer.length.toString(),
        },
      });
    }

    // Multi-part download (ZIP)
    const slideParts = splitSlidesIntoParts(presentation.slides, parts);
    const zip = new JSZip();

    for (let i = 0; i < slideParts.length; i++) {
      const partPresentation: GeneratedPresentation = {
        ...presentation,
        title: `${presentation.title} - Del ${i + 1}`,
        slides: slideParts[i],
      };

      const pptxBuffer = style.palette === "doingsPro"
        ? await generateDoingsProPptx(partPresentation)
        : await generatePptx(partPresentation, style);

      const partFilename = `${safeTitle}_Del_${i + 1}_av_${slideParts.length}.pptx`;
      zip.file(partFilename, pptxBuffer);
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    const zipUint8Array = new Uint8Array(zipBuffer);
    const zipFilename = `${safeTitle}_Keynote_${parts}_delar.zip`;

    return new NextResponse(zipUint8Array, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipFilename}"`,
        "Content-Length": zipUint8Array.length.toString(),
      },
    });
  } catch (error) {
    console.error("Download API error:", error);

    // Provide more detailed error messages
    let errorMessage = "Failed to generate PowerPoint file";
    if (error instanceof Error) {
      errorMessage = error.message;
      // Add stack trace for debugging
      if (error.stack) {
        console.error("Stack trace:", error.stack);
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
