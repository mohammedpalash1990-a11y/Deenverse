import { NextResponse } from "next/server";
import { apiError, createRequestId } from "@/lib/api-mock-store";

const ALLOWED_CATEGORIES = new Set(["bug", "audio", "quran", "hadith_dua", "feature", "suggestion"]);
const ALLOWED_FIELDS = new Set([
  "category",
  "description",
  "stepsToReproduce",
  "currentSection",
  "appVersion",
  "surahNumber",
  "ayahNumber",
  "diagnostics"
]);

export async function POST(request: Request) {
  const requestId = createRequestId();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, "VALIDATION_ERROR", "Please check the report fields and try again.", { requestId });
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return apiError(400, "VALIDATION_ERROR", "Please check the report fields and try again.", { requestId });
  }

  const input = body as Record<string, unknown>;
  const details: Array<{ field: string; message: string }> = [];

  for (const key of Object.keys(input)) {
    if (!ALLOWED_FIELDS.has(key)) {
      details.push({ field: key, message: "Unrecognized field." });
    }
  }

  const category = input.category;
  if (typeof category !== "string" || !ALLOWED_CATEGORIES.has(category)) {
    details.push({ field: "category", message: "Invalid report category." });
  }

  const description = typeof input.description === "string" ? input.description.trim() : "";
  if (description.length < 10 || description.length > 4000) {
    details.push({ field: "description", message: "Description must be between 10 and 4000 characters." });
  }

  let stepsToReproduce = "";
  if (input.stepsToReproduce !== undefined) {
    if (typeof input.stepsToReproduce !== "string" || input.stepsToReproduce.trim().length > 2000) {
      details.push({ field: "stepsToReproduce", message: "Steps to reproduce must be at most 2000 characters." });
    } else {
      stepsToReproduce = input.stepsToReproduce.trim();
    }
  }

  const currentSection = typeof input.currentSection === "string" ? input.currentSection.trim() : "";
  if (currentSection.length < 1 || currentSection.length > 100) {
    details.push({ field: "currentSection", message: "Current section must be between 1 and 100 characters." });
  }

  const appVersion = typeof input.appVersion === "string" ? input.appVersion.trim() : "";
  if (appVersion.length < 1 || appVersion.length > 30) {
    details.push({ field: "appVersion", message: "App version must be between 1 and 30 characters." });
  }

  const hasSurah = input.surahNumber !== undefined;
  const hasAyah = input.ayahNumber !== undefined;
  if (hasSurah !== hasAyah) {
    details.push({ field: "surahNumber", message: "Surah and Ayah numbers must be provided together." });
  }
  if ((hasSurah || hasAyah) && category !== "quran") {
    details.push({ field: "surahNumber", message: "Surah and Ayah references are only valid for Quran reports." });
  }

  let surahNumber: number | null = null;
  if (hasSurah) {
    if (typeof input.surahNumber !== "number" || !Number.isInteger(input.surahNumber) || input.surahNumber < 1 || input.surahNumber > 114) {
      details.push({ field: "surahNumber", message: "Surah number must be an integer between 1 and 114." });
    } else {
      surahNumber = input.surahNumber;
    }
  }

  let ayahNumber: number | null = null;
  if (hasAyah) {
    if (typeof input.ayahNumber !== "number" || !Number.isInteger(input.ayahNumber) || input.ayahNumber < 1 || input.ayahNumber > 286) {
      details.push({ field: "ayahNumber", message: "Ayah number must be an integer between 1 and 286." });
    } else {
      ayahNumber = input.ayahNumber;
    }
  }

  let diagnostics: string | null = null;
  if (input.diagnostics !== undefined) {
    if (typeof input.diagnostics !== "string" || input.diagnostics.length > 1500) {
      details.push({ field: "diagnostics", message: "Diagnostics must be at most 1500 characters." });
    } else {
      diagnostics = input.diagnostics;
    }
  }

  if (details.length > 0) {
    return apiError(400, "VALIDATION_ERROR", "Please check the report fields and try again.", {
      requestId,
      details
    });
  }

  return apiError(
    503,
    "PERSISTENCE_UNAVAILABLE",
    "Persistent problem-report storage is not configured for this deployment.",
    { requestId, retryable: true }
  );
}
