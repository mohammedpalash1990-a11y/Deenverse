# DEENVERSE — Integration review (2026-11-08)

## Release decision

**NO RELEASE.** This review made documentation-only changes on `integration/platform-foundation`. It did not merge, deploy, alter a database, import content, or change any secret.

## Exact repository snapshot

- Current `main`: `aa6e283de36a72d56f347dc474d9f29f92286fc8` — commit message `fix(hadith): bind reviews to exact source`.
- `main` includes the merged integration PR #1 at `a7ad2eb4dae5d2fdcfb682e1747d4b17d56dab29` and the Hadith record-source binding from PR #80 in `aa6e283...`.
- Previous integration baseline before this run: `ae3af983e812e3b121e1d0578562d142d8b2e1f2`. After this run's documentation commits, the pre-correction compare snapshot reported `integration/platform-foundation` 9 commits ahead / 1 behind `main`, with merge base `a7ad2eb4dae5d2fdcfb682e1747d4b17d56dab29`; the last commit at that snapshot was `80e9078b2a72a9acd751172344f648e1de51bf26`. The compare connector does not return the current head SHA; re-fetch the branch ref before any merge decision.
- The compare result still lists the PR #80 Hadith service/test paths, but their blob SHAs are identical on `main` and `integration/platform-foundation` (`8e192da5842c6a4e6e7042def6f7ea71432bbd78` and `c94decf8f03ce1ec3b3f7fc9b1c122ed4499f317`). These are already-integrated code, not a functional delta. Because the branch is squash-merge-diverged, a new PR before a normal branch synchronization would replay historical changes; no new PR was opened.
- `jules/backend-foundation`: 3 commits ahead / 71 behind `main`; branch-specific diff is only `AGENT_TASK.md` and `JULES_NEXT_TASK.md`.
- `queen/frontend-foundation`: 2 commits ahead / 71 behind `main`; branch-specific diff is only `AGENT_TASK.md`.
- Neither named assignment branch contains implementation code in its current diff. No agent is reported as currently working without implementation commits or an open implementation PR.

### Actual merged work elsewhere in main

- PR #18 integrated the reviewed backend foundation; main contains commit `da49dfe07f5896f90eab46af3a85b08e8eb56aa5`. This is mainline implementation evidence, not proof that the current named Jules branch contains code.
- PR #16 explicitly integrated Queen's frontend accessibility contribution; main contains commit `96ebb8e717134769ca07b183bb4f8d4e047877e2`.
- PR #17 integrated the typed Quran catalogue REST adapter; main contains commit `31f4797e2e49dedf1361cc93af117b7e6d072892`.
- PR #1 is merged at `a7ad2eb...`; PR #80 is closed/merged and its exact source-binding change is present in `aa6e283...`.

## Selected stack

The stack is selected and present in the repository; it is not an unresolved blocker.

- Web: Next.js 15.5.28, React 19.1.2, TypeScript 5.8.3, Vitest 5.1.0.
- Backend: Node.js 22, TypeScript, Fastify 5.2.1, Knex 3.1.x, Zod 4.6.7.
- Persistence: PostgreSQL for production; SQLite for local/test use; PostgreSQL 16 in CI.
- Package manager: npm with committed lockfiles; CI uses locked installs.

## Current implemented HTTP contract

The current main backend registers exactly ten GET operations:

1. `/api/v1/health`
2. `/api/v1/ready`
3. `/api/v1/quran/surahs`
4. `/api/v1/quran/surahs/{surahNumber}`
5. `/api/v1/ayah/{surah}/{ayah}`
6. `/api/v1/hadith/books`
7. `/api/v1/hadith/books/{bookId}/chapters`
8. `/api/v1/hadith/books/{bookId}/records`
9. `/api/v1/hadith/records/{recordId}`
10. `/api/v1/hadith/search`

The two former QuranEnc Bengali translation routes are not registered. Audio/reciter, authentication/session, private bookmarks/progress, dua/adhkar, tafsir, admin publishing, and problem-report submission are not registered on main. Do not describe any of these as live backend features.

Success responses use `{ meta: { requestId, nextCursor? }, data }`; errors use `{ error: { code, message, requestId, details, retryable } }`. Pagination uses opaque HMAC-SHA-256 signed cursors. Current Hadith search scope binds the NFC-normalized query, locale, and page size.

## Frontend adapter reconciliation

- `src/lib/api-config.ts` is the shared API-base resolver. `NEXT_PUBLIC_API_BASE_URL` is public build-time configuration; the default is same-origin `/api/v1`. The resolver rejects credentials, query strings, fragments, control/whitespace, and ambiguous URL forms. CSP uses only the resolved external origin.
- `src/lib/content-api-client.ts` reads Quran Surah metadata list/detail only, validates provenance/envelopes, follows opaque cursors, and rejects duplicate records/cursor loops.
- `src/lib/quran-ayah-client.ts` is the single-Ayah read adapter with coordinate, provenance, checksum-shape, and safe-error validation. The mounted Quran UI on main remains approval-pending and does not fetch/render Quran text or audio.
- `src/lib/hadith-api-client.ts` reads books, chapters, records, and search results with provenance and envelope validation.
- `src/lib/quran-translation-client.ts` is dormant code. It is not backed by a registered public translation route and must not be treated as an available feature.
- Existing targeted tests cover shared API configuration, catalogue pagination/detail/error handling, Ayah coordinate/provenance handling, and Hadith response/cursor handling. This review did not execute those tests locally.

