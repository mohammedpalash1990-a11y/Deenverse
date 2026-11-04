import type { ContentSourceError } from "./content-source";
import type { ContentProvenance } from "./content-safety";
import { mapContentApiError } from "./content-api-errors";

export interface QuranAyahPayload {
  surahNumber: number;
  ayahNumber: number;
  /** Exact source string. Consumers must not normalize or rewrite it. */
  textArabic: string;
}

export interface QuranAyahProvenance extends ContentProvenance {
  approvalStatus: "approved";
  reviewDecisionId: string;
  approvalReviewerId: string;
  approvedAt: string;
}

export interface QuranAyahRecord {
  id: string;
  type: "quran";
  title: string;
  locale: "ar";
  provenance: QuranAyahProvenance;
  payload: QuranAyahPayload;
}

export type QuranAyahResult =
  | { ok: true; data: QuranAyahRecord }
  | { ok: false; error: ContentSourceError };

export interface QuranAyahClientOptions {
  /** API root, for example https://api.example.com/api/v1. Defaults to NEXT_PUBLIC_API_BASE_URL or /api/v1. */
  baseUrl?: string;
  /** Injectable fetch implementation for deterministic tests. */
  fetcher?: typeof fetch;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function rejected(message: string): QuranAyahResult {
  return {
    ok: false,
    error: { code: "INTEGRITY_REJECTED", message, retryable: false }
  };
}

function isValidProvenance(value: unknown): value is QuranAyahProvenance {
  if (!isObject(value)) return false;
  const stringFields = [
    "sourceId", "edition", "sourceUrl", "attribution", "licenseId",
    "reviewer", "reviewedAt", "reviewDecisionId", "approvedAt"
  ];
  if (stringFields.some((field) => typeof value[field] !== "string" || !(value[field] as string).trim())) {
    return false;
  }
  const approvalReviewer = value.approvalReviewerId ?? value.approvedByAuthority;
  if (typeof approvalReviewer !== "string" || !approvalReviewer.trim()) return false;
  if (value.contentType !== "quran" || value.approvalStatus !== "approved" ||
      value.redistributionAllowed !== true ||
      typeof value.checksum !== "string" ||
      !/^[a-f0-9]{64}$/i.test(value.checksum)) {
    return false;
  }
  try {
    if (new URL(value.sourceUrl as string).protocol !== "https:") return false;
  } catch {
    return false;
  }
  return !Number.isNaN(Date.parse(value.reviewedAt as string)) &&
    !Number.isNaN(Date.parse(value.approvedAt as string));
}

function parseAyahResponse(
  value: unknown,
  surahNumber: number,
  ayahNumber: number
): QuranAyahResult {
  if (!isObject(value) || !isObject(value.meta) ||
      typeof value.meta.requestId !== "string" || !value.meta.requestId.trim() ||
      !isObject(value.data)) {
    return rejected("The content service returned an invalid Ayah response.");
  }

  const record = value.data;
  const expectedId = `quran:ayah:${surahNumber}:${ayahNumber}`;
  if (record.id !== expectedId || record.type !== "quran" ||
      record.locale !== "ar" || typeof record.title !== "string" ||
      !record.title.trim() || !isObject(record.payload)) {
    return rejected("The content service returned an invalid Ayah record.");
  }

  const payload = record.payload;
  if (payload.surahNumber !== surahNumber || payload.ayahNumber !== ayahNumber ||
      typeof payload.textArabic !== "string" || payload.textArabic.length === 0 ||
      payload.textArabic.trim().length === 0) {
    return rejected("The Ayah payload does not match the requested coordinates or contains no text.");
  }

  if (!isValidProvenance(record.provenance)) {
    return rejected("The Ayah record is missing valid approval, licensing, or integrity metadata.");
  }

  return {
    ok: true,
    data: {
      id: record.id,
      type: "quran",
      title: record.title,
      locale: "ar",
      provenance: {
        ...record.provenance,
        approvalReviewerId: record.provenance.approvalReviewerId ?? record.provenance.approvedByAuthority
      } as QuranAyahProvenance,
      // Preserve the source string exactly; deliberately do not normalize it.
      payload: {
        surahNumber: payload.surahNumber,
        ayahNumber: payload.ayahNumber,
        textArabic: payload.textArabic
      }
    }
  };
}

/**
 * Read-only Ayah client. It validates response shape and approval metadata;
 * server-side artifact verification and independent religious review remain
 * mandatory and cannot be replaced by client validation.
 */
export function createQuranAyahClient(options: QuranAyahClientOptions = {}) {
  const configuredBaseUrl = options.baseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL;
  const baseUrl = (configuredBaseUrl?.trim() || "/api/v1").replace(/\/+$/, "");
  const fetcher = options.fetcher ?? fetch;

  return {
    async getAyah(surahNumber: number, ayahNumber: number): Promise<QuranAyahResult> {
      if (!Number.isSafeInteger(surahNumber) || surahNumber < 1 || surahNumber > 114 ||
          !Number.isSafeInteger(ayahNumber) || ayahNumber < 1) {
        return {
          ok: false,
          error: {
            code: "INVALID_QUERY",
            message: "Surah must be 1–114 and Ayah must be a positive integer.",
            retryable: false
          }
        };
      }

      let response: Response;
      try {
        response = await fetcher(
          `${baseUrl}/ayah/${surahNumber}/${ayahNumber}`,
          { method: "GET", headers: { Accept: "application/json" } }
        );
      } catch {
        return {
          ok: false,
          error: {
            code: "UNAVAILABLE",
            message: "The content service could not be reached.",
            retryable: true
          }
        };
      }

      let body: unknown;
      try {
        body = await response.json();
      } catch {
        body = null;
      }

      if (!response.ok) {
        return { ok: false, error: mapContentApiError(response.status, body) };
      }

      return parseAyahResponse(body, surahNumber, ayahNumber);
    }
  };
}
