import { apiError } from "@/lib/api-mock-store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ surah: string; ayah: string }> }
) {
  const { surah: rawSurah, ayah: rawAyah } = await context.params;
  if (!/^(?:[1-9]|[1-9][0-9]|10[0-9]|11[0-4])$/.test(rawSurah) || !/^[1-9][0-9]{0,2}$/.test(rawAyah)) {
    return apiError(400, "VALIDATION_ERROR", "Surah and ayah must be positive integers in canonical decimal form.");
  }

  return apiError(503, "CONTENT_UNAVAILABLE", "No approved Quran source is available for this surah.");
}
