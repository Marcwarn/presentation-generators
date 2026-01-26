import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import {
  getUserPresentations,
  saveUserPresentation,
  clearUserPresentations,
} from "@/lib/db";
import { GeneratedPresentation } from "@/lib/types";

const USER_ID_COOKIE = "keynote-user-id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

// Get or create user ID from cookies
function getUserId(): string {
  const cookieStore = cookies();
  let userId = cookieStore.get(USER_ID_COOKIE)?.value;

  if (!userId) {
    userId = uuidv4();
  }

  return userId;
}

// GET - Get all presentations for user
export async function GET() {
  try {
    const userId = getUserId();
    const presentations = await getUserPresentations(userId);

    const response = NextResponse.json({
      success: true,
      presentations,
      userId,
    });

    // Set/refresh the user ID cookie
    response.cookies.set(USER_ID_COOKIE, userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error("Failed to get presentations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load presentations" },
      { status: 500 }
    );
  }
}

// POST - Save a presentation
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId();
    const body = await request.json();
    const presentation: GeneratedPresentation = body.presentation;

    if (!presentation || !presentation.id) {
      return NextResponse.json(
        { success: false, error: "Invalid presentation data" },
        { status: 400 }
      );
    }

    const saved = await saveUserPresentation(userId, presentation);

    if (!saved) {
      return NextResponse.json(
        { success: false, error: "Failed to save presentation" },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      success: true,
      presentationId: presentation.id,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || ""}/share/${presentation.id}`,
    });

    // Set/refresh the user ID cookie
    response.cookies.set(USER_ID_COOKIE, userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error("Failed to save presentation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save presentation" },
      { status: 500 }
    );
  }
}

// DELETE - Clear all presentations for user
export async function DELETE() {
  try {
    const userId = getUserId();
    await clearUserPresentations(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to clear presentations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear presentations" },
      { status: 500 }
    );
  }
}
