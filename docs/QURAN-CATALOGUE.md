# Quran catalogue integration

## Implemented in the web foundation

The Quran library uses the provider-neutral `ContentSource` interface. The UI requests Arabic Quran catalogue metadata with locale `ar` and a page limit of 114. It supports four explicit states:

- **Loading:** source request is pending; the region announces busy state.
- **Error/unavailable:** provider errors, transport failures, and integrity failures are shown without fallback content. Retry is offered only for retryable provider/network failures.
- **Empty:** a valid empty catalogue is shown as empty, never populated with sample Surahs.
- **Verified metadata:** records are rendered only after runtime shape and provenance checks pass.

The catalogue also supports local search by approved Surah title or stable record ID. A selected catalogue entry supports previous/next metadata navigation. This is not yet the ayah reader: the selected entry explicitly states that religious text must come from a separately approved reader endpoint.

## Edition selection boundary

The current API does not accept an explicit edition/source selector. It therefore serves data only when exactly one active, approved, redistribution-permitted Quran source exists. If zero or multiple sources match, catalogue and detail requests return HTTP 503 rather than selecting an edition implicitly. Add an explicit, reviewed edition-selection contract before enabling multiple simultaneously active editions.

## Integrity boundary

Each returned record is validated for required identity fields, supported content type, non-null payload, complete provenance metadata, HTTPS source URL, valid review timestamp, explicit redistribution permission, and matching record/provenance content type. A single invalid record rejects the response as a whole (fail closed).

This is metadata validation, not scholarly authentication. The approved source, edition, exact content snapshot, and redistribution rights still require independent review and registration. Do not treat fixture records in tests as real Quran data.

## Remaining integration work

1. Backend owner must implement and confirm the Quran catalogue endpoint and response mapping.
2. Frontend/backend owners must acknowledge the provisional API contract before endpoint coupling.
3. Add edition selection and ayah retrieval only after the exact source artifact, checksums, completeness, attribution, license, and redistribution permissions are reviewed.
4. Add integration tests against a controlled approved-source fixture; never use generated scripture as test content.
