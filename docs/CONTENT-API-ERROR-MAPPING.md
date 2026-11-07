# Content API error mapping

The shared frontend mapper in `src/lib/content-api-errors.ts` converts untrusted HTTP failures into stable client error codes and safe display messages. The Quran catalogue, Arabic Ayah, Bengali translation, and Hadith adapters use this boundary.

## Mapping behavior

- Uses a recognized contract error code when present.
- Otherwise maps HTTP 400/422, 401, 403, 404, 429, and 503 to stable client codes.
- Unknown statuses and malformed bodies become `INTERNAL_ERROR`.
- Only rate limiting and service/server failures are retryable.
- Server-provided messages and details are never exposed to the UI. Translation adapter errors use this mapper as well.

## Current implementation boundary

The backend currently registers read-only GET routes for health/readiness, Quran Surah metadata, Arabic Ayah, QuranEnc Bengali translation (single Ayah and full Surah), and source-gated Hadith. The frontend has typed adapters for those routes. The existence of a route or adapter does not establish that the source is approved, that content is populated, or that redistribution/caching rights have been granted.

The fallback mapping uses `INVALID_QUERY` for HTTP 400 and `UNAVAILABLE` for an unclassified HTTP 503. When the backend returns a recognized `CONTENT_UNAVAILABLE`, `INTEGRITY_REJECTED`, or other contract code, that code is retained while its server message is replaced by a safe client message.

## Content integrity boundary

Error mapping is not content verification. Successful API responses still require runtime schema validation, immutable source-artifact verification, source identity and license review, and independent human review before religious content can be published.
