# DEENVERSE release-readiness evidence — 2026-11-04

## Decision

**NOT RELEASE READY. Do not merge or deploy.** The current mainline CI is green, but the religious-content publication gate is not yet satisfied, the production backend-to-database connection is unverified, the database network posture is not production-hardened, and several open PRs are stale, stacked, or failing/incomplete.

This is an evidence snapshot, not a content approval. No Quran, translation, Hadith, tafsir, dua, or audio content was imported or edited during this audit. No PR was merged and no deployment was triggered.

## Audit baseline and isolation

- Repository: `mohammedpalash1990-a11y/Deenverse`
- Default branch: `main`
- Exact main baseline: `a7ff4130f6d74e9319b6d894c118d270b44171cd`
- Remote branch count observed: 65
- Open PR count observed: 5
- QA branch created from the exact main baseline: `qa/release-readiness-evidence-20261104`
- No agent-owned branch was modified. In particular, `jules/backend-foundation` and `queen/frontend-foundation` remain untouched.

Relevant branch heads at audit time:

| Branch | Exact head | Relationship to main |
|---|---|---|
| `main` | `a7ff4130f6d74e9319b6d894c118d270b44171cd` | Baseline |
| `integration/platform-foundation` | `0ae72b361772ad667ef4ef94d395eb8e14c9ecfb` | 70 ahead, 0 behind |
| `assistant/api-integration-contract-audit` | `22e90ed26142c5bf6046a80830e08d43a6ec680b` | 1 ahead, 92 behind current integration |
| `feat/quran-per-ayah-review-gate-20261104` | `12c9b3590b1d96274d84039bc29d4314648aa8a6` | 7 ahead, 30 behind main |
| `feat/quran-team-review-links-20261104` | `36054fbb5986b645a87e25fd6bc8e12abaf30762` | 23 ahead of the per-Ayah review branch; stacked |
| `feature/unified-problem-reporting` | `be096ab7161b1336c7351d06f1ffcfc20574d0f2` | 12 ahead, 29 behind main |
| `jules/backend-foundation` | `f84e35c242ab37ccafca0528a1d06e0d4b244834` | 3 ahead, 58 behind main; docs-only delta |
| `queen/frontend-foundation` | `9ef788c81de85e9ebfa139b35c42d606c38f2010` | 2 ahead, 58 behind main; docs-only delta |
| `qa/release-readiness-20261103` | `de26402e7adea2a190fcbfec1197e2a55a64270f` | Older QA branch; not reused |

## Open pull requests

All five PRs were inspected by exact base/head SHA, changed-file list, compare result, and Actions state. All remain unmerged.

### PR #1 — API contract and source selection

- URL: https://github.com/mohammedpalash1990-a11y/Deenverse/pull/1
- Base: `main` at `a7ff4130f6d74e9319b6d894c118d270b44171cd`
- Head: `integration/platform-foundation` at `0ae72b361772ad667ef4ef94d395eb8e14c9ecfb`
- Compare: 70 ahead / 0 behind; GitHub reported mergeable, clean; not merged.
- Changed files (22):
  - `.github/workflows/openapi-contract.yml`
  - `backend/src/services/approved-quran-source.ts`
  - `backend/src/services/quran-ayah.ts`
  - `backend/src/services/quran-catalogue.ts`
  - `backend/test/quran-api.test.ts`
  - `backend/test/quran-ayah.test.ts`
  - `docs/AGENT-HANDOFF-STATUS.md`
  - `docs/API-CONTRACT.md`
  - `docs/AYAH-API-CONTRACT.md`
  - `docs/CONTENT-API-ERROR-MAPPING.md`
  - `docs/CONTENT-API-RESPONSE-PARSING.md`
  - `docs/IMPLEMENTED-API-RECONCILIATION.md`
  - `docs/INTEGRATION-CHECKLIST.md`
  - `docs/INTEGRATION-DECISIONS.md`
  - `docs/OPENAPI-DRAFT.yaml`
  - `docs/PHASE-1-MVP.md`
  - `docs/QA-PLAN.md`
  - `docs/REMAINING-INTEGRATION-WORK.md`
  - `docs/SOURCE-REGISTER.md`
  - `scripts/verify-openapi-routes.rb`
  - `src/lib/quran-translation-client.test.ts`
  - `src/lib/quran-translation-client.ts`
