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


## OpenAPI validator hardening — 2026-11-04

The first route-parity workflow passed on the exact sync head. The validator is now being hardened to reject duplicate YAML mapping keys and unresolved local component references before comparing all documented path/method pairs with the backend route registrations. The duplicate `SurahPage` schema key was removed. The hardened version requires a fresh exact-head Actions run; no pass is claimed for it yet.


## Integration follow-up — 2026-11-04

**Verified implementation code head:** `b3c890be21f8a9e33a9174d39a6cbaf13bdf21c4` on `integration/platform-foundation`. After documentation-only evidence updates, the branch head was `839b29a3bf409c13d40336d18210d6cb7a9bd391`, 69 commits ahead / 0 behind `main` at `a7ff4130f6d74e9319b6d894c118d270b44171cd`. Main was not modified.

### Current workstream evidence

- `jules/backend-foundation`: 3 ahead / 58 behind main; only `AGENT_TASK.md` and `JULES_NEXT_TASK.md` differ.
- `queen/frontend-foundation`: 2 ahead / 58 behind main; only `AGENT_TASK.md` differs.
- These exact assignment branches contain no implementation source. Merged PRs elsewhere are present in main, but they are not evidence that either named assignment branch contains code or that those agents authored the merged work.

### Cross-cutting implementation on this branch

- Added `backend/src/services/approved-quran-source.ts`; it returns a source only when exactly one active, redistribution-permitted Quran source has a matching approved decision.
- Both `QuranCatalogueService` and `QuranAyahService` now use the shared selector. Zero or multiple eligible sources fail closed. Ayah source metadata is validated before checking whether the requested Surah exists.
- Catalogue provenance now preserves the source reviewer's `reviewer` / `reviewedAt` separately from the approval authority and approval timestamp.
- Added regression tests for ambiguous source sets in both catalogue and Ayah APIs and for the catalogue provenance distinction.
- Added `getSurah()` to the Bengali translation client for `GET /api/v1/translation/bn/{surahNumber}`. It validates the envelope, requested Surah, ordered Ayah coordinates, exact pinned provider edition, and matching provenance across the parent and each row.
- Bengali translation client errors now use the shared safe error mapper; server-supplied diagnostic messages are not displayed.
- Fixed the OpenAPI validator crash observed in run #41835304798: Psych scalar AST nodes may have `children == nil`; the recursive duplicate-key checker now guards that case.
- Updated the Ayah contract and OpenAPI description to document the single-eligible-edition rule. Updated error mapping, response parsing, checklist, and remaining-work documentation.

### Exact-head CI evidence

All runs below target code head `b3c890be21f8a9e33a9174d39a6cbaf13bdf21c4`:
- DEENVERSE CI #41838270768 — backend and web jobs passed. Both used locked installs; typecheck, tests, production builds, and `npm audit --audit-level=high` passed.
- Web foundation #41838270665 — `npm ci`, dependency audit capture, typecheck, tests, and production build passed.
- OpenAPI contract validation #41838270690 — passed.
- Push-triggered OpenAPI contract validation #41837800895 — passed.

The earlier failure #41835304798 was a validator implementation bug, not an OpenAPI route mismatch. It is fixed. Later exact-head verification on `839b29a3bf409c13d40336d18210d6cb7a9bd391` passed DEENVERSE CI #41838823799, Web foundation #41838823586, and OpenAPI validation #41838823872.

### Still not verified / not enabled

- The source approval digest comparison is still metadata equality; the backend does not independently download and hash an immutable upstream artifact.
- No exact Tanzil artifact, independent scholarly review, or per-Ayah human approval is recorded as complete. PR #43 and dependent PR #45 are still open; neither is an active merged publication gate.
- QuranEnc's terms for redistribution, caching, offline use, and export remain unresolved.
- Hadith source candidates are not approved/populated for public delivery. Tafsir, dua/adhkar, and audio source/API work remains unverified.
- Authentication, sessions, private bookmarks/progress, protected writes, manual RTL/keyboard/screen-reader/device QA, and hosted PostgreSQL operations remain release blockers.

