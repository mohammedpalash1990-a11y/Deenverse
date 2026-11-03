import {
  validateContentRecord,
  type ContentPage,
  type ContentRecord,
  type ContentSource,
  type ContentSourceError,
  type ContentSourceResult
} from "./content-source";
import { mapContentApiError } from "./content-api-errors";
import { parseContentPageResponse } from "./content-api-response";

export interface RestContentSourceOptions {
  /** API root, for example https://api.example.com/api/v1. Defaults to /api/v1. */
  baseUrl?: string;
  /** Injectable fetch implementation for deterministic tests. */
  fetcher?: typeof fetch;
}

function failure(code: "UNAVAILABLE" | "INVALID_QUERY", message: string, retryable = false): { ok: false; error: ContentSourceError } {
  return { ok: false, error: { code, message, retryable } };
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Read-only adapter for the implemented Quran Surah metadata endpoints.
 * It deliberately does not implement ayah text, editions, audio, or user data.
 * Successful payloads are structurally validated; this is not scholarly
 * authenticity or source-license verification.
 */
export function createRestContentSource(options: RestContentSourceOptions = {}): ContentSource {
  const baseUrl = (options.baseUrl ?? "/api/v1").replace(/\/$/, "");
  const fetcher = options.fetcher ?? fetch;

  return {
    async list(query): Promise<ContentSourceResult<ContentPage>> {
      if (query.type !== "quran" || query.locale !== "ar") {
        return failure("INVALID_QUERY", "This API adapter currently supports Arabic Quran catalogue metadata only.");
      }
      const targetCount = query.limit ?? 50;
      if (!Number.isInteger(targetCount) || targetCount < 1 || targetCount > 114) {
        return failure("INVALID_QUERY", "Catalogue page size must be between 1 and 114.");
      }

      const items: ContentRecord[] = [];
      const seenRecordIds = new Set<string>();
      let cursor = query.cursor;
      let nextCursor: string | null | undefined = cursor ?? null;
      const seenCursors = new Set<string>();
      do {
        const pageSize = Math.min(50, targetCount - items.length);
        const params = new URLSearchParams({ limit: String(pageSize) });
        if (cursor) params.set("cursor", cursor);
        const url = `${baseUrl}/quran/surahs?${params.toString()}`;

        let response: Response;
        try {
          response = await fetcher(url, { method: "GET", headers: { Accept: "application/json" } });
        } catch {
          return { ok: false, error: { code: "UNAVAILABLE", message: "The content service could not be reached.", retryable: true } };
        }
        const body = await readJson(response);
        if (!response.ok) return { ok: false, error: mapContentApiError(response.status, body) };
        const parsed = parseContentPageResponse(body, "quran");
        if (!parsed.ok) return parsed;

        for (const item of parsed.data.items) {
          if (seenRecordIds.has(item.id)) {
            return failure("UNAVAILABLE", "The content service returned a duplicate catalogue record.");
          }
          seenRecordIds.add(item.id);
          items.push(item);
        }
        nextCursor = parsed.data.nextCursor ?? null;
        if (!nextCursor || items.length >= targetCount) break;
        if (seenCursors.has(nextCursor)) {
          return failure("UNAVAILABLE", "The content service returned a repeated pagination cursor.");
        }
        seenCursors.add(nextCursor);
        cursor = nextCursor;
      } while (items.length < targetCount);

      return { ok: true, data: { items, nextCursor } };
    },

    async getById(id): Promise<ContentSourceResult<ContentRecord | null>> {
      const match = /^quran:surah:(\d{1,3})$/.exec(id);
      if (!match) return failure("INVALID_QUERY", "The requested catalogue record identifier is invalid.");
      const surahNumber = Number(match[1]);
      if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
        return failure("INVALID_QUERY", "Surah number must be between 1 and 114.");
      }

      let response: Response;
      try {
        response = await fetcher(`${baseUrl}/quran/surahs/${surahNumber}`, {
          method: "GET",
          headers: { Accept: "application/json" }
        });
      } catch {
        return { ok: false, error: { code: "UNAVAILABLE", message: "The content service could not be reached.", retryable: true } };
      }
      const body = await readJson(response);
      if (!response.ok) return { ok: false, error: mapContentApiError(response.status, body) };

      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return failure("UNAVAILABLE", "The content service returned an invalid record response.");
      }
      const envelope = body as Record<string, unknown>;
      const meta = envelope.meta as Record<string, unknown> | undefined;
      const record = envelope.data;
      const validation = validateContentRecord(record);
      if (!meta || typeof meta.requestId !== "string" || !meta.requestId.trim() ||
          !validation.valid || !record || typeof record !== "object" ||
          (record as Record<string, unknown>).type !== "quran" ||
          (record as Record<string, unknown>).id !== `quran:surah:${surahNumber}`) {
        return failure("UNAVAILABLE", "The content service returned an invalid catalogue record.");
      }
      return { ok: true, data: record as ContentRecord };
    }
  };
}
