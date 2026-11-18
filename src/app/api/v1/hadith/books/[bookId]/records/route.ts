import { apiError, isValidPaginationParams } from "@/lib/api-mock-store";

const ALLOWED_LOCALES = new Set(["ar", "bn", "en"]);

export async function GET(
  request: Request,
  context: { params: Promise<{ bookId: string }> }
) {
  const { bookId } = await context.params;
  if (!bookId || bookId.length > 128) {
    return apiError(400, "VALIDATION_ERROR", "Invalid book identifier.");
  }

  const { searchParams } = new URL(request.url);
  const pagination = isValidPaginationParams(searchParams);
  if (!pagination.ok) {
    return apiError(400, "VALIDATION_ERROR", "Invalid record query parameters.");
  }

  const locale = searchParams.get("locale");
  if (locale !== null && !ALLOWED_LOCALES.has(locale)) {
    return apiError(400, "VALIDATION_ERROR", "Invalid record query parameters.");
  }

  const chapterId = searchParams.get("chapterId");
  if (chapterId !== null && (chapterId.length < 1 || chapterId.length > 128)) {
    return apiError(400, "VALIDATION_ERROR", "Invalid record query parameters.");
  }

  return apiError(503, "CONTENT_UNAVAILABLE", "Approved Hadith content is not available.");
}
