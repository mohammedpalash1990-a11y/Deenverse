import { apiError, isValidPaginationParams } from "@/lib/api-mock-store";

const ALLOWED_LOCALES = new Set(["ar", "bn", "en"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (q.length < 1 || q.length > 120) {
    return apiError(400, "VALIDATION_ERROR", "Invalid Hadith search parameters.");
  }

  const locale = searchParams.get("locale");
  if (locale !== null && !ALLOWED_LOCALES.has(locale)) {
    return apiError(400, "VALIDATION_ERROR", "Invalid Hadith search parameters.");
  }

  const pagination = isValidPaginationParams(searchParams);
  if (!pagination.ok) {
    return apiError(400, "VALIDATION_ERROR", "Invalid Hadith search parameters.");
  }

  return apiError(503, "CONTENT_UNAVAILABLE", "Approved Hadith content is not available.");
}