- Review finding: `findSingleApprovedQuranSource` correctly fails closed for zero or multiple active, redistribution-permitted sources with a matching approval digest. It does **not** enforce that the approval reviewer differs from the source reviewer. The per-Ayah human-review table/gate is also not included in this PR. This PR is 70 commits ahead and should be split into smaller reviewable changes before merge.

### PR #11 — API integration gap register

- URL: https://github.com/mohammedpalash1990-a11y/Deenverse/pull/11
- Base: `integration/platform-foundation`; PR base snapshot `eac93a6616e73048ea3787dcced87bc471eb25bc`; current integration head is `0ae72b361772ad667ef4ef94d395eb8e14c9ecfb`.
- Head: `assistant/api-integration-contract-audit` at `22e90ed26142c5bf6046a80830e08d43a6ec680b`
- Compare to current integration: 1 ahead / 92 behind; GitHub reports mergeable, clean; not merged.
- Changed file: `docs/API-INTEGRATION-GAP-REGISTER.md` (102 additions).
- No Actions run was found for this exact head. Rebase or close as superseded after comparing its register with PR #1's integration documentation.

### PR #43 — Per-Ayah human review gate

- URL: https://github.com/mohammedpalash1990-a11y/Deenverse/pull/43
- Base snapshot: `ef559abe96417acd376df60b0f6ef7973bfd28c6`; current main is `a7ff4130f6d74e9319b6d894c118d270b44171cd`.
- Head: `feat/quran-per-ayah-review-gate-20261104` at `12c9b3590b1d96274d84039bc29d4314648aa8a6`
- Compare to current main: 7 ahead / 30 behind; GitHub reports dirty/not mergeable; not merged.
- Changed files (6):
  - `backend/src/app.ts`
  - `backend/src/db/migrate.ts`
  - `backend/src/db/migrations/20261104_000004_quran_ayah_reviews.ts`
  - `backend/src/routes/quran-ayah.ts`
  - `backend/src/services/quran-ayah.ts`
  - `backend/test/quran-ayah.test.ts`
- Positive: the new gate requires a passed Ayah review, a review digest matching the registered source digest, text/boundary checks, and the stored Ayah SHA-256.
- Blocking review findings:
  - Its source query still uses `.first()`; it does not integrate PR #1's exactly-one-approved-source selector.
  - It does not enforce independent source/approval reviewers. Its passing test fixture uses the same `test-reviewer` for source review and source approval.
  - A non-null `second_review_status='passed'` is accepted without selecting or validating `second_reviewer_id` or `second_reviewed_at`.
  - Its `migrate.ts` snapshot omits the current Hadith migration and the current PostgreSQL transaction/advisory-lock migration wrapper. Reconcile with current main before considering it.
  - Its PostgreSQL runtime test teardown does not drop `quran_ayah_reviews` before `quran_ayahs`; the foreign key can make cleanup fail before `db.destroy()`.
- Actions: web foundation run https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/41757958432 passed. Backend CI run https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/41757958528 was retried on this exact head; at audit cutoff its backend job `126726131038` remained in progress at the backend test step. No final test result is claimed.

### PR #45 — Shareable multi-reviewer workspace

