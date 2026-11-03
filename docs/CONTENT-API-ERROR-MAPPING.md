# Content API error mapping

The frontend error mapper in `src/lib/content-api-errors.ts` translates untrusted HTTP error responses into stable client error codes and safe display messages.

## Mapping behavior

- Uses a recognized contract error code when present.
- Otherwise maps HTTP 400/422, 401, 403, 404, 429, and 503 to the draft contract's stable codes.
- Unknown statuses and malformed bodies become `INTERNAL_ERROR`.
- Only rate limiting and service/server failures are retryable.
- Provider-supplied messages, details, SQL, stack traces, and diagnostics are never rendered.

## Contract status

This mapper follows the current **provisional** `docs/API-CONTRACT.md` proposal. It is not evidence that Jules or Queen has acknowledged the contract, nor does it establish that a backend endpoint exists. Do not create a live HTTP adapter or point the UI at a production API until the backend/frontend owners agree the schema, status convention, request ID behavior, and auth model.

## Content integrity boundary

Error mapping is not content verification. Successful API responses still require runtime schema validation, approved provenance, immutable source/checksum verification, and independent human/source review before religious content can be published.
