# DEENVERSE — Implemented API and integration reconciliation

**Evidence snapshot:** 2026-11-04  
**Main inspected:** `a7ff4130f6d74e9319b6d894c118d270b44171cd`  
**Integration owner branch:** `integration/platform-foundation`  
**Scope:** static source/contract review plus GitHub Actions evidence. This document does not claim a hosted production database, approved religious corpus, manual accessibility audit, or deployed API smoke test.

## 1. Workstream and PR evidence

| Ref | Compare against main before this sync | Changed files in branch diff | Verified conclusion |
|---|---:|---|---|
| `jules/backend-foundation` | 3 ahead / 58 behind | `AGENT_TASK.md`, `JULES_NEXT_TASK.md` | No backend implementation on this named branch head. |
| `queen/frontend-foundation` | 2 ahead / 58 behind | `AGENT_TASK.md` | No frontend implementation on this named branch head. |
| `integration/platform-foundation` | 46 ahead / 58 behind | Integration workflow and documentation only | Cross-cutting docs were stale and the branch needed synchronization. |

Issues #25 and #26 are work assignments, not implementation PRs. Their visible progress comments are from the repository owner; no Jules/Queen-authored implementation PR or commit was found on the named branches. Merged implementation PRs elsewhere in the repository are present in main, but must not be attributed to the current named assignment branches without commit/PR evidence.

Relevant current PR disposition:
- #22 and #23 are merged: PostgreSQL runtime/migration support and PostgreSQL 16 CI verification are in main.
- #28 is merged: frontend API-origin configuration is in main.
- #52 is merged: source-gated Hadith API and reader are in main.
- #65 is merged: Tanzil import requires a separate independent approval bound to the exact text and metadata digests.
- #43 is open, based on main, mergeable=false; its exact-head DEENVERSE CI run was cancelled. It proposes a per-Ayah human-review publication gate.
- #45 is open and stacked on #43; its exact-head DEENVERSE CI run was cancelled. It proposes a tokenized multi-reviewer workspace.
- #47 is open, mergeable=false; its latest observed backend CI run failed. It is an in-app problem-reporting feature, not a religious-content approval workflow.
- #1 is the integration documentation PR. #11 is an older static API-gap PR and must be rechecked against this snapshot before acceptance.

## 2. Selected stack and verification

The current main tree establishes the stack; this is no longer an undecided proposal.

| Layer | Selected implementation |
|---|---|
| Web | Next.js 15.5.28, React 19.1.2, TypeScript 5.8.3, Vitest 5.1.0 |
| Backend | Node.js 22, TypeScript, Fastify 5.2.1, Knex 3.1.x, Zod 4.6.7 |
| Database | PostgreSQL in production; SQLite for local/test use; PostgreSQL driver `pg` 8.13.x |
| Package management | npm with committed root and backend lockfiles; CI uses `npm ci` |
| Backend tests | Node native test runner through `tsx` |
| CI | GitHub Actions; PostgreSQL 16 service for backend integration tests |

