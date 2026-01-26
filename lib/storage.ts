import { GeneratedPresentation } from "./types";

// Client-side storage that syncs with the server API
// Uses in-memory cache for current session, with API calls for persistence

let localCache: GeneratedPresentation[] = [];
let isInitialized = false;

// Initialize cache from server
async function initializeCache(): Promise<void> {
  if (isInitialized) return;

  try {
    const response = await fetch("/api/presentations");
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.presentations) {
        localCache = data.presentations;
      }
    }
  } catch (error) {
    console.error("Failed to load presentations from server:", error);
  }

  isInitialized = true;
}

// Save presentation to server and update local cache
export async function savePresentationAsync(presentation: GeneratedPresentation): Promise<boolean> {
  // Update local cache immediately for fast UI
  localCache = localCache.filter((p) => p.id !== presentation.id);
  localCache.unshift(presentation);

  try {
    const response = await fetch("/api/presentations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ presentation }),
    });

    if (!response.ok) {
      console.error("Failed to save presentation to server");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to save presentation:", error);
    return false;
  }
}

// Synchronous save for backward compatibility (fires and forgets)
export function savePresentation(presentation: GeneratedPresentation): void {
  // Update local cache immediately
  localCache = localCache.filter((p) => p.id !== presentation.id);
  localCache.unshift(presentation);

  // Fire async save to server (don't await)
  savePresentationAsync(presentation).catch((error) => {
    console.error("Background save failed:", error);
  });
}

// Get presentations from cache (sync) - call initializePresentations first
export function getPresentations(): GeneratedPresentation[] {
  return localCache;
}

// Async version that ensures cache is loaded
export async function getPresentationsAsync(): Promise<GeneratedPresentation[]> {
  await initializeCache();
  return localCache;
}

// Get single presentation from cache
export function getPresentation(id: string): GeneratedPresentation | null {
  return localCache.find((p) => p.id === id) || null;
}

// Async version that can fetch from server if not in cache
export async function getPresentationAsync(id: string): Promise<GeneratedPresentation | null> {
  // Check local cache first
  const cached = localCache.find((p) => p.id === id);
  if (cached) return cached;

  // Try to fetch from server (for shared presentations)
  try {
    const response = await fetch(`/api/presentations/${id}`);
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.presentation) {
        return data.presentation;
      }
    }
  } catch (error) {
    console.error("Failed to fetch presentation:", error);
  }

  return null;
}

// Delete presentation from server and cache
export async function deletePresentationAsync(id: string): Promise<boolean> {
  // Update local cache immediately
  localCache = localCache.filter((p) => p.id !== id);

  try {
    const response = await fetch(`/api/presentations/${id}`, {
      method: "DELETE",
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to delete presentation:", error);
    return false;
  }
}

// Synchronous delete for backward compatibility
export function deletePresentation(id: string): void {
  localCache = localCache.filter((p) => p.id !== id);

  deletePresentationAsync(id).catch((error) => {
    console.error("Background delete failed:", error);
  });
}

// Clear all presentations
export async function clearPresentationsAsync(): Promise<boolean> {
  localCache = [];

  try {
    const response = await fetch("/api/presentations", {
      method: "DELETE",
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to clear presentations:", error);
    return false;
  }
}

// Synchronous clear for backward compatibility
export function clearPresentations(): void {
  localCache = [];

  clearPresentationsAsync().catch((error) => {
    console.error("Background clear failed:", error);
  });
}

// Initialize the cache - call this on app startup
export async function initializePresentations(): Promise<void> {
  await initializeCache();
}

// Reset initialization state (useful for testing)
export function resetCache(): void {
  localCache = [];
  isInitialized = false;
}
