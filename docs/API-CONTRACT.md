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

Pagination cursors are opaque HMAC-SHA-256 signed tokens. Their authenticated payload includes a version, non-negative offset, and canonical query scope. Quran Surah cursors are bound to the route and page size; Hadith book cursors are bound to the route and page size; Hadith record cursors are additionally bound to book, chapter, locale, and page size; Hadith search cursors are bound to the exact trimmed search text, locale, and page size; Unicode-normalization variants are separate query scopes. Invalid signatures, tampering, malformed tokens, and cross-query/page-size replay return HTTP 400 `VALIDATION_ERROR`. Clients must treat cursors as opaque and must not construct or modify them. The signing key is derived from `API_CURSOR_SECRET` when configured, otherwise from `DATABASE_URL`; development without either uses a process-local random key, so cursors created in that local mode are not portable across process restarts.

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

## Release-safety and integration contract — 2026-11-06

### Public mainline and candidate PRs

- `main` remains at `f098d650a9cbc5aaaaadee6a925e68dfa9dbdb9a`. No integration changes in this document are live on main.
- PR #75 (`qa/release-safety-2026-11-05`) remains open, draft, and unmerged at head `33ad1020bde7c91c0a42239ebf915198c830362c`. Its functional safety changes were tested on predecessor `773378d82e0396358aecd6cb6a148b48ae2cfbfa`: DEENVERSE CI #42075029048 and Web foundation #42075029010 passed; backend 80/80, web 171/171, and both audits reported zero vulnerabilities. The current PR head is documentation-only and has no separate workflow run.
- PR #69 (`codex/quran-public-beta-reader`) remains open and non-mergeable. It reintroduces a browser fetch from `raw.githubusercontent.com` when the approved API returns `CONTENT_UNAVAILABLE`, re-allows that host in CSP, and presents the fetched text as public beta. A client-side SHA-256 comparison does not establish official artifact acquisition, independent approval, or redistribution rights. Blocking review comment #6685706745 records this finding. Do not merge or deploy PR #69.

### Integration branch contract

The following evidence describes `integration/platform-foundation`, not deployed mainline behavior. At the latest verified implementation head `dc251bcc38dff3b7d0d975e31959a255e606960f`, the branch compared 107 commits ahead / 0 behind main. PR #1 remains open and unmerged; no review submissions or inline review threads were recorded. Do not merge automatically.

The OpenAPI snapshot contains exactly 10 registered GET operations:

- `/api/v1/health` and `/api/v1/ready`
- `/api/v1/quran/surahs` and `/api/v1/quran/surahs/{surahNumber}`
- `/api/v1/ayah/{surah}/{ayah}`
- `/api/v1/hadith/books`
- `/api/v1/hadith/books/{bookId}/chapters`
- `/api/v1/hadith/books/{bookId}/records`
- `/api/v1/hadith/records/{recordId}`
- `/api/v1/hadith/search`

Both public QuranEnc Bengali translation routes are unregistered and absent from OpenAPI. Requests to `/api/v1/translation/bn/{surahNumber}` and `/api/v1/translation/bn/{surahNumber}/{ayahNumber}` return the canonical HTTP 404 `NOT_FOUND` envelope. The translation parser/client remain dormant code only; they are not a public API or an approved content source. QuranEnc-specific response schemas were removed from the OpenAPI snapshot.

The mounted Quran section is an approval-pending placeholder. It makes no Quran, translation, or audio request and renders no religious text. The unverified repository Quran text file is absent from the integration tree, and browser `connect-src` does not allow `raw.githubusercontent.com`. The public Hadith reader requests only backend-approved records and displays an empty/unavailable state when no approved collection exists.

The source selector requires exactly one active, redistribution-permitted source with a matching approval digest, distinct source and artifact reviewers, and no `project-owner-chat-authorization` reviewer identity. The stored digest comparison is metadata gating only: the read path does not download and independently re-hash the upstream artifact. The OpenAPI checksum description now states this limitation. Pagination cursors are HMAC-SHA-256 signed and bound to route and query context, including the exact trimmed Hadith search text, locale, and page size; they do not provide snapshot isolation.

### Exact CI evidence

The latest verified integration head `dc251bcc38dff3b7d0d975e31959a255e606960f` was tested through PR #1's merge ref, combining that head with main `f098d650a9cbc5aaaaadee6a925e68dfa9dbdb9a`:

- DEENVERSE CI #42224958000 — PASS. Backend: typecheck, 86/86 tests, PostgreSQL 16 migrations/runtime, production SQLite startup guard, build, and `npm audit --audit-level=high` (0 vulnerabilities). Web: typecheck, 18 test files / 174 tests, production build, and high-severity audit (0 vulnerabilities).
- Web foundation #42224958140 — PASS: locked install, audit capture, typecheck, 18 test files / 174 tests, production build.
- OpenAPI validation #42224958031 — PASS: OpenAPI 3.1 YAML parse, unique keys, local references, and backend route parity; 10 paths / 10 operations.

An earlier backend run on head `9146c6925e94b2dcda89f0182ab6994a1af9190a` exposed one fixture defect: the test approval reviewer was identical to the source reviewer, so the new independence gate correctly returned 503 instead of the fixture's expected 200. Commit `073fb540a5dbf3583249f828383b1f9c9ab4d142` changed the synthetic approval reviewer to a distinct test identity; the later exact-head backend suite passed 86/86.