GitHub Actions run [#41812199822](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/41812199822) completed successfully on the exact main SHA `a7ff4130f6d74e9319b6d894c118d270b44171cd` on 2026-11-04. Both jobs passed:
- Backend: locked install, typecheck, tests, build, and `npm audit --audit-level=high`; PostgreSQL 16 service initialized.
- Web: locked install, typecheck, tests, production build, and `npm audit --audit-level=high`.

This is exact-head CI evidence. It is not a hosted production database test, browser/device QA, screen-reader audit, or proof of religious-content approval.

## 3. Implemented HTTP route inventory

All currently registered backend routes are GET-only and versioned under `/api/v1`.

| Method | Route | Backend behavior | Frontend adapter |
|---|---|---|---|
| GET | `/api/v1/health` | Liveness probe | Deployment/monitoring |
| GET | `/api/v1/ready` | Database + required-schema readiness | Deployment/monitoring |
| GET | `/api/v1/quran/surahs` | Approved-source-gated Surah metadata page | `content-api-client.ts` |
| GET | `/api/v1/quran/surahs/{surahNumber}` | One Surah metadata record | `content-api-client.ts` |
| GET | `/api/v1/ayah/{surah}/{ayah}` | Source-gated Ayah record with stored-text SHA-256 check | `quran-ayah-client.ts` |
| GET | `/api/v1/translation/bn/{surahNumber}` | Full Bengali Surah translation from pinned QuranEnc edition | No separate full-Surah client verified in the adapter inventory |
| GET | `/api/v1/translation/bn/{surahNumber}/{ayahNumber}` | One Bengali translation record from pinned QuranEnc edition | `quran-translation-client.ts` |
| GET | `/api/v1/hadith/books` | Approved Hadith collection page | `hadith-api-client.ts` |
| GET | `/api/v1/hadith/books/{bookId}/chapters` | Chapters for one approved collection | `hadith-api-client.ts` |
| GET | `/api/v1/hadith/books/{bookId}/records` | Reviewed narration page, optional chapter/locale filter | `hadith-api-client.ts` |
| GET | `/api/v1/hadith/records/{recordId}` | One reviewed narration, optional locale filter | `hadith-api-client.ts` |
| GET | `/api/v1/hadith/search` | Search approved/reviewed narrations | `hadith-api-client.ts` |

The adapter paths were compared statically with the backend registrations. Quran catalogue, Ayah, Bengali translation, and Hadith clients use the shared `resolveApiBaseUrl()` boundary. The public build-time setting is `NEXT_PUBLIC_API_BASE_URL`; it is not a place for credentials. The browser CSP uses the configured API origin rather than a wildcard.

Not implemented in main's route registration: audio/reciter endpoints, authentication/session endpoints, private bookmarks/progress, dua/adhkar, tafsir, admin publishing, and problem-report submission. #47 and #43/#45 are open PRs and are not part of the main API contract.

## 4. Contract behavior and known mismatches

- Success envelope: `{ meta: { requestId, nextCursor? }, data }`.
- Error envelope: `{ error: { code, message, requestId, details, retryable } }`.
- Validation failures use HTTP 400, not 422.
- Paginated Quran/Hadith routes use a page size default of 20 and maximum of 50.
- Cursors are canonical Base64 encodings of non-negative numeric offsets. Clients must pass them through unchanged. They are not currently bound to an edition/query fingerprint.
- CORS uses an explicit origin allowlist (`CORS_ALLOWED_ORIGINS` or `CORS_ORIGIN`); default rate limit is 100 requests per 60 seconds.
- These are public read routes. No user authentication/session or private-resource authorization layer is implemented in main.

**Edition-selection blocker:** the Quran catalogue and Ayah services select the first active approved Quran source using `.first()`; the public routes do not accept an explicit `editionId`. The Ayah contract says a single configured edition may be served until explicit multi-edition selection exists, but the code does not reject multiple active approved editions. Before a second source can be activated, enforce exactly one eligible source or add an explicit edition selector and bind cursors/records to it. Do not rely on database row order.

**Source-verification limitation:** runtime source eligibility compares the approval row's `artifact_sha256` string with the registered source checksum and validates provenance fields. The Ayah service independently hashes the stored Ayah string. This does not independently retrieve and re-hash the immutable upstream artifact on every request and does not prove scholarly authenticity.

## 5. Content and licensing state

- **Quran Arabic:** the Tanzil Uthmani importer and official-source seed path are implemented. The seed is opt-in and requires a registered inactive source plus a separate independent approval bound to the exact text-artifact SHA-256 and metadata SHA-256. The main source dossier still records Tanzil as candidate: no exact source artifact/checksum, completed independent source review, or import evidence is recorded. The Quran Ayah-by-Ayah protocol says no Ayah has been human-approved.
- **Per-Ayah review:** not enforced by the current main Ayah service. PR #43 proposes this gate but remains open and its latest observed CI was cancelled. Do not treat the open PR as a live gate.
- **Bengali translation:** the API adapter is pinned to QuranEnc key `bengali_zakaria`, edition `V1.1.1`, translator Abu Bakr Muhammad Zakaria. This is a live provider integration, not an imported corpus. The code's terms URL is a generic provider home page; explicit redistribution, caching, offline, and export permissions still need a documented review.
- **Hadith:** source-gated API and reader are implemented, with source approval, primary/independent narration reviews, and stored-text digest checks. The Hadith source evaluation lists candidates only; no collection/translation is approved or populated for public delivery.
- **Tafsir, duas/adhkar, audio:** no approved source or production API was verified. Audio playback must remain unavailable/disabled.

A checksum is integrity evidence, not a substitute for source identity, independent human review, licensing approval, or scholarly authority.

## 6. Integration release blockers

1. Enforce single-edition Quran selection or implement explicit edition-scoped routes and client contracts.
2. Complete the per-Ayah human review gate and review-workspace PRs with exact-head CI and security review before enabling scripture publication.
3. Acquire and preserve the exact official source artifacts, hashes, license notices, independent source review, and final approval record before import/public display.
4. Obtain explicit QuranEnc translation use/caching/redistribution terms; do not infer permission from API availability.
5. Select and approve Hadith, tafsir, dua, and audio sources independently.
6. Add authentication/session and server-side authorization before private user data or protected write routes.
7. Complete manual responsive, RTL, keyboard, screen-reader, browser, and device QA.
8. Validate hosted PostgreSQL configuration, migration, readiness, backup/restore, and rollback on the actual deployment before production readiness is claimed.

## 7. Integration CI added in this branch

`docs/OPENAPI-DRAFT.yaml` now describes the 12 routes found in main. `scripts/verify-openapi-routes.rb` parses the spec and discovers routes from `backend/src/app.ts` and its registered route plugins. The workflow fails if a backend route is added/removed/renamed without a corresponding OpenAPI path/method update, or if the spec documents a route that is not registered.

The route-parity workflow is newly added in this integration update. Its result must be checked on the exact integration PR head; no pass is claimed until GitHub Actions reports it.
