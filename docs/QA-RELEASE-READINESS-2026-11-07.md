# DEENVERSE — QA & Release Readiness
Date: 2026-11-07 (Asia/Riyadh)

## Executive decision

NO RELEASE. Do not deploy and do not merge a feature PR as a release candidate yet.

The latest main branch is exactly:
- Base/main SHA: a7ad2eb4dae5d2fdcfb682e1747d4b17d56dab29
- Verified by comparing the main ref with that SHA: identical, 0 ahead / 0 behind.
- Latest commit message: feat(integration): reconcile API contract and source selection (#1).
- PR #1 is now represented by the main merge commit; the current main SHA itself has no associated PR-triggered workflow runs returned by the GitHub connector and no combined commit statuses returned. This is not evidence of a failed build; exact-main CI is simply unverified.

No production religious content was imported or enabled. No deployment or merge was performed in this QA run. No agent-owned branch was modified.

## Current API and frontend contract

The current main backend registers ten GET operations:
1. /api/v1/health
2. /api/v1/ready
3. /api/v1/quran/surahs
4. /api/v1/quran/surahs/{surahNumber}
5. /api/v1/ayah/{surah}/{ayah}
6. /api/v1/hadith/books
7. /api/v1/hadith/books/{bookId}/chapters
8. /api/v1/hadith/books/{bookId}/records
9. /api/v1/hadith/records/{recordId}
10. /api/v1/hadith/search

The two public QuranEnc Bengali translation routes are not registered. Audio/reciter, authentication/session, private bookmarks/progress, dua/adhkar, tafsir, admin publishing, and in-app problem-report endpoints are also not registered on main. Current backend routes are public read routes; no authentication or session middleware is implemented for user-specific data.

Frontend adapter inspection:
- src/lib/api-config.ts is the shared API-base resolver. NEXT_PUBLIC_API_BASE_URL is public build-time configuration and must not contain credentials.
- src/lib/content-api-client.ts handles Quran Surah catalogue metadata only; it does not itself publish Ayah text or audio.
- src/lib/quran-ayah-client.ts validates response shape, coordinates, provenance fields, and checksum format. Client validation is not proof of source authenticity or redistribution rights.
- src/lib/hadith-api-client.ts validates Hadith provenance and response shapes.
- The mounted Quran UI on main is an approval-pending placeholder; it makes no scripture or audio fetch. The Hadith reader calls the read API and displays an unavailable/empty state when no approved collection exists.

The OpenAPI route validator passed on PR #82's exact head: 10 paths / 10 operations. This is exact-PR evidence, not a workflow run on the current main SHA.

## Exact-head PR and Actions evidence

All workflow conclusions below were inspected from GitHub Actions job metadata and logs. “0 skipped” is stated only where the backend log explicitly reported it. Audit findings were read from the logs.

### PR #77 — fail-closed Quran reader
- Head: 2a5ff35b34622691bd3eadedb6eb40babb8635a0
- Original base: f098d650a9cbc5aaaaadee6a925e68dfa9dbdb9a
- Compared with current main: diverged; 4 commits ahead / 1 behind; 2 changed files.
- Exact-head Web foundation: https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/42336751738 — PASS; 18 test files / 171 tests; typecheck and production build passed; 0 vulnerabilities.
- Exact-head DEENVERSE CI: https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/42336751740 — PASS; backend 83/83, 0 skipped; PostgreSQL 16 migration/runtime test passed; production SQLite subprocess guard passed; web 18 files / 171 tests; typechecks/builds passed; 0 vulnerabilities.
- Disposition: open draft. Main already contains an equivalent fail-closed Quran placeholder from the integrated mainline work. PR #77 is stale/redundant relative to main; do not merge it without reconciling its branch.

### PR #79 — Bengali/Arabic share-card fonts
- Head: 09470ae8ba1b27678583ae374459a8847f272366 (branch fix/share-card-export-rendering).
- Compared with current main: diverged; merge base f098d650a9cbc5aaaaadee6a925e68dfa9dbdb9a; 136 commits ahead / 1 behind; 47 files in the compare result.
- PR body claims only the Share Cards component and global font imports. The branch compare shows 47 changed files, so its current diff does not match the stated narrow scope. Rebase/reconcile before review or merge.
- Exact-head DEENVERSE CI: https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/42368981912 — PASS; backend 91/91, 0 skipped; PostgreSQL 16 migration/runtime and production SQLite subprocess guard passed; web 18 files / 175 tests; 0 vulnerabilities.
- Exact-head Web foundation: https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/42368981954 — PASS; web 18 files / 175 tests; typecheck/build passed; 0 vulnerabilities.
- Disposition: open; no merge.

### PR #80 — bind Hadith reviews to the record's exact source
- Base: a7ad2eb4dae5d2fdcfb682e1747d4b17d56dab29
- Head: 001673e6c7287e7562fd1fd6d385cc0194cf4e0d
- Compare: 2 commits ahead / 0 behind; 2 files changed.
- Exact-head DEENVERSE CI: https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/42374891938 — PASS; backend 91/91, 0 skipped; PostgreSQL 16 migration/runtime and production SQLite subprocess guard passed; web 18 files / 174 tests; 0 vulnerabilities.
- Latest exact-head Web foundation: https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/42375065375 — PASS; 18 files / 174 tests; typecheck/build passed; 0 vulnerabilities.
- Review value: adds explicit source_id equality for both primary and independent review rows, plus negative tests for mismatched source binding.
- Disposition: open, unmerged; human review still required.

### PR #81 — normalize independent Quran source reviewer identities
- Base: a7ad2eb4dae5d2fdcfb682e1747d4b17d56dab29
- Head: bf5ed09c8c4b5603c40d897ae558e2a7095de396
- Compare: 3 commits ahead / 0 behind; 3 files changed.
- Exact-head DEENVERSE CI: https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/42391454055 — PASS; backend 93/93, 0 skipped; PostgreSQL 16 migration/runtime and production SQLite subprocess guard passed; web 18 files / 174 tests; 0 vulnerabilities.
- Latest exact-head Web foundation: https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/42393827928 — PASS; 18 files / 174 tests; typecheck/build passed; 0 vulnerabilities.
- Review value: applies LOWER(TRIM(...)) to source/approval reviewer identity comparison and reserved-identity rejection, including the Tanzil importer.
- Disposition: open draft; not merged.

### PR #82 — bind Hadith search cursors to exact Unicode query
- Base: a7ad2eb4dae5d2fdcfb682e1747d4b17d56dab29
- Head: da5f6c22d533dd4516aed51f86246667f7abdcc8
- Compare: 3 commits ahead / 0 behind; 3 files changed.
- Exact-head DEENVERSE CI: https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/42393199611 — PASS; backend 91/91, 0 skipped; PostgreSQL 16 migration/runtime and production SQLite subprocess guard passed; web 18 files / 174 tests; 0 vulnerabilities.
- Exact-head OpenAPI validation: https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/42393199733 — PASS; OpenAPI 3.1 YAML, unique keys, local references, and route parity verified at 10 paths / 10 operations.
- Latest exact-head Web foundation: https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/42393831231 — PASS; 18 files / 174 tests; typecheck/build passed; 0 vulnerabilities.
- Review value: prevents replaying a cursor between canonically equivalent but code-point-distinct Bengali/Unicode search strings.
- Disposition: open draft; not merged.

### PR #83 — await service-worker cache persistence
- Base: a7ad2eb4dae5d2fdcfb682e1747d4b17d56dab29
- Head: 0aa23e26dbe4491fce303e1f348f092d65fd5952
- Compare: 2 commits ahead / 0 behind; 2 files changed.
- Exact-head DEENVERSE CI: https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/42394294080 — PASS; backend 91/91, 0 skipped; PostgreSQL 16 migration/runtime and production SQLite subprocess guard passed; web 19 files / 177 tests; 0 vulnerabilities.
- Latest exact-head Web foundation: https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/42394418543 — PASS; 19 files / 177 tests; typecheck/build passed; 0 vulnerabilities.
- Review value: awaits Cache.put for the shell and immutable assets; keeps API, cross-origin, and non-GET requests outside the cache; cache write failures preserve the online response.
- Disposition: open draft; not merged. Offline support remains shell-only; no religious/API/user data is cached.

### PR #69 — public beta reader with raw GitHub fallback
- Head: 5ce130f5e6b312948e3ed0165295572aa509e5e3
- Compared with current main: diverged; 8 commits ahead / 6 behind; 6 changed files.
- No exact-head workflow runs or combined status checks were returned.
- Inspected diff re-adds raw.githubusercontent.com to CSP connect-src and restores a browser fallback that fetches Quran text from the repository and displays it as PUBLIC BETA after a client-side digest comparison.
- A client-side checksum does not prove official artifact acquisition, independent approval, or redistribution rights. The current source register has no completed exact-artifact acquisition and independent review evidence.
- Disposition: open; do not merge or deploy. Keep the raw-GitHub fallback and QuranEnc translation exposure disabled.

## Production PostgreSQL inspection (read-only)

Neon project:
- Project: deenverse-db
- Region: aws-ap-southeast-1
- Project PostgreSQL version: 17.11
- Branch: main (br-spring-night-a14ey96s), state ready, protected=false.
- Database: deenverse.
- The database contains the ten expected content tables and all column names listed in backend/src/db/schema-readiness.ts were present during this inspection.
- Production engine is PostgreSQL 17.11; CI integration service is PostgreSQL 16. Hosted migration/readiness must still be tested through the deployed backend against this actual PG17 database.

Observed project network settings:
- allowed_ips.ips is empty.
- block_public_connections=false.
- protected_branches_only=false.
- The main database branch is not protected.
These settings leave public connection paths enabled and do not enforce branch protection. Tighten network access and protect the production branch before release.

Observed database roles and privileges:
- deenverse_api is not superuser and has no createdb/createrole/replication/bypassrls flags, but it has SELECT, INSERT, UPDATE, and DELETE on every content table, including content_sources, content_source_approvals, quran_ayahs, and all Hadith tables.
- deenverse_owner owns all ten tables and has createdb, createrole, replication, and bypassrls privileges.
- The actual deployed Render DATABASE_URL role could not be confirmed in this run. If the API uses deenverse_api, it can mutate or delete source approvals and religious content; treat this as a release-blocking least-privilege issue until the deployed role is verified and restricted to the minimum required privileges. Migrations/imports should use a separate controlled owner role.

Observed content rows:
- content_sources: 1
- content_source_approvals: 1
- quran_surahs: 0
- quran_ayahs: 0
- hadith_books: 0
- hadith_chapters: 0
- hadith_records: 0
- hadith_translations: 0
- The sole source row is tanzil-uthmani-v1, inactive, with redistribution_allowed=true.
- Its approval decision field is “approved” and its stored digest fields compare equal, but the source reviewer and approval reviewer are both project-owner-chat-authorization. This reserved identity is not independent and is rejected by the source gate. The source is inactive. No Quran or Hadith corpus rows exist.
- Digest-field equality is metadata binding only; the read path does not retrieve and independently re-hash the immutable upstream artifact. No production approval is established by this database row.

No SQL writes, grants, revokes, imports, or data changes were made.

## Security, CORS, and authentication

- Backend CORS uses an exact configured-origin allowlist. Tests prove an allowed origin receives its exact Access-Control-Allow-Origin value and an unlisted origin receives 403 without an allow-origin header. Credentialed CORS is not enabled.
- The backend defaults CORS_ORIGIN to localhost:3000. The production Render CORS_ORIGIN/CORS_ALLOWED_ORIGINS value was not verified because the Render connector requires an explicitly selected workspace; no workspace was selected automatically.
- Browser CSP connect-src is self plus the exact configured API origin, not a wildcard. Security headers include nosniff, frame denial, referrer policy, permissions policy, and COOP. CSP still contains script-src 'unsafe-inline' and style-src 'unsafe-inline'; review nonce/hash options as a hardening task.
- Rate limiting is process-local (default 100 requests / 60 seconds). A multi-instance deployment needs a shared store before relying on a cluster-wide quota.
- No authentication/session endpoints or private-resource authorization exist on main. This blocks private bookmarks/progress, account-bound reports, and admin publishing. Current GET-only public read routes should remain public and must not be mistaken for an authenticated product.
- The GitHub connector did not expose repository branch-protection settings in this inspection. Neon production DB branch protection is explicitly false.

## Content provenance and publication safety

Quran Arabic:
- Main reader is fail-closed and renders no scripture text or audio.
- Both public QuranEnc translation routes are unregistered.
- The Tanzil importer downloads from the official HTTPS Tanzil domain, validates the pinned Uthmani edition, metadata, exact text preservation, 114 Surahs / 6,236 Ayahs, and license-footer shape, then checks for a separate approval bound to text and metadata SHA-256 values.
- The current production source/approval row is inactive and has the reserved same reviewer identity. No Quran corpus rows exist.
- No exact official artifact acquisition, independently recomputed production digest, independent human source review, or final release approval was evidenced in this run.

Bengali translation:
- The Abu Bakr Muhammad Zakaria / QuranEnc client code remains dormant.
- Public translation routes are disabled.
- Explicit web/mobile redistribution, caching, offline, and export rights remain unverified. Do not infer permission from API availability.

Hadith:
- No approved source or Hadith corpus is present in the inspected production database.
- Source approval, exact source binding, dual narration review, and stored-record digest checks are implemented in main; PR #80 adds explicit review-source equality checks.
- No Hadith text or translation may be published until source identity, edition, rights, exact artifact digest, and independent review are evidenced.

Tafsir, duas/adhkar, and recitation audio:
- No approved production source, exact artifact, or use-specific redistribution/streaming/offline permission was verified.
- Keep all such content unavailable. Do not fabricate or seed any religious text.

## RTL, accessibility, responsive UI, and offline

Static source evidence:
- Root document lang is en; Bengali content is explicitly tagged lang=bn and Arabic passages use lang=ar with dir=rtl. Translation direction uses rtl for Arabic and auto otherwise.
- Responsive CSS includes 900px, 680px, 480px breakpoints; mobile navigation, stacked layouts, and reduced-motion handling exist.
- App shell has a skip link, labelled main navigation, selected navigation state, Escape-to-close mobile navigation, and focus restoration. Unit tests cover these states.
- Hadith reader includes labelled controls, Arabic RTL markup, status/error states, and an aria-live result container.
- Main service worker caches only the shell and immutable build/metadata assets; /api/, cross-origin requests, and non-GET requests bypass caching. However, main currently starts Cache.put in a detached promise and can return before the shell/asset is persisted. PR #83 fixes this and adds deterministic tests, but is not merged.
- No Quran, translation, Hadith, audio, API, or user data should be cached offline without explicit content-specific rights.

Not verified manually:
- Browser/device rendering at 320, 360, 390, 768, and 1280px.
- Arabic/Bengali mixed-direction copy/select behavior, 200% zoom/reflow, screen readers, keyboard traversal/focus trapping, contrast, target sizes, and actual offline/restore behavior.
- No browser screenshots, device emulation, VoiceOver, TalkBack, or deployed browser CORS/CSP smoke test were performed.

## Production SQLite guard

The backend entry point rejects production startup unless the resolved database client is PostgreSQL. The subprocess test backend/test/production-startup.test.ts starts a child Node process with NODE_ENV=production, DB_CLIENT=sqlite3, and a temporary DB_FILENAME, then asserts:
- non-zero process exit,
- the explicit “Production requires PostgreSQL” error,
- the SQLite file was never created,
- the backend never reported listening.

The test log line was present and passed in the exact-head backend CI runs for PRs #77, #79, #80, #81, #82, and #83. PostgreSQL 16 migration/runtime integration also passed on those PR heads. This guard has not been re-run on the current main SHA a7ad2eb4dae5d2fdcfb682e1747d4b17d56dab29 because no exact-main Actions run/status was returned. Re-run both on every release candidate; never relax the guard.

## Release blockers and next tasks

P0 — security / data integrity:
1. Confirm which database role the deployed API actually uses. If it is deenverse_api, reduce it to least-privilege read-only grants for current GET routes; keep source approval, import, and migration writes on a separate controlled owner path.
2. Restrict Neon public connectivity with an appropriate allowlist/private connection and protect the production main branch.
3. Merge/review PR #81 reviewer normalization, PR #82 exact Unicode cursor scope, and PR #80 source-bound review checks only after independent review and exact-head CI; rerun CI after any rebase or base update.
4. Keep PR #69 blocked. Do not restore raw GitHub Quran fallback or unapproved translation/audio.
5. Acquire the exact official content artifacts, independently recompute SHA-256, verify source/edition/completeness and use-specific rights, and record qualified independent approval before any publication. Current source row is not valid approval.

P1 — runtime / offline:
6. Review PR #83 and rerun exact-head tests after any update. Then manually test offline shell persistence and confirm API/content data is never cached.
7. Verify Render production DATABASE_URL role, CORS_ORIGIN/CORS_ALLOWED_ORIGINS, NEXT_PUBLIC_API_BASE_URL, deployed /api/v1/ready, migration completion, backups/restore, and shutdown behavior against Neon PostgreSQL 17.11.
8. Obtain an exact-main CI run and record backend/web typecheck, tests, builds, audits, PostgreSQL migration/runtime, and the production SQLite subprocess guard.
9. Rebase PR #79 to current main and confirm its actual changed-file list matches the stated share-card-only scope. Reconcile or close stale PR #77.

P2 — manual product QA:
10. Complete RTL, responsive, keyboard, screen-reader, zoom/reflow, contrast, and offline testing on the declared browser/device matrix.
11. Add authentication/session and server-side authorization only before enabling private user data or write/admin routes. Use a shared rate-limit store before multi-instance production.

## Merge/deployment state and scope of this report

- No merge or deployment occurred during this run.
- PRs #80–#83 remain open and unmerged; PR #77 and #79 remain open; PR #69 remains open but must not merge.
- No production SQL writes or permissions changes were made.
- No agent-owned branches were modified.
- This report is evidence-only and does not authorize a release.


## Documentation drift and migration tracking

The current mainline source was compared with two documents that still contain obsolete snapshots:
- docs/SOURCE-REGISTER.md says main still mounts the raw-GitHub beta reader and says PR #1 is unmerged. Current main a7ad2eb4dae5d2fdcfb682e1747d4b17d56dab29 mounts the fail-closed placeholder, and data/quran/tanzil/quran-uthmani.txt returns 404 (not present on main).
- docs/API-CONTRACT.md still contains a historical section saying main is f098d650a9cbc5aaaaadee6a925e68dfa9dbdb9a, PR #1 is open/unmerged, and pagination cursors are unsigned offsets. Those statements contradict current main and the HMAC/query-bound cursor implementation integrated by PR #1. Treat those sections as stale history, not current implementation evidence. Reconcile these documents in a separate documentation-only change after the release-safety PRs are reviewed.

Migration tracking:
- backend/src/db/migrate.ts uses a custom idempotent schema-introspection runner and a PostgreSQL transaction-scoped advisory lock; it does not create or use the standard knex_migrations/knex_migrations_lock tables.
- The inspected Neon database has all ten required tables and the required column names listed by backend/src/db/schema-readiness.ts. No knex_migrations history table exists. The runtime readiness check validates table/column presence, not exact column types, constraints, migration provenance, or approved content.
- Therefore schema presence is verified, but the precise sequence of migration executions is not recorded in a migration history table. Execute the migration CLI and deployed /api/v1/ready against the actual Neon PostgreSQL 17.11 database during the controlled deployment rehearsal; do not infer successful migration history from table presence alone.

PR #84 report metadata:
- Draft PR: https://github.com/mohammedpalash1990-a11y/Deenverse/pull/84
- Base SHA: a7ad2eb4dae5d2fdcfb682e1747d4b17d56dab29
- Initial report commit SHA: 386159da1358ff1a53d74564b44ce35d200fa61f
- The report branch contains only this QA report file. Exact-head Web foundation run 42396117945 was still in progress at the last poll; typecheck and tests had completed successfully, production build was still running. Do not claim final CI until the run completes.
