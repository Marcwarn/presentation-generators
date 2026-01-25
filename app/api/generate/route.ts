import { NextRequest, NextResponse } from "next/server";
import { generatePresentation } from "@/lib/claude";
import { GenerateRequest, GenerateResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();

    if (!body.input?.content || !body.input?.topic) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: content and topic",
        } as GenerateResponse,
        { status: 400 }
      );
    }

    const presentation = await generatePresentation(body.input);

    return NextResponse.json({
      success: true,
      presentation,
    } as GenerateResponse);
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate presentation",
      } as GenerateResponse,
      { status: 500 }
    );
  }
}
