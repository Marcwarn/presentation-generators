import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { cookies } from "next/headers";
import { Persona } from "@/lib/prompts";

// Helper to get or create user ID
async function getUserId(): Promise<string> {
  const cookieStore = await cookies();
  let userId = cookieStore.get("keynote-user-id")?.value;

  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  return userId;
}

// GET - List all personas for user
export async function GET() {
  try {
    const userId = await getUserId();
    const personasKey = `personas:${userId}`;

    const personas = (await kv.get<Persona[]>(personasKey)) || [];

    return NextResponse.json({
      success: true,
      personas,
    });
  } catch (error) {
    console.error("Failed to get personas:", error);
    return NextResponse.json({
      success: true,
      personas: [],
    });
  }
}

// POST - Create new persona
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    const personasKey = `personas:${userId}`;

    const body = await request.json();
    const { name, customPrompts } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    if (!customPrompts || typeof customPrompts !== "object") {
      return NextResponse.json(
        { success: false, error: "Custom prompts are required" },
        { status: 400 }
      );
    }

    const newPersona: Persona = {
      id: `persona_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: name.trim(),
      createdAt: new Date().toISOString(),
      customPrompts,
    };

    // Get existing personas
    const personas = (await kv.get<Persona[]>(personasKey)) || [];

    // Add new persona at the beginning
    personas.unshift(newPersona);

    // Keep only last 20 personas per user
    const trimmedPersonas = personas.slice(0, 20);

    // Save to KV
    await kv.set(personasKey, trimmedPersonas, { ex: 60 * 60 * 24 * 90 }); // 90 days

    // Set cookie if needed
    const response = NextResponse.json({
      success: true,
      persona: newPersona,
    });

    response.cookies.set("keynote-user-id", userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return response;
  } catch (error) {
    console.error("Failed to create persona:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save persona" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a persona
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId();
    const personasKey = `personas:${userId}`;

    const { searchParams } = new URL(request.url);
    const personaId = searchParams.get("id");

    if (!personaId) {
      return NextResponse.json(
        { success: false, error: "Persona ID is required" },
        { status: 400 }
      );
    }

    // Get existing personas
    const personas = (await kv.get<Persona[]>(personasKey)) || [];

    // Filter out the deleted persona
    const updatedPersonas = personas.filter((p) => p.id !== personaId);

    // Save to KV
    await kv.set(personasKey, updatedPersonas, { ex: 60 * 60 * 24 * 90 }); // 90 days

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Failed to delete persona:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete persona" },
      { status: 500 }
    );
  }
}
