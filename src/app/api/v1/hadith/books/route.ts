import { apiError, isValidPaginationParams } from "@/lib/api-mock-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pagination = isValidPaginationParams(searchParams);
  if (!pagination.ok) {
    return apiError(400, "VALIDATION_ERROR", "Invalid pagination parameters.");
  }

  return apiError(503, "CONTENT_UNAVAILABLE", "Approved Hadith content is not available.");
}