No Quran Arabic, Hadith, translation, tafsir, dua, or audio corpus was imported or fabricated by this integration update. CI success is software verification only; it is not religious-content approval.


## Current route and adapter reconciliation — 2026-11-09

**Main baseline:** `f15e82748f1724d5995fe863e54d178a8a22b2b7`.

The active registration in `backend/src/app.ts` and the OpenAPI snapshot contain ten GET operations:

| Method | Route | Frontend adapter / consumer |
|---|---|---|
| GET | `/api/v1/health` | deployment liveness |
| GET | `/api/v1/ready` | deployment readiness |
| GET | `/api/v1/quran/surahs` | `src/lib/content-api-client.ts` |
| GET | `/api/v1/quran/surahs/{surahNumber}` | `src/lib/content-api-client.ts` |
| GET | `/api/v1/ayah/{surah}/{ayah}` | `src/lib/quran-ayah-client.ts` |
| GET | `/api/v1/hadith/books` | `src/lib/hadith-api-client.ts` |
| GET | `/api/v1/hadith/books/{bookId}/chapters` | `src/lib/hadith-api-client.ts` |
| GET | `/api/v1/hadith/books/{bookId}/records` | `src/lib/hadith-api-client.ts` |
| GET | `/api/v1/hadith/records/{recordId}` | `src/lib/hadith-api-client.ts` |
| GET | `/api/v1/hadith/search` | `src/lib/hadith-api-client.ts` |

Quran catalogue, Ayah, and Hadith adapters resolve the API origin through `src/lib/api-config.ts`. The default is same-origin `/api/v1`; `NEXT_PUBLIC_API_BASE_URL` must not contain secrets. The translation route module is not registered, both public QuranEnc paths are absent, and the translation client remains dormant. No active audio/reciter, auth/session, bookmark/progress, dua, tafsir, admin-publishing, or problem-report route is registered.

Hadith record review rows are source-bound in main after merged PR #80. The integration candidate additionally ports the exact-query cursor change from PR #86, Quran reviewer-identity normalization from PR #85, and awaited service-worker cache persistence from PR #87. Those candidate changes require a combined exact-head CI run before acceptance.


## Current mainline API and release snapshot — 2026-11-13

**Main SHA:** \`9042d546d82a6a175f4d07235b780af50e19e5cf\`. The registered backend boundary now contains ten GET operations plus one POST support-report operation. The 10 GET routes are health, readiness, Quran Surah list/detail, one Ayah read, and five Hadith operations. QuranEnc translation routes remain unregistered; there are no audio, reciter, authentication/session, bookmark/progress, dua, tafsir, or admin-publishing routes.

- \`POST /api/v1/problem-reports\` accepts validated app/support reports. It is globally rate-limited, stores reports in a separate table, and does not mutate Quran, Hadith, translation, grading, review, or publication tables. Optional browser/device diagnostics are sent only after explicit user consent. The SettingsPanel uses the shared \`resolveApiBaseUrl()\` resolver; no hard-coded Render host is used.
- The support-report endpoint is not an authentication system or staff workflow. There is no authenticated inbox/list/assignment/notification route.
- PR #115 adds mobile navigation focus containment and page isolation; PR #117 requires explicit production CORS origins and validates exact HTTP(S) origins. Both are merged. Current main push CI run [#43412747653](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/43412747653) passed backend and web typecheck, tests, builds, and dependency audits.
- Main remains unprotected. Only PRs #79 and #11 are open; both target the stale integration branch and are not mergeable as-is.

The API route and code-level checks do not establish production readiness. Neon lacks the required quran_ayah_reviews and problem_reports tables; all Quran/Hadith content tables are empty. No official immutable Quran artifact with a matching independently recomputed digest, qualified independent reviewer approval, or Hadith source dossier is verified. Render runtime/CORS/deploy state, authentication, and manual RTL/accessibility/device QA remain unverified or blocked.
