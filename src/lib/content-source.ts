/**
 * Provider-neutral boundary between the web client and an approved content API.
 *
 * This contract deliberately transports provenance with every record. It does
 * not validate religious authenticity and must not be used to publish content
 * without the independent publication review gate.
 */

import type { ContentProvenance, ReligiousContentType } from "./content-safety";

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
  nextCursor?: string;
}

export type ContentSourceErrorCode =
  | "UNAVAILABLE"
  | "UNAUTHORIZED"
  | "INVALID_QUERY"
  | "INTEGRITY_REJECTED";

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
