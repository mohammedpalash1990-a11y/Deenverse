# Content API response parsing

`src/lib/content-api-response.ts` parses the provisional paginated REST success envelope into the provider-neutral `ContentPage` shape.

## Fail-closed behavior

- Requires a response object, a `data` array, and a non-empty `meta.requestId`.
- Accepts `meta.nextCursor` only as a string, null, or omitted.
- Validates every record's required fields and provenance metadata.
- Optionally enforces the requested content type.
- Rejects the entire page if any record is malformed or fails validation; it never returns a partially trusted page.

## Limitations

The parser verifies response structure and required metadata only. It does not verify an artifact SHA-256 against an independently acquired source snapshot, compare Quran Arabic byte-for-byte, prove scholarly authenticity, or establish license rights. Those checks remain server-side ingestion/release gates and independent human review requirements.

The REST contract is still provisional. This parser does not make network requests or imply that a backend endpoint has been implemented or acknowledged.
