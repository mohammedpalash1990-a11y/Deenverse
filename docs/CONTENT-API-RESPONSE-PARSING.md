# Content API response parsing

`src/lib/content-api-response.ts` parses the implemented paginated Quran Surah metadata success envelope into the provider-neutral `ContentPage` shape. The Ayah, translation, and Hadith adapters apply their own typed response checks.

## Fail-closed behavior

- Requires a response object, a `data` array, and a non-empty `meta.requestId`.
- Accepts `meta.nextCursor` only as a string, null, or omitted.
- Validates every Quran catalogue record's required fields and provenance metadata.
- Optionally enforces the requested content type.
- Rejects the entire page if any record is malformed or fails validation; it never returns a partially trusted page.
- Adapter error handling replaces untrusted server/provider messages with safe client messages.

## Limitations

These parsers verify response structure and required metadata only. They do not independently acquire and hash an immutable upstream artifact, prove scholarly authenticity, or establish license rights. The Quran Ayah service verifies each stored Arabic string against its stored SHA-256, but that is not independent verification of the upstream artifact. Those checks remain source-ingestion/release gates and independent human review requirements.

A structurally valid success response is not religious-content approval and must not be treated as proof that a corpus is authentic, complete, or licensed for redistribution, caching, offline use, or export.
