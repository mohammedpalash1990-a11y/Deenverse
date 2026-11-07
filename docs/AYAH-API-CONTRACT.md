# Quran Ayah API Contract — v1

**Status:** frontend/backend integration contract proposal. This document does not approve or identify a production Quran corpus. No Quran text is included here.

## Route

`GET /api/v1/ayah/{surah}/{ayah}`

Both path parameters are decimal positive integers. `surahNumber` must be 1–114. The server validates the requested Ayah against the selected, approved edition and returns 404 when that Ayah does not exist in that edition.

The endpoint is read-only. It must not select an edition implicitly when more than one approved edition is available; the API owner must either define a configured default approved edition or add an explicit edition selector before supporting multiple editions.

## Success response

HTTP 200:

```json
{
  "meta": {
    "requestId": "req_example"
  },
  "data": {
    "id": "quran:ayah:2:255",
    "type": "quran",
    "title": "Ayah 2:255",
    "locale": "ar",
    "provenance": {
      "contentType": "quran",
      "sourceId": "source-id",
      "edition": "publisher-edition-id",
      "sourceUrl": "https://publisher.example/edition",
      "attribution": "Required publisher attribution",
      "licenseId": "publisher-license-id",
      "redistributionAllowed": true,
      "reviewer": "independent-reviewer-id",
      "reviewedAt": "2026-01-01T00:00:00.000Z",
      "approvalStatus": "approved",
      "reviewDecisionId": "approval-id",
      "approvedByAuthority": "review-authority-id",
      "approvedAt": "2026-01-01T00:00:00.000Z",
      "checksum": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    },
    "payload": {
      "surahNumber": 2,
      "ayahNumber": 255,
      "textArabic": "<exact source text supplied by the approved edition>"
    }
  }
}
```

All values above are schema examples only. The placeholder in `textArabic` is not Quran text and must never be seeded or displayed as content.

## Required invariants

- `id` must exactly equal `quran:ayah:{surahNumber}:{ayahNumber}`.
- Payload path numbers must exactly match the request path.
- `type` must be `quran` and `locale` must be `ar`.
- `textArabic` must be the exact approved source string. Do not trim, normalize, transliterate, rewrite, repair, or otherwise transform it.
- Provenance must include source, edition, HTTPS source URL, attribution, license, explicit redistribution permission, reviewer, review time, approved decision ID/reviewer/time, and a 64-character hexadecimal SHA-256 checksum.
- The current backend verifies the stored Ayah text against its per-record SHA-256 and requires the approval digest to match the registered source checksum. This is a metadata and record-integrity gate, not independent verification of an immutable source artifact. Do not import or publish a production Quran corpus until immutable artifact retrieval, digest recomputation, and independent source review are implemented and evidenced.
- A source/edition without valid approval, rights, or integrity verification must fail closed.
- No synthetic fixtures, AI-generated text, alternate-edition fallback, or cached unapproved record may be returned.

## Error responses

Use the common API error envelope:

| HTTP | Code | Meaning |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid path parameter |
| 401 | `UNAUTHENTICATED` | Authentication required when endpoint policy requires it |
| 403 | `FORBIDDEN` | Caller lacks permission |
| 404 | `NOT_FOUND` | Ayah does not exist in the requested approved edition |
| 429 | `RATE_LIMITED` | Request rate exceeded |
| 503 | `CONTENT_UNAVAILABLE` | No approved, licensed, integrity-verified edition is available |
| 502 | `INTEGRITY_REJECTED` | Stored Ayah record failed its SHA-256 integrity check |

Do not expose internal provider diagnostics, storage paths, SQL errors, or secret values.

## Pagination and edition selection

This single-record route has no pagination cursor. If a list route is added, its cursor must be opaque, validated, bounded, and bound to the edition/query context; clients must not construct or modify it.

Until explicit edition selection is implemented, the backend must find exactly one eligible active, redistribution-permitted, approved Quran source globally. Zero or multiple eligible sources return `503 CONTENT_UNAVAILABLE`; the backend must never choose an arbitrary row or silently switch editions.

## Contract test matrix

- Valid route returns a record with exact matching ID and payload coordinates.
- Invalid Surah/Ayah path values do not issue a request from the client.
- Mismatched ID or payload coordinates are rejected by the client.
- Missing/empty Arabic text is rejected.
- Missing approval metadata, redistribution permission, HTTPS source URL, or SHA-256 digest is rejected.
- Any malformed success envelope is rejected.
- Network failures map to a safe retryable unavailable result.
- HTTP error bodies never expose server-provided diagnostic messages.
- Exact `textArabic` string is preserved byte-for-byte at the JavaScript string boundary; no normalization is applied.

## Integration release state — 2026-11-06

The route remains registered in the integration backend, but the active AppShell does not mount `QuranAyahReader`; the public Quran section shows an approval-pending placeholder and makes no content request. The frontend reader/client are dormant until source approval and redistribution evidence are complete.

The shared backend selector now rejects a source unless the source reviewer and artifact approver are distinct and neither identity is `project-owner-chat-authorization`. The Tanzil import path performs official artifact retrieval, edition/metadata validation, SHA-256 recomputation, and independent approval checks before import. The API read path still compares stored approval/source digest values and verifies the stored Ayah record digest; it does not independently download and hash the official artifact on each request.

Both public QuranEnc translation routes are disabled and absent from the current OpenAPI route list. Translation client/service unit tests do not authorize public display or redistribution. No Quran Arabic, translation, Hadith, tafsir, dua, or audio corpus is approved for production delivery by this contract update.

## Ownership

- Backend owner (Jules): harden the existing `/api/v1/ayah/:surah/:ayah` route and complete independent source-artifact verification; current code verifies the stored Ayah record digest but does not independently retrieve and hash the immutable upstream artifact.
- Frontend owner (Queen): consume this contract in the reader UI and provide loading/error/empty/unavailable states.
- Integration owner: maintain contract tests and ensure frontend/backend schemas remain aligned.
