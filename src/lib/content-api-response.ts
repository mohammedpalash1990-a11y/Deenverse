import {
  validateContentRecord,
  type ContentPage,
  type ContentSourceResult,
  type ContentRecord
} from "./content-source";
import type { ReligiousContentType } from "./content-safety";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Parse the provisional paginated REST envelope. This validates shape and
 * metadata only; it does not establish source authenticity or legal approval.
 */
export function parseContentPageResponse(
  value: unknown,
  expectedType?: ReligiousContentType
): ContentSourceResult<ContentPage> {
  if (!isObject(value) || !isObject(value.meta) || !Array.isArray(value.data)) {
    return {
      ok: false,
      error: {
        code: "INTEGRITY_REJECTED",
        message: "The content service returned an invalid response.",
        retryable: false
      }
    };
  }

  if (typeof value.meta.requestId !== "string" || value.meta.requestId.trim() === "") {
    return {
      ok: false,
      error: {
        code: "INTEGRITY_REJECTED",
        message: "The content service response is missing its request identifier.",
        retryable: false
      }
    };
  }

  const nextCursor = value.meta.nextCursor;
  if (nextCursor !== undefined && nextCursor !== null && typeof nextCursor !== "string") {
    return {
      ok: false,
      error: {
        code: "INTEGRITY_REJECTED",
        message: "The content service returned an invalid pagination cursor.",
        retryable: false
      }
    };
  }

  const records: ContentRecord[] = [];
  for (const record of value.data) {
    const validation = validateContentRecord(record);
    if (!validation.valid || !isObject(record) || (expectedType && record.type !== expectedType)) {
      return {
        ok: false,
        error: {
          code: "INTEGRITY_REJECTED",
          message: "One or more content records failed validation. No records were displayed.",
          retryable: false
        }
      };
    }
    records.push(record as unknown as ContentRecord);
  }

  return {
    ok: true,
    data: {
      items: records,
      nextCursor: nextCursor as string | null | undefined
    }
  };
}
