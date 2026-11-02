# DEENVERSE API Contract — Draft 0.2

**Status:** cross-team proposal; not implemented and not yet accepted by Jules/Queen.  
**Transport recommendation:** versioned REST/JSON over HTTPS, described with OpenAPI 3.1. The recommendation is pending explicit agreement in both workstream PRs.

## Contract principles

- Public routes use the `/api/v1` prefix.
- Validate request parameters and response payloads against shared schemas.
- Return stable machine-readable error codes; never expose stack traces, SQL, tokens, or provider internals.
- Use cursor pagination for collections that may grow.
- Enforce private-resource authorization on the server. A client-supplied user ID is never an authorization control.
- Public religious-content endpoints return only approved records whose source and redistribution terms permit the requested use.
- Treat religious content as immutable, versioned source records—not free-form generated text.
- Do not silently normalize, rewrite, transliterate, repair, or reconstruct Quranic Arabic.

## Canonical Phase 1 read surface

The machine-readable proposal is `docs/OPENAPI-DRAFT.yaml`.

| Method and route | Purpose | Access |
|---|---|---|
| `GET /api/v1/quran/editions` | Approved Arabic/translation editions permitted for public delivery | Public |
| `GET /api/v1/quran/surahs` | Verified Surah catalogue metadata | Public |
| `GET /api/v1/quran/surahs/{surahNumber}/ayahs?editionId=...` | Ayah records for one Surah and one explicit edition | Public |
| `GET /api/v1/audio/reciters` | Approved reciter metadata for which catalogue display is permitted | Public |

Audio playback/stream URL issuance is intentionally not standardized yet. It depends on provider-specific authentication, expiry, hotlinking, caching, and redistribution terms. Do not expose or cache audio URLs until those terms are verified.

Hadith, tafsir, dua, user-library, authentication, and admin write APIs remain later contract increments. Do not infer their security or source rules from the Quran read routes.

## Response envelope

Success responses use:

```json
{
  "data": {},
  "meta": {
    "requestId": "opaque-request-id"
  }
}
```

Paginated responses add:

```json
{
  "data": [],
  "meta": {
    "requestId": "opaque-request-id",
    "nextCursor": null
  }
}
```

A `null` nextCursor means there is no next page. An empty approved catalogue is a valid empty result, not an invented fallback dataset.

Errors use:

```json
{
  "error": {
    "code": "CONTENT_UNAVAILABLE",
    "message": "The requested approved content is not available.",
    "details": [],
    "requestId": "opaque-request-id"
  }
}
```

## Stable error codes

- `VALIDATION_ERROR` — invalid path/query input.
- `UNAUTHENTICATED` — a private route requires a valid session.
- `FORBIDDEN` — authenticated caller lacks permission or a content use is not licensed.
- `NOT_FOUND` — requested resource does not exist.
- `CONTENT_UNAVAILABLE` — resource exists in catalogue metadata but approved distributable content is not available.
- `RATE_LIMITED` — caller exceeded a documented limit.
- `INTERNAL_ERROR` — unexpected server failure; response must not expose internal details.

Use HTTP status codes consistently: 400/422 for invalid input (choose one convention and apply it consistently), 401, 403, 404, 429, and 500/503. Jules should record the chosen validation status convention in the implementation ADR before the first API release.

## Religious content record requirements

Every edition and content record must preserve, as applicable:

- stable internal ID and content type;
- publisher/provider and canonical source identifier;
- edition/version and language;
- attribution/copyright notice;
- license identifier and explicit redistribution/caching/audio permissions;
- approval/review status and reviewer/audit reference;
- retrieval date and immutable source snapshot/checksum.

Only approved records with the necessary distribution permission may appear in public content responses. If no qualifying source is approved, return an explicit empty or unavailable state.

For Quran Arabic, preserve the exact source string and edition metadata. Integrity checks must compare imported content to an immutable approved source snapshot. Any normalization policy must be explicit, documented, and tested; it must not silently change the stored or displayed text.

## Pagination and caching

- Default page size: 50; maximum: 100, unless implementation evidence requires a different documented limit.
- Cursors are opaque and bound to the query/edition context.
- Do not use offset pagination for ayah/content collections.
- Use ETags or immutable version/checksum identifiers for versioned content where appropriate.
- Cache only when the source license permits caching; cache headers must not override source restrictions.
- Never cache private user-library responses in shared/public caches.

## Client integration rules

- Frontend must consume typed API adapters rather than embedding endpoint URLs in components.
- Demo/mock adapters must be separate from production adapters and visibly labeled in the UI.
- Do not present mock data as verified religious content.
- Audio UI must not indicate playback until a licensed stream is configured and playback actually succeeds.
- Bookmark UI must not claim cloud synchronization until authenticated, user-scoped persistence is implemented and tested.

## Decisions requiring Jules + Queen acknowledgement

1. Accept REST/JSON + OpenAPI 3.1, or propose an alternative with migration implications.
2. Confirm the edition, Surah, ayah, and reciter schema names/types.
3. Agree on validation status convention (400 vs 422).
4. Agree on request ID propagation and error mapping.
5. Confirm whether the frontend needs additional Phase 1 read fields before backend implementation.

Record the agreed contract revision in both PR descriptions and update this document only through a reviewed integration change.