- URL: https://github.com/mohammedpalash1990-a11y/Deenverse/pull/45
- Base: `feat/quran-per-ayah-review-gate-20261104` at `12c9b3590b1d96274d84039bc29d4314648aa8a6`
- Head: `feat/quran-team-review-links-20261104` at `36054fbb5986b645a87e25fd6bc8e12abaf30762`
- Compare: 23 ahead / 0 behind its PR #43 base; GitHub reports mergeable but unstable; stacked and not merged.
- Changed files (10):
  - `backend/.env.example`
  - `backend/src/app.ts`
  - `backend/src/db/migrate.ts`
  - `backend/src/db/migrations/20261104_000006_quran_team_reviews.ts`
  - `backend/src/routes/quran-review.ts`
  - `backend/test/quran-review.test.ts`
  - `docs/QURAN-TEAM-REVIEW-GUIDE.md`
  - `src/app/quran/review/[token]/page.tsx`
  - `src/app/quran/review/page.tsx`
  - `src/components/app-shell.tsx`
- Security review: batch creation uses a 32-byte minimum environment token and timing-safe comparison; invitations are separate bearer links. The invite flow binds a submitted display name to an invite, but does not independently authenticate the human or prove reviewer qualifications. Keep this as a controlled internal workflow until identity and reviewer qualification are independently established.
- Actions: backend CI run https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/41760877560 was retried on this exact head; at audit cutoff backend job `126726144050` remained in progress at the backend test step. The web job in that run passed. No final backend test result is claimed.
- It inherits PR #43's stale migration/runtime-test concerns and must not be merged independently of the base review gate.

### PR #47 — In-app problem reporting

- URL: https://github.com/mohammedpalash1990-a11y/Deenverse/pull/47
- Base snapshot: `339d9c66057137ba5d1d1a6ff36232bd32f4cc29`; current main is `a7ff4130f6d74e9319b6d894c118d270b44171cd`.
- Head: `feature/unified-problem-reporting` at `be096ab7161b1336c7351d06f1ffcfc20574d0f2`
- Compare to current main: 12 ahead / 29 behind; GitHub reports dirty/not mergeable; not merged.
- Changed files (9):
  - `backend/src/app.ts`
  - `backend/src/db/migrate.ts`
  - `backend/src/db/migrations/20261104_000004_problem_reports.ts`
  - `backend/src/routes/problem-reports.ts`
  - `backend/test/migrate.test.ts`
  - `backend/test/problem-reports.test.ts`
  - `src/app/globals.css`
  - `src/components/app-shell.tsx`
  - `src/components/settings-panel.tsx`
- Actions: backend run https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/41763195016 failed. The backend job reported 61 passing assertions and 3 failing test entries (the parent suite plus two underlying assertion failures), 0 skipped:
  1. Readiness test expected HTTP 200 but received 503 because its fixture applies the initial, source-approval, and Ayah migrations but not the new `problem_reports` migration now required by readiness.
  2. Problem-report test expected zero rows after the prior test had inserted one; the shared in-memory table is not cleared between tests.
  Typecheck passed; build and dependency audit did not run after the test failure. Web checks passed in https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/41763211812.
- The PR's `migrate.ts` snapshot also omits the current Hadith migration and current PostgreSQL transaction/advisory-lock wrapper. The public POST route has validation and global rate limiting but no user authentication or abuse/identity controls. Rebase, fix test isolation/readiness setup, and reconcile migrations before review.

## Mainline Actions evidence

Exact main SHA: `a7ff4130f6d74e9319b6d894c118d270b44171cd`

- DEENVERSE CI: https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/41812199822
- Backend job `126513947551`: typecheck/build/dependency audit passed; **81 tests passed, 0 failed, 0 skipped**.
- Web job `126513948330`: typecheck/production build/dependency audit passed; **18 test files, 171 tests passed**.
- The PostgreSQL 16.15 CI service test passed: migrations ran twice safely and a production-mode backend process connected to PostgreSQL and returned ready.
- The subprocess test `production backend startup fails closed before opening a SQLite database` passed. The production migration CLI also rejects SQLite.
- Backend and web dependency audits each reported 0 vulnerabilities.

## Integration branch Actions evidence

Exact PR #1 head SHA: `0ae72b361772ad667ef4ef94d395eb8e14c9ecfb`

