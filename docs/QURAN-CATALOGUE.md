# Quran catalogue integration

## Implemented in the web foundation

The Quran library uses the provider-neutral `ContentSource` interface and defaults to the read-only REST adapter. The adapter requests Arabic Quran catalogue metadata from `GET /api/v1/quran/surahs`, follows opaque cursors when the UI requests more than one backend page (the backend page cap is 50), and validates every page before returning it. Set `NEXT_PUBLIC_API_BASE_URL` to the API root (for example `http://localhost:4000/api/v1`); the default is same-origin `/api/v1`. It supports four explicit states:

- **Loading:** source request is pending; the region announces busy state.
- **Error/unavailable:** provider errors, transport failures, and integrity failures are shown without fallback content. Retry is offered only for retryable provider/network failures.
- **Empty:** a valid empty catalogue is shown as empty, never populated with sample Surahs.
- **Verified metadata:** records are rendered only after runtime shape and provenance checks pass.

The catalogue also supports local search by approved Surah title or stable record ID. A selected catalogue entry supports previous/next metadata navigation. This is not yet the ayah reader: the selected entry explicitly states that religious text must come from a separately approved reader endpoint.

## Integrity boundary

Each returned record is validated for required identity fields, supported content type, non-null payload, complete provenance metadata, HTTPS source URL, valid review timestamp, explicit redistribution permission, and matching record/provenance content type. A single invalid record rejects the response as a whole (fail closed).

This is metadata validation, not scholarly authentication. The approved source, edition, exact content snapshot, and redistribution rights still require independent review and registration. Do not treat fixture records in tests as real Quran data.

## Remaining integration work

1. Deploy/configure the backend origin through `NEXT_PUBLIC_API_BASE_URL` and verify the browser's network/CORS path.
2. The adapter currently supports only the Surah metadata list and single-Surah metadata endpoints; it does not fetch ayahs.
3. Add edition selection and ayah retrieval only after the exact source artifact, checksums, completeness, attribution, license, and redistribution permissions are reviewed.
4. Run end-to-end browser tests against a controlled approved-source fixture; never use generated scripture as test content.
