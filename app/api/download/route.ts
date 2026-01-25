import { NextRequest, NextResponse } from "next/server";
import { generatePptx } from "@/lib/pptx-generator";
import { generateDoingsProPptx } from "@/lib/doings-pro-generator";
import { GeneratedPresentation, PresentationStyle } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { presentation, style } = body as {
      presentation: GeneratedPresentation;
      style: PresentationStyle;
    };

    if (!presentation || !presentation.slides || presentation.slides.length === 0) {
      return NextResponse.json(
        { error: "No presentation data provided" },
        { status: 400 }
      );
    }

    // Use Doings Pro generator for the doingsPro palette
    const pptxBuffer = style.palette === "doingsPro"
      ? await generateDoingsProPptx(presentation)
      : await generatePptx(presentation, style);
    const uint8Array = new Uint8Array(pptxBuffer);

    const filename = `${presentation.title.replace(/[^a-z0-9]/gi, "_")}_TED_Talk.pptx`;

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pptxBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Download API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate PowerPoint file",
      },
      { status: 500 }
    );
  }
}
