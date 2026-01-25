import { GeneratedPresentation } from "./types";

const STORAGE_KEY = "ted-talk-presentations";
const MAX_PRESENTATIONS = 10;

export function savePresentation(presentation: GeneratedPresentation): void {
  if (typeof window === "undefined") return;

  const presentations = getPresentations();

  // Remove if already exists (to update)
  const filtered = presentations.filter((p) => p.id !== presentation.id);

  // Add to beginning
  filtered.unshift(presentation);

  // Keep only last MAX_PRESENTATIONS
  const trimmed = filtered.slice(0, MAX_PRESENTATIONS);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function getPresentations(): GeneratedPresentation[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function getPresentation(id: string): GeneratedPresentation | null {
  const presentations = getPresentations();
  return presentations.find((p) => p.id === id) || null;
}

export function deletePresentation(id: string): void {
  if (typeof window === "undefined") return;

  const presentations = getPresentations();
  const filtered = presentations.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function clearPresentations(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
