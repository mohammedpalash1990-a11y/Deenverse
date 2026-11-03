/**
 * Provider-neutral boundary between the web client and an approved content API.
 *
 * This contract deliberately transports provenance with every record. It does
 * not validate religious authenticity and must not be used to publish content
 * without the independent publication review gate.
 */

import { evaluatePublication, type ContentProvenance, type ReligiousContentType } from "./content-safety";

export interface ContentRecord {
  id: string;
  type: ReligiousContentType;
  title: string;
  locale: string;
  provenance: ContentProvenance;
  /** Opaque provider payload. Renderers must validate by content type. */
  payload: unknown;
}

export interface ContentQuery {
  type: ReligiousContentType;
  locale: string;
  query?: string;
  cursor?: string;
  limit?: number;
}

export interface ContentPage {
  items: ContentRecord[];
  nextCursor?: string | null;
}

export type ContentSourceErrorCode =
  | "UNAVAILABLE"
  | "UNAUTHORIZED"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "INVALID_QUERY"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "CONTENT_UNAVAILABLE"
  | "INTEGRITY_REJECTED"
  | "INTERNAL_ERROR";

export interface ContentSourceError {
  code: ContentSourceErrorCode;
  message: string;
  retryable: boolean;
}

export type ContentSourceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ContentSourceError };

/**
 * Implementations must return source metadata unchanged and must never
 * silently substitute generated or unverified religious text.
 */
export interface ContentSource {
  list(query: ContentQuery): Promise<ContentSourceResult<ContentPage>>;
  getById(id: string): Promise<ContentSourceResult<ContentRecord | null>>;
}

/** Safe default for environments where no approved provider is configured. */
export const unavailableContentSource: ContentSource = {
  async list() {
    return {
      ok: false,
      error: {
        code: "UNAVAILABLE",
        message: "Verified content service is not configured.",
        retryable: false
      }
    };
  },
  async getById() {
    return {
      ok: false,
      error: {
        code: "UNAVAILABLE",
        message: "Verified content service is not configured.",
        retryable: false
      }
    };
  }
};

export interface ContentRecordValidation {
  valid: boolean;
  reasons: string[];
}

/**
 * Runtime validation for untrusted API responses. Call this at the adapter
 * boundary before a response is exposed to UI code.
 */
export function validateContentRecord(value: unknown): ContentRecordValidation {
  const reasons: string[] = [];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { valid: false, reasons: ["Content record must be an object"] };
  }

  const record = value as Record<string, unknown>;
  for (const field of ["id", "title", "locale"] as const) {
    if (typeof record[field] !== "string" || record[field].trim().length === 0) {
      reasons.push(`Missing or invalid content field: ${field}`);
    }
  }

  const allowedTypes: ReligiousContentType[] = [
    "quran", "translation", "tafsir", "hadith", "dua", "audio"
  ];
  if (typeof record.type !== "string" || !allowedTypes.includes(record.type as ReligiousContentType)) {
    reasons.push("Content type is not supported");
  }

  if (record.payload === undefined || record.payload === null) {
    reasons.push("Content payload is missing");
  }

  if (!record.provenance || typeof record.provenance !== "object" || Array.isArray(record.provenance)) {
    reasons.push("Content provenance is missing or invalid");
  } else {
    const provenance = record.provenance as Partial<ContentProvenance>;
    const publication = evaluatePublication(provenance);
    reasons.push(...publication.reasons);
    if (typeof record.type === "string" && provenance.contentType !== record.type) {
      reasons.push("Record type does not match provenance content type");
    }
  }

  return { valid: reasons.length === 0, reasons };
}