- DEENVERSE CI: https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/41839209748
  - Backend: typecheck/build/audit passed; **83 passed, 0 failed, 0 skipped**.
  - Web: typecheck/production build/audit passed; **18 test files, 174 tests passed**.
  - PostgreSQL runtime/migrations test passed.
  - Production SQLite subprocess guard passed.
  - Backend and web dependency audits each reported 0 vulnerabilities.
- Web foundation: https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/41839209867 — **18 files, 174 tests passed**, build and audit passed.
- OpenAPI contract: https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/41839209842 — OpenAPI 3.1 YAML, unique keys, local references, and backend route parity verified for **12 paths / 12 operations**. This validator verifies route parity, not full request/response schema conformance.
- These results are for the exact integration head above, not for the per-Ayah or team-review PR heads.

## Backend API and frontend adapter contract

The current main REST paths and clients align for the implemented read APIs:

| Backend route | Frontend client | Result |
|---|---|---|
| `GET /api/v1/quran/surahs?limit=&cursor=` | `createRestContentSource.list` | Aligned |
| `GET /api/v1/quran/surahs/:surahNumber` | `createRestContentSource.getById` | Aligned |
| `GET /api/v1/ayah/:surah/:ayah` | `createQuranAyahClient.getAyah` | Aligned |
| `GET /api/v1/translation/bn/:surah/:ayah` | `createQuranBengaliTranslationClient.getAyah` | Aligned |
| `GET /api/v1/hadith/books` | `createHadithClient.listBooks` | Aligned |
| `GET /api/v1/hadith/books/:bookId/chapters` | `createHadithClient.listChapters` | Aligned |
| `GET /api/v1/hadith/books/:bookId/records` | `createHadithClient.listRecords` | Aligned |
| `GET /api/v1/hadith/records/:recordId` | `createHadithClient.getRecord` | Aligned |
| `GET /api/v1/hadith/search` | `createHadithClient.search` | Aligned |

The backend also has a full-Surah Bengali translation route; main's frontend client currently consumes the Ayah route only. PR #1 adds full-Surah client support and tests.

Cursor/data-integrity observations:

- Backend cursor is a canonical base64-encoded non-negative offset, not a signed or query-bound token. A client can construct a valid offset; this is pagination, not an authorization boundary.
- Backend validation rejects malformed/non-canonical/unsafe offsets. Frontend catalogue adapter rejects duplicate record IDs and repeated cursors and validates the response envelope/provenance.
- Do not describe this offset cursor as cryptographically tamper-proof or opaque in the security sense. A signed/query-bound cursor is a future hardening option if strict cursor integrity is required.

Documentation drift:

- `docs/CONTENT-SOURCE-APPROVAL.md` says no public Ayah retrieval endpoint is implemented, but main registers `GET /api/v1/ayah/:surah/:ayah` and the frontend calls it.
- `docs/API-CONTRACT.md` correctly notes that digest-string equality is not independent verification of the original source artifact.
- PR #1's OpenAPI check verifies registered paths/operations only; add response/request schema assertions if full contract conformance is required.

## Religious-content provenance and publication gate

### Tanzil Quran Arabic

- Official terms: https://tanzil.net/download/
- Tanzil permits verbatim copying/distribution for website/application use with clear source attribution and a link to Tanzil; changing the text is not permitted.
- Repository dossier `docs/TANZIL-SOURCE-DOSSIER.md` explicitly says the source remains **CANDIDATE — NOT APPROVED FOR PUBLICATION OR IMPORT** and that no original artifact has been acquired, preserved, or independently hashed in this workflow.
- The importer re-downloads the official Tanzil text and metadata, computes SHA-256, validates exact text/metadata, and requires an independent approval bound to both digests before import. It rejects the owner-chat authorization sentinel and rejects source/approval reviewer identity reuse.
- Live Neon row inspection (read-only):
  - Source ID: `tanzil-uthmani-v1`
  - Registered checksum: `ac0724796cbbda0f4801470fbbd11d0f3c5802067bae0493466d0128b0c667af`
  - Approval digest: same value; database equality is true.
  - Source reviewer and approval reviewer are both `project-owner-chat-authorization`.
  - Decision is `approved`, but source is `is_active=false`.
