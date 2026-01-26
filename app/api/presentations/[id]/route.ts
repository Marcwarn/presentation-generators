import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { deleteUserPresentation, getPresentation } from "@/lib/db";

const USER_ID_COOKIE = "keynote-user-id";

// Get user ID from cookies
function getUserId(): string {
  const cookieStore = cookies();
  return cookieStore.get(USER_ID_COOKIE)?.value || uuidv4();
}

// GET - Get a single presentation (for sharing)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const presentation = await getPresentation(params.id);

    if (!presentation) {
      return NextResponse.json(
        { success: false, error: "Presentation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      presentation,
    });
  } catch (error) {
    console.error("Failed to get presentation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load presentation" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific presentation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserId();
    const deleted = await deleteUserPresentation(userId, params.id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Failed to delete presentation" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete presentation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete presentation" },
      { status: 500 }
    );
  }
}