The first OpenAPI metadata edit had a YAML quoting error at line 489. Commit `dc251bcc38dff3b7d0d975e31959a255e606960f` repaired the checksum schema, and OpenAPI validation #42224958031 passed on the repaired head.

### Agent branch evidence

- `jules/backend-foundation` head `f84e35c242ab37ccafca0528a1d06e0d4b244834`: 3 commits ahead / 69 behind main; its only branch-specific files are `AGENT_TASK.md` and `JULES_NEXT_TASK.md`.
- `queen/frontend-foundation` head `9ef788c81de85e9ebfa139b35c42d606c38f2010`: 2 commits ahead / 69 behind main; its only branch-specific file is `AGENT_TASK.md`.
- No backend/frontend implementation is attributed to either assignment branch. Neither branch was modified.

### Content and release restrictions

No Quran Arabic, Hadith, translation, tafsir, dua, or audio corpus was fabricated, imported, or activated by this integration work. No secrets or production data were committed. No production content is authorized until exact immutable artifacts, independently recomputed digests, source/edition identity, use-specific redistribution terms, and qualified independent human approval are evidenced. Per-Ayah review, translation rights, Hadith/tafsir/dua source approvals, audio ownership/streaming/offline rights, authentication/authorization, hosted PostgreSQL operations, and manual RTL/accessibility/device QA remain release blockers.

## Remaining contract work

1. Remove or explicitly mark disabled paths from the OpenAPI snapshot when reconciling it with PR #75; validate route parity against the exact target SHA.
2. Replace unsigned offset cursors with signed, query-bound opaque cursors and test cross-edition/search/filter replay.
3. Extend contract tests to every response schema, error edge case, and pagination boundary.
4. Require immutable artifact retrieval and independent SHA-256 recomputation before a source can become eligible.
5. Keep Quran, translation, Hadith, tafsir, dua, and audio endpoints unavailable until each source's authenticity, edition, redistribution rights, attribution, and independent review are evidenced.


## Pagination cursor hardening — 2026-11-07

The integration implementation replaces unsigned Base64 offsets with HMAC-SHA-256 authenticated cursor tokens. Query scope is checked after signature verification. Hadith search scope uses the exact trimmed query string after request validation; Unicode-normalization variants are distinct scopes; Hadith record scope includes the selected book, chapter, locale, and page size. The implementation does not claim snapshot isolation: inserts/deletes between page requests can still change offset-based page boundaries, so consumers should deduplicate by stable record ID when traversing a changing catalogue.


## Integration reconciliation — 2026-11-07 (exact branch review)

This section supersedes older branch-count and PR-state snapshots above where they conflict with the exact refs reviewed on this date. It describes `integration/platform-foundation`, not deployed `main`.

### Verified branch and API boundary

- Reviewed integration head: `001673e6c7287e7562fd1fd6d385cc0194cf4e0d` (Hadith record-review source binding; PR #80). The branch is 2 commits ahead / 0 behind `main` at `a7ad2eb4dae5d2fdcfb682e1747d4b17d56dab29`; its two changed files are `backend/src/services/hadith-library.ts` and `backend/test/hadith-api.test.ts`.
- The registered backend boundary remains 10 GET operations: `/api/v1/health`, `/api/v1/ready`, `/api/v1/quran/surahs`, `/api/v1/quran/surahs/{surahNumber}`, `/api/v1/ayah/{surah}/{ayah}`, `/api/v1/hadith/books`, `/api/v1/hadith/books/{bookId}/chapters`, `/api/v1/hadith/books/{bookId}/records`, `/api/v1/hadith/records/{recordId}`, and `/api/v1/hadith/search`.
- Quran catalogue, Ayah, and Hadith browser clients share `resolveApiBaseUrl()`. The public build-time setting is `NEXT_PUBLIC_API_BASE_URL`; absent configuration resolves to same-origin `/api/v1`. It must never contain credentials. The Quran translation client remains dormant and its public backend routes are not registered on this integration line.
- On this exact integration head, Hadith search cursor scope uses the NFC-normalized query, locale, and page size. Cursors remain opaque HMAC-signed values; clients must not construct, normalize, or edit cursor tokens themselves. PR #82 proposes changing this to exact trimmed-query binding and adds Bengali Unicode regression coverage, but that change is not present on this branch. Do not describe PR #82's proposed semantics as implemented here; reconcile route, service, tests, and this contract together before adopting it.
- The Hadith source-review patch requires primary and independent record reviews to match the record's own `source_id`, in addition to the existing artifact digest and reviewer-independence checks. It adds no religious content.

### Exact-head CI evidence

GitHub Actions reports successful completed runs for this exact commit: DEENVERSE CI run `42374891938` and Web foundation run `42374891780`. The workflow records report backend typecheck/build, 91/91 backend tests, PostgreSQL 16 verification, production SQLite startup guard, web typecheck/build, 174/174 web tests, and zero high-severity dependency findings. These are CI results, not local execution or production deployment evidence. No combined commit status entries were returned by the status endpoint.

### Current release boundary

No Quran, translation, tafsir, Hadith, dua, or audio corpus is approved for production publication by this integration review. The code-level approval gates do not replace independent artifact acquisition, recomputed digest, rights review, and qualified human review. Authentication, user-specific writes, audio, dua/tafsir endpoints, production database operations, and manual device/accessibility QA remain outside the verified read-only API boundary.