- This is **not** a valid independent approval and the registered checksum is not proof that the original official artifact was acquired or re-hashed. The importer's independent-review check would reject this row. Do not activate it or import/publish content.
- Live database has **0 Quran Surah rows and 0 Quran Ayah rows**. No Quran text was observed in the database.

### Per-Ayah review

- Main's `QuranAyahService` checks active source metadata, approval digest string equality, and each stored Ayah's text SHA-256.
- Main does not require a `quran_ayah_reviews` record before returning an Ayah.
- The required per-Ayah review protocol says no Ayah has been human-approved. The review table exists only on PR #43, not on main or the live Neon schema.
- PR #43 is not merge-ready and its current test fixture accepts the same source reviewer and source-approval reviewer. The review gate must be reconciled with PR #1's single-source selector and must enforce independent reviewer identities at the server boundary.

### Bengali translation

- Official QuranEnc API and republication terms: https://quranenc.com/en/home/api/
- The official page permits translation re-publication subject to no modification, clear publisher/source attribution, version disclosure, preservation of transcript information, notification of notes, updates, and no inappropriate ads.
- Main pins `bengali_zakaria` at `V1.1.1`, checks the official edition list and requested Surah/Ayah coordinates, returns publisher translation and footnotes unchanged, and includes publisher, translator, source title, version, source URL, and terms URL in provenance.
- This is a live external API integration, not a local `content_source_approvals` row or immutable local artifact digest. Decide explicitly whether the provider's published terms plus pinned version/provenance satisfy the source-approval policy, or whether translation sources must also be registered and digest-bound locally. The current `termsUrl` points to the general QuranEnc home page rather than the API terms page above.

### Hadith, tafsir, duas, audio

- Hadith source evaluation document states no provider/dataset is approved.
- Live Neon database contains **0 Hadith books, 0 chapters, 0 Hadith records, 0 translations, 0 grading assessments, and 0 review rows**.
- Hadith schema/service requires source approval, exact source digest equality, record text SHA-256, and primary plus independent review records with distinct reviewer IDs. No real Hadith corpus is loaded.
- No tafsir or dua corpus/API was found in the current backend. Audio playback is intentionally disabled; no audio source/license is registered.
- No generated or synthetic religious content was found in the live database. Test fixtures are synthetic and remain in tests only.

## PostgreSQL runtime and database inspection

A managed PostgreSQL database exists, but production service wiring is not verified.

- Neon project: `deenverse-db` (`cool-mud-31679014`)
- PostgreSQL version: 17
- Default branch: `main` (`br-spring-night-a14ey96s`), state ready, **protected=false**
- Endpoint: `ep-lucky-frog-a1a3ys0c.ap-southeast-1.aws.neon.tech`, state active at inspection
- Database: `deenverse`
- Read-only schema inspection found 10 tables and all required columns declared by main's `REQUIRED_SCHEMA_COLUMNS`.
- No `knex_migrations` or migration-history table exists; main's custom runner is idempotent but the database does not provide a migration ledger.
- No `quran_ayah_reviews` or `problem_reports` table exists on this branch.
- Project settings: no IP allow-list (`allowed_ips.ips=[]`), `block_public_connections=false`; endpoint reports `passwordless_access=true` and `pooler_enabled=false`. Review and harden these settings before production use.
- CI verifies PostgreSQL 16.15 migrations and production process startup. The live Neon database is PostgreSQL 17, and the production backend has not been proven to connect to it or pass `/api/v1/ready`.
- Render service/environment wiring was not inspected because no Render workspace was selected for this run. Do not infer that `DATABASE_URL` is configured in a production service.

The production SQLite guard is present in `backend/src/index.ts` and the production migration CLI. The subprocess test verifies that production startup with SQLite exits non-zero, creates no SQLite file, and never starts listening. It passed on main and PR #1 exact heads. Keep this test mandatory on every release candidate.

