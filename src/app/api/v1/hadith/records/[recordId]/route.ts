import { apiError } from "@/lib/api-mock-store";

const ALLOWED_LOCALES = new Set(["ar", "bn", "en"]);

export async function GET(
  request: Request,
  context: { params: Promise<{ recordId: string }> }
) {
  const { recordId } = await context.params;
  if (!recordId || recordId.length > 128) {
    return apiError(400, "VALIDATION_ERROR", "Invalid Hadith identifier.");
  }

  const locale = new URL(request.url).searchParams.get("locale");
  if (locale !== null && !ALLOWED_LOCALES.has(locale)) {
    return apiError(400, "VALIDATION_ERROR", "Invalid locale.");
  }

  return apiError(503, "CONTENT_UNAVAILABLE", "Approved Hadith content is not available.");
}
