import { apiError } from "@/lib/api-mock-store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ bookId: string }> }
) {
  const { bookId } = await context.params;
  if (!bookId || bookId.length > 128) {
    return apiError(400, "VALIDATION_ERROR", "Invalid book identifier.");
  }

  return apiError(503, "CONTENT_UNAVAILABLE", "Approved Hadith content is not available.");
}
