import { kv } from "@vercel/kv";
import { GeneratedPresentation, Slide } from "./types";

const MAX_PRESENTATIONS_PER_USER = 20;
const PRESENTATION_TTL = 60 * 60 * 24 * 30; // 30 days in seconds

// Strip images from slides before saving to database
function stripImagesForStorage(presentation: GeneratedPresentation): GeneratedPresentation {
  return {
    ...presentation,
    slides: presentation.slides.map((slide) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { image, ...slideWithoutImage } = slide;
      return slideWithoutImage as Slide;
    }),
  };
}

// Get all presentations for a user
export async function getUserPresentations(userId: string): Promise<GeneratedPresentation[]> {
  try {
    const key = `user:${userId}:presentations`;
    const presentationIds = await kv.lrange<string>(key, 0, -1);

    if (!presentationIds || presentationIds.length === 0) {
      return [];
    }

    const presentations = await Promise.all(
      presentationIds.map(async (id) => {
        const presentation = await kv.get<GeneratedPresentation>(`presentation:${id}`);
        return presentation;
      })
    );

    return presentations.filter((p): p is GeneratedPresentation => p !== null);
  } catch (error) {
    console.error("Failed to get user presentations:", error);
    return [];
  }
}

// Save a presentation for a user
export async function saveUserPresentation(
  userId: string,
  presentation: GeneratedPresentation
): Promise<boolean> {
  try {
    const userKey = `user:${userId}:presentations`;
    const presentationKey = `presentation:${presentation.id}`;

    // Strip images before saving
    const presentationToSave = stripImagesForStorage(presentation);

    // Save the presentation data
    await kv.set(presentationKey, presentationToSave, { ex: PRESENTATION_TTL });

    // Remove if already exists in user's list
    await kv.lrem(userKey, 0, presentation.id);

    // Add to beginning of user's list
    await kv.lpush(userKey, presentation.id);

    // Trim to max presentations
    await kv.ltrim(userKey, 0, MAX_PRESENTATIONS_PER_USER - 1);

    // Set TTL on user's list
    await kv.expire(userKey, PRESENTATION_TTL);

    return true;
  } catch (error) {
    console.error("Failed to save presentation:", error);
    return false;
  }
}

// Delete a presentation
export async function deleteUserPresentation(
  userId: string,
  presentationId: string
): Promise<boolean> {
  try {
    const userKey = `user:${userId}:presentations`;
    const presentationKey = `presentation:${presentationId}`;

    // Remove from user's list
    await kv.lrem(userKey, 0, presentationId);

    // Delete the presentation data
    await kv.del(presentationKey);

    return true;
  } catch (error) {
    console.error("Failed to delete presentation:", error);
    return false;
  }
}

// Get a single presentation by ID (for sharing)
export async function getPresentation(presentationId: string): Promise<GeneratedPresentation | null> {
  try {
    const presentation = await kv.get<GeneratedPresentation>(`presentation:${presentationId}`);
    return presentation;
  } catch (error) {
    console.error("Failed to get presentation:", error);
    return null;
  }
}

// Clear all presentations for a user
export async function clearUserPresentations(userId: string): Promise<boolean> {
  try {
    const userKey = `user:${userId}:presentations`;
    const presentationIds = await kv.lrange<string>(userKey, 0, -1);

    if (presentationIds && presentationIds.length > 0) {
      // Delete all presentations
      await Promise.all(
        presentationIds.map((id) => kv.del(`presentation:${id}`))
      );
    }

    // Delete the user's list
    await kv.del(userKey);

    return true;
  } catch (error) {
    console.error("Failed to clear presentations:", error);
    return false;
  }
}