## Open PR review

| PR | Current disposition | Review result |
|---|---|---|
| #81 — normalize Quran reviewer identities | Open draft | Security fix is valid. Current main selector still uses case/whitespace-sensitive reviewer comparison and exact reserved-identity checks. PR adds `LOWER(TRIM(...))` checks and regression tests. Re-run exact-head CI after updating its base. |
| #82 — exact Unicode Hadith search cursor | Open draft | Fix is valid. Current route NFC-normalizes cursor scope while the search predicate uses the trimmed input; canonically equivalent but code-point-distinct Bengali strings can share a cursor scope. PR binds the cursor to the exact validated query and tests a Bengali normalization pair. |
| #83 — await service-worker cache persistence | Open draft | Fix is valid. Main currently starts `Cache.put()` without awaiting it; PR awaits writes while preserving the online response on storage failure and bypassing API/cross-origin/non-GET requests. Tests verify awaited shell/asset writes and API bypass. Add an explicit rejected-cache-write regression test as a non-blocking coverage improvement. |
| #84 — 2026-11-07 QA report | Open draft | The report is stale relative to current refs: it still describes main as `a7ad2eb...` and PR #80 as open/unmerged, while current main is `aa6e283...` and PR #80 is closed with its source-binding code present. Do not use its old merge-state snapshot without reconciliation. |

### Exact-head CI evidence for the open implementation PRs

- PR #81 head `bf5ed09c8c4b5603c40d897ae558e2a7095de396`: DEENVERSE CI #42391454055 passed (backend 93/93; PostgreSQL 16 migration/runtime; production SQLite startup guard; web 174 tests; high-severity audits reported zero vulnerabilities). Web foundation #42393827928 passed.
- PR #82 head `da5f6c22d533dd4516aed51f86246667f7abdcc8`: DEENVERSE CI #42393199611 passed (backend 91/91; PostgreSQL 16; SQLite startup guard; web 174 tests; zero high-severity vulnerabilities). OpenAPI #42393199733 passed with 10 paths / 10 operations. Web foundation #42393831231 passed.
- PR #83 head `0aa23e26dbe4491fce303e1f348f092d65fd5952`: DEENVERSE CI #42394294080 passed (backend 91/91; PostgreSQL 16; SQLite startup guard; web 177 tests; zero high-severity vulnerabilities). Web foundation #42394418543 passed.
- PR #80 code head `001673e6c7287e7562fd1fd6d385cc0194cf4e0d`: DEENVERSE CI #42374891938 passed (backend 91/91; web 174 tests); Web foundation #42375065375 passed. Its source-binding change is now in current main.
- PR #84 initial report commit `386159da1358ff1a53d74564b44ce35d200fa61f`: Web foundation #42396117945 passed (174 tests). The later documentation amendment has no exact-head run recorded.

The current main SHA `aa6e283...` returned no workflow runs from the PR-run endpoint and no combined commit statuses from the status endpoint. This means exact-main CI is unverified by this inspection; it does not mean CI failed.

## CI trigger behavior

- `.github/workflows/ci.yml` runs on pull requests only when backend, web source, public assets, package/config, or the workflow itself changes; it also runs on qualifying pushes to main and on manual dispatch. A docs-only PR does not trigger full DEENVERSE CI.
- `.github/workflows/web-foundation.yml` runs on pull requests targeting main or integration, so it should run for this documentation PR.
- `.github/workflows/openapi-contract.yml` runs for OpenAPI spec, route-validator, or backend route changes. Documentation-only edits to `API-CONTRACT.md` do not trigger route-parity validation.
- This report does not claim local shell execution or a fresh Actions run for its documentation-only commits.

## Content authenticity and release gates

No Quran Arabic, Hadith, Bengali translation, tafsir, dua, or recitation-audio corpus was fabricated, imported, or approved by this review. Keep all unapproved content unavailable.

Still required before publication:
1. Acquire the exact immutable publisher artifact and preserve original bytes, edition/options, retrieval timestamp, and license notice.
2. Independently recompute artifact and metadata SHA-256 values; do not treat database checksum-field equality as proof of upstream authenticity.
3. Obtain qualified independent source review and the required per-Ayah human review before Quran Arabic publication.
4. Verify QuranEnc / Abu Bakr Muhammad Zakaria translation permissions for web, mobile, hosting, redistribution, caching, offline use, and export before enabling translation.
5. Approve each Hadith collection/edition, grading provenance, attribution, and redistribution rights independently.
6. Approve tafsir, dua/adhkar, and each reciter/recording's streaming, download, caching, and offline terms.
7. Complete production PostgreSQL migration/readiness, backup/restore, rollback, secret-store, least-privilege, and deployed CORS/CSP verification.
8. Complete manual RTL, keyboard, screen-reader, responsive, zoom/reflow, and real-device/offline QA.

### Production database findings carried from draft QA PR #84

The draft QA report records a read-only inspection of Neon PostgreSQL 17.11: public network connections were enabled, the main database branch was not protected, and the `deenverse_api` role had DML privileges on content and approval tables. The deployed Render `DATABASE_URL` role was not confirmed. No SQL writes or grants/revokes were made in that report. Treat these as reported findings requiring direct operational confirmation and remediation before release, not as changes performed in this integration review.

## Exact scope of this review

Documentation-only. No code, schema, production data, secrets, source artifacts, or deployment settings were changed. No merge or deployment was performed.
