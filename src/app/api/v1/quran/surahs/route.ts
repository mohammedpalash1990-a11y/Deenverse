import { apiError, isValidPaginationParams } from "@/lib/api-mock-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pagination = isValidPaginationParams(searchParams);
  if (!pagination.ok) {
    return apiError(400, "VALIDATION_ERROR", pagination.message);
  }

  return apiError(503, "CONTENT_UNAVAILABLE", "Approved Quran catalogue metadata is not available.");
}
