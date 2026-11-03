import type { ContentSourceError, ContentSourceErrorCode } from "./content-source";

const SAFE_MESSAGES: Record<ContentSourceErrorCode, string> = {
  UNAVAILABLE: "Verified content is currently unavailable.",
  UNAUTHORIZED: "You are not authorized to access this content.",
  UNAUTHENTICATED: "Please sign in to continue.",
  FORBIDDEN: "This content is not available for this request.",
  INVALID_QUERY: "The content request is invalid.",
  VALIDATION_ERROR: "The content request is invalid.",
  NOT_FOUND: "The requested content was not found.",
  RATE_LIMITED: "Too many requests. Please wait and try again.",
  CONTENT_UNAVAILABLE: "Approved content is not available at this time.",
  INTEGRITY_REJECTED: "The content failed integrity checks and was blocked.",
  INTERNAL_ERROR: "The content service encountered an error. Please try again later."
};

const CODE_SET = new Set<ContentSourceErrorCode>(Object.keys(SAFE_MESSAGES) as ContentSourceErrorCode[]);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Convert an untrusted HTTP error into a stable, safe client error.
 * Server-provided messages/details are intentionally never exposed to the UI.
 */
export function mapContentApiError(status: number, body: unknown): ContentSourceError {
  const envelope = isObject(body) && isObject(body.error) ? body.error : {};
  const candidate = envelope.code;
  const code = typeof candidate === "string" && CODE_SET.has(candidate as ContentSourceErrorCode)
    ? candidate as ContentSourceErrorCode
    : status === 401 ? "UNAUTHENTICATED"
      : status === 403 ? "FORBIDDEN"
        : status === 404 ? "NOT_FOUND"
          : status === 429 ? "RATE_LIMITED"
            : status === 400 || status === 422 ? "VALIDATION_ERROR"
              : status === 503 ? "UNAVAILABLE"
                : "INTERNAL_ERROR";

  const retryable = code === "RATE_LIMITED" || code === "UNAVAILABLE" || code === "INTERNAL_ERROR";
  return { code, message: SAFE_MESSAGES[code], retryable };
}
