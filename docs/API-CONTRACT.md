# DEENVERSE — API Contract v1 (Backend & Frontend Boundary)

## Overview

All responses adhere to the standard REST envelope specified in `docs/CONTENT-API-RESPONSE-PARSING.md` and `docs/CONTENT-API-ERROR-MAPPING.md`.

**Example-data warning:** Every identifier, source, reviewer, license, checksum, and catalogue value in the JSON examples below is illustrative test/documentation data only. It does not identify an approved Quran source, establish redistribution rights, or authorize publication of religious content. Production responses must remain unavailable until the source and its artifact have completed the independent approval process.

## Response Envelopes

### Success Envelope (Paginated)

```json
{
  "meta": {
    "requestId": "req_01h7abc...",
    "nextCursor": "MA=="
  },
  "data": [
    {
      "id": "quran:surah:1",
      "type": "quran",
      "title": "Example catalogue title",
      "locale": "ar",
      "provenance": {
        "contentType": "quran",
        "sourceId": "example-source-not-production",
        "edition": "example-edition",
        "sourceUrl": "https://example.invalid/source",
        "attribution": "Documentation fixture only",
        "licenseId": "EXAMPLE-NOT-A-LICENSE",
        "redistributionAllowed": true,
        "reviewer": "example-reviewer-not-production",
        "reviewedAt": "2026-01-01T00:00:00.000Z",
        "approvalStatus": "approved",
        "reviewDecisionId": "example-approval-not-production",
        "approvedByAuthority": "example-reviewer-not-production",
        "approvedAt": "2026-01-01T00:00:00.000Z",
        "checksum": "0000000000000000000000000000000000000000000000000000000000000000"
      },
      "payload": {
        "surahNumber": 1,
        "nameArabic": "example-only",
        "nameSimple": "Example",
        "nameEnglish": "Example",
        "revelationPlace": "makkah",
        "revelationOrder": 1,
        "versesCount": 1
      }
    }
  ]
}
```

The pagination cursor is an opaque, base64-encoded non-negative offset in the current implementation. Clients must treat it as an opaque token and must not construct or modify it.

**Integrity limitation:** The current backend compares the approval record's `artifact_sha256` string with the source record's `checksum` string and validates provenance metadata. It does not download or hash an immutable source artifact. This equality check is not cryptographic artifact verification and must not be described as proof that published content matches an authentic source. Do not approve or publish production religious content until immutable artifact retrieval, SHA-256 recomputation, source identity, edition, licensing, and independent human review are implemented and evidenced.

### Error Envelope

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found",
    "requestId": "req_01h7abc...",
    "details": [],
    "retryable": false
  }
}
```

Standard Error Codes:
- `CONTENT_UNAVAILABLE`: No eligible approved source is available, or Quran edition selection is ambiguous.
- `UNAVAILABLE`: A service/readiness dependency is unavailable.
- `VALIDATION_ERROR`: Query parameters or payload failed validation (HTTP 400).
- `UNAUTHENTICATED`: Authentication is required (HTTP 401 where a route policy applies).
- `FORBIDDEN`: The caller is not permitted to access the resource (HTTP 403).
- `NOT_FOUND`: Requested entity does not exist (HTTP 404).
- `RATE_LIMITED`: Too many requests (HTTP 429; retryable).
- `INTEGRITY_REJECTED`: Content failed provenance or stored-record integrity checks (HTTP 502).
- `INTERNAL_ERROR`: Internal server failure (HTTP 500).

The current backend uses HTTP 400 for validation errors, 401/403 for authentication/authorization errors when applicable, 404 for missing resources, 429 for rate limiting, 502 for integrity rejection, and 503 for `CONTENT_UNAVAILABLE` or `UNAVAILABLE`. Read-only route registration does not imply that any religious corpus is approved or populated.

## Release-safety contract override — 2026-11-05

The current mainline release-safety candidate is PR #75 (`qa/release-safety-2026-11-05`). Its exact-head CI passed, but it remains an unmerged draft. Until it is reviewed and merged:

- Treat PR #75 as the required release-safety target, not as deployed behavior.
- The candidate unregisters both public QuranEnc Bengali translation routes; the expected response is HTTP 404 with `NOT_FOUND`. The frontend translation adapter may remain in the codebase for future approved use, but it must not be described as an available production API.
- The candidate replaces the raw-GitHub Quran text and unverified EveryAyah/Audiomack audio reader with a fail-closed approval-pending state, deletes the unverified committed Quran text copy, and removes `raw.githubusercontent.com` from browser `connect-src`.
- PR #1's earlier route inventory and OpenAPI snapshot predate this safety candidate. Do not use the older translation-route registration as a release contract, and do not merge PR #1 without reconciling its OpenAPI paths, tests, and UI against PR #75.
- The safety candidate does not establish source authenticity, independent scholarly approval, artifact acquisition/digest evidence, translation redistribution rights, or audio rights. No religious content may be imported, fabricated, or activated to make tests or UI appear complete.

The candidate's exact-head evidence recorded in PR #75 is DEENVERSE CI run [42071843318](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/42071843318) and Web foundation run [42071843376](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/42071843376). These checks validate software behavior on that candidate SHA only; they do not authorize a merge, deployment, or content release.

## Remaining contract work

1. Remove or explicitly mark disabled paths from the OpenAPI snapshot when reconciling it with PR #75; validate route parity against the exact target SHA.
2. Replace unsigned offset cursors with signed, query-bound opaque cursors and test cross-edition/search/filter replay.
3. Extend contract tests to every response schema, error edge case, and pagination boundary.
4. Require immutable artifact retrieval and independent SHA-256 recomputation before a source can become eligible.
5. Keep Quran, translation, Hadith, tafsir, dua, and audio endpoints unavailable until each source's authenticity, edition, redistribution rights, attribution, and independent review are evidenced.