## Security, RTL, accessibility, responsive UI, and offline behavior

- Backend CORS uses an exact configured-origin allow-list; no credentialed CORS is enabled. CORS tests passed on main and PR #1. Public read routes have no user-session authentication, which is consistent with the current public read-only surface; do not add user-specific or administrative writes without explicit authentication/authorization.
- Backend uses Helmet and a global rate limit. Error responses hide internal 5xx diagnostics.
- Frontend CSP restricts sources but permits `unsafe-inline` scripts/styles; the security document records this as a compatibility baseline. HSTS is deferred until the production HTTPS domain is confirmed. Deployed CDN/header behavior has not been checked.
- Arabic Ayah text is rendered with `lang="ar" dir="rtl"`; Bengali text is labelled `lang="bn"`; root document language is English. The shell includes a skip link, navigation labels, live status regions, Escape handling for the mobile menu, and focus restoration.
- Responsive CSS includes narrow-screen breakpoints. CI is unit/build coverage, not a manual mobile/tablet matrix or screen-reader audit. No automated axe/Playwright accessibility run was found.
- The service worker caches the app shell and immutable/static assets only; it explicitly bypasses `/api/` responses. Offline reading of Quran/Hadith content is therefore not implemented, which avoids caching unapproved or unlicensed religious text. Offline mode currently means shell-only fallback.

## Required next tasks

1. Reconcile PR #1 into smaller reviewable PRs. Keep its exactly-one-approved-source selector, but enforce independent source reviewer and approval reviewer identities at the API gate.
2. Rebase PR #43 on current main and PR #1's selector. Preserve the Hadith migration/routes, PostgreSQL transaction and advisory lock, schema readiness, and production guard. Require a matching passed Ayah review and validate reviewer identities/second-review metadata. Fix PostgreSQL test teardown to drop dependent review tables before parent tables and always destroy the pool in a nested `finally`.
3. Rebase PR #45 after PR #43; independently authenticate/qualify reviewers rather than treating a display name plus bearer invite as proof of identity. Re-run complete CI.
4. Rebase PR #47 on current main. Update readiness test to apply all migrations (including `problem_reports`), isolate test rows, preserve current Hadith migrations/routes and PostgreSQL transaction/lock behavior, and add abuse controls for the public report endpoint.
5. Acquire the exact official Tanzil artifact into controlled read-only storage, recompute text and metadata digests, preserve the license notice, record the real reviewer identities, and complete the full source/edition/coverage and per-Ayah human-review process. Do not import until independent approval is valid.
6. Decide whether QuranEnc's official republication terms and pinned live version are an approved exception to the local digest-bound source register; align the terms URL and displayed provenance with the official API terms.
7. Approve and register a Hadith source and its Arabic/translation artifacts before importing anything. Keep tafsir, dua, and audio unavailable until their own provenance and redistribution rights are approved.
8. Select the intended Render workspace, verify the deployed backend's `DATABASE_URL`, run the current migration command against the intended PostgreSQL runtime under an approved change window, and verify production `/api/v1/ready`. Do not run migrations against production from this audit.
9. Protect the Neon branch, restrict inbound database access, review passwordless access, and decide whether connection pooling is required. Verify deployed security headers and add browser/device/screen-reader/offline acceptance tests.
10. Re-run focused tests and full CI on every rebased candidate SHA. Merge/deploy only when source approval, per-Ayah review, security, typecheck, tests, and all required Actions checks are green.

## Changes made by this QA run

- New file only: `docs/RELEASE-READINESS-2026-11-04.md`
- QA branch base SHA: `a7ff4130f6d74e9319b6d894c118d270b44171cd`
- No application code, agent branch, source data, Neon schema/data, or deployment was changed.
- This report is intended to be the next-run evidence baseline. Refresh exact branch heads and Actions states before resuming; the two PR #43/#45 backend reruns were still in progress at this report's audit cutoff.
