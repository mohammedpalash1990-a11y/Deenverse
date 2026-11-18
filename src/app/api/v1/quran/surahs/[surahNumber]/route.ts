import { apiError } from "@/lib/api-mock-store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ surahNumber: string }> }
) {
  const { surahNumber: rawSurahNumber } = await context.params;
  const surahNum = Number(rawSurahNumber);
  if (!/^(?:[1-9]|[1-9][0-9]|1[01][0-9]|114)$/.test(rawSurahNumber) || !Number.isInteger(surahNum) || surahNum < 1 || surahNum > 114) {
    return apiError(400, "VALIDATION_ERROR", "Surah number must be an integer between 1 and 114.");
  }

  return apiError(503, "CONTENT_UNAVAILABLE", "Approved Quran catalogue metadata is not available.");
}
