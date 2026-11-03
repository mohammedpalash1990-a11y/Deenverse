# DEENVERSE Release Readiness Evidence — 2026-11-03

**Disposition: BLOCKED — no merge or deployment authorized.**

This report records repository evidence for the release-readiness pass on 2026-11-03. It is a point-in-time snapshot; re-check every SHA and workflow before a later release decision.

## 1. Canonical repository state

- Repository: `mohammedpalash1990-a11y/Deenverse`
- Default branch: `main`
- Audited main SHA: `6a1beb1c90aa7d195e8081ca1157649fae4dd305`
- Main commit: `fix(backend): fail closed on production SQLite startup (#20)`
- Main commit date: 2026-11-03 11:20:17 UTC
- Main branch metadata reports `protected: false`; required status checks are `enforcement_level: off`, with no required contexts. GitHub branch-protection detail endpoint was not accessible to this integration, so this statement is limited to the branch response.
- No source, deployment, or merge changes were made directly to `main`.

Main exact-SHA CI:
- Workflow run [41626698190](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/41626698190) — success.
- Backend job [125885731742](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/41626698190/job/125885731742): typecheck passed, 48 tests passed / 0 failed / 0 skipped, build passed.
- Web job [125885731461](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/41626698190/job/125885731461): typecheck passed, 10 test files / 62 tests passed, build passed.
- Backend test log includes the production SQLite subprocess rejection test. It does not include a PostgreSQL service test on this main SHA.

## 2. Open pull requests and exact branch relationships

### PR #22 — PostgreSQL runtime configuration

- PR: [#22](https://github.com/mohammedpalash1990-a11y/Deenverse/pull/22)
- Base: `main` at `6a1beb1c90aa7d195e8081ca1157649fae4dd305`
- Head: `integration/postgres-runtime-support` at `51b8735f6b3f39a659e4eb15a9e95d31076006c4`
- Compare: 6 commits ahead, 0 behind.
- State: open, GitHub reports mergeable; not merged.
- Changed files: `backend/.env.example`, `backend/CONFIGURATION.md`, `backend/src/db/migrate.ts`, `backend/src/index.ts`, `backend/test/production-startup.test.ts`.
- CI [41627796874](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/41627796874): backend typecheck/build passed, 48 tests passed / 0 failed / 0 skipped; web typecheck/build passed, 62 tests passed.
- Separate web foundation run [41627796745](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/41627796745) passed its web checks and reported 0 vulnerabilities for the root web dependency tree. That is not a backend dependency audit and is not a PostgreSQL integration test.
- PR #22's own CI does not start PostgreSQL. Its passing backend suite is SQLite-backed. Therefore its green CI alone did not prove PostgreSQL migration/runtime behavior.

### PR #23 — isolated PostgreSQL and content-integrity QA

- PR: [#23](https://github.com/mohammedpalash1990-a11y/Deenverse/pull/23)
- Base: `integration/postgres-runtime-support` at `51b8735f6b3f39a659e4eb15a9e95d31076006c4` (the exact PR #22 head).
- Head: `qa/postgres-runtime-verification-20261103` at `e5b879c76b6fd2e6e661b1aa5871f20bfd151ba7`.
- Compare: 4 commits ahead, 0 behind.
- State: open, GitHub reports mergeable; not merged.
- Changed files:
  - `.github/workflows/ci.yml`
  - `backend/test/postgres-runtime.test.ts`
  - `backend/test/source-approval-integrity.test.ts`
- Exact-head workflow [41680067955](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/41680067955): **failure**.
- Backend job [126071059788](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/41680067955/job/126071059788): typecheck passed; 52 tests passed / 0 failed / 0 skipped; build passed; backend dependency audit failed.
- Web job [126071059207](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/41680067955/job/126071059207): typecheck passed, 10 test files / 62 tests passed, build passed.
- The PostgreSQL test ran against a PostgreSQL 16.15 CI service and passed. It applied both schema migrations, reran them, launched the production process using `DATABASE_URL`, and received `/api/v1/ready = 200`.
- The same exact run verified the production SQLite subprocess guard and the synthetic approval-digest mismatch rejection.

**Release blocker from backend npm audit:** 12 advisories were reported: 2 low, 4 moderate, 5 high, and 1 critical. The critical `tar <= 7.5.20` advisories are in the `sqlite3@5.1.7 -> node-gyp -> tar` dependency chain. `zod <4.6.6` is high severity. The audit output recommends breaking upgrades including `sqlite3@6.0.1` and `zod@4.6.7`; do not apply these blindly. Review compatibility, update the lockfile, and rerun all tests and CI. PR #23 remains release-blocked until this audit is clean.

### PR #1 — integration documentation branch

- PR: [#1](https://github.com/mohammedpalash1990-a11y/Deenverse/pull/1)
- Base: `main`; PR's recorded base SHA is stale (`4d2a0a5295ad6f865026bd9c3ea9836370429fdf`).
- Head: `integration/platform-foundation` at `ed11ba60084b7354efad4fe7e049a9f2dda31305`.
- Compare against current main: 44 commits ahead, 14 behind.
- State: open, GitHub reports not mergeable; not merged.
- Documentation-only delta observed in the compare. Do not merge this branch as-is; reconcile or replace the documentation on a current base.

### PR #11 — API gap register

- PR: [#11](https://github.com/mohammedpalash1990-a11y/Deenverse/pull/11)
- Base: `integration/platform-foundation` at `eac93a6616e73048ea3787dcced87bc471eb25bc`.
- Head: `assistant/api-integration-contract-audit` at `22e90ed26142c5bf6046a80830e08d43a6ec680b`.
- Compare: 1 commit ahead, 8 behind.
- State: open, GitHub reports mergeable; not merged.
- The document's source snapshot is stale. A review note records that current main now has `GET /api/v1/ready`, object-shaped Surah detail data, `VALIDATION_ERROR` / `CONTENT_UNAVAILABLE`, and a request-ID error envelope. Editions, Ayah and reciter routes remain absent. Refresh this document against current main before accepting it.

No other open PRs were returned by the repository's open-PR listing at the time of this audit.

## 3. Backend API and database evidence

Current main registers four routes:
- `GET /api/v1/health`
- `GET /api/v1/ready`
- `GET /api/v1/quran/surahs`
- `GET /api/v1/quran/surahs/:surahNumber`

The Surah endpoints serve catalogue metadata only. Edition catalogue, Ayah retrieval, reciter/audio, translation, tafsir, Hadith, dua, identity, bookmarks, and user-progress APIs are not implemented in the inspected route tree. The frontend must not use the metadata detail route as an Ayah fallback.

The shared REST envelope is aligned between the current backend and frontend adapter for the implemented metadata routes. The adapter validates response structure and provenance metadata, aggregates backend pages up to the 114-record UI request, and rejects duplicate record IDs and repeated cursors. Its tests cover list/detail mapping, malformed responses, network failure, server errors, page aggregation, duplicate records, and cursor cycles.

Backend pagination cursors are canonical base64-encoded numeric offsets, not signed or dataset-bound tokens. The backend rejects malformed/non-canonical offsets; the frontend rejects repeated cursors and duplicate records. This is sufficient for the current small public metadata catalogue but is not a tamper-proof or snapshot-consistent cursor design.

## 4. Source approval and religious-content integrity

The catalogue service requires:
- active Quran source metadata;
- `redistribution_allowed = true`;
- an approval row with decision exactly `approved`;
- `content_source_approvals.artifact_sha256 = content_sources.checksum`;
- provenance fields passing validation.

The new synthetic regression test proves that a stored digest mismatch blocks both catalogue and detail reads and that an exact stored string match passes the metadata gate.

**Important limitation:** the runtime does not fetch an immutable source artifact or independently recompute SHA-256. The database equality check proves only that two stored strings match. Reviewer identity/authority and license permissions are also metadata, not independently authenticated evidence. There is no approved production source dossier or imported Quran corpus in this audit. Do not publish any Quran text, translation, tafsir, Hadith, dua, or audio until exact source/edition provenance, immutable artifact digest, independent human review, and the specific redistribution/display/hosting/offline rights are verified. No generated or synthetic religious content is permitted.

## 5. Security and access control

Positive controls observed:
- exact CORS allow-list tests pass; unlisted browser origins receive no allow-origin header;
- credentials are not enabled in the CORS test;
- Helmet security headers and a restrictive CSP are registered;
- rate limiting is configured and has 429 tests;
- unexpected 500 errors return a safe message and request ID rather than internal diagnostics;
- the Next.js app sets baseline browser security headers.

Gaps:
- no authentication/session/authorization implementation or identity routes were found. Current API routes are public metadata/liveness/readiness reads; no private user-data feature should ship until server-side identity and authorization exist.
- CSP still permits inline scripts/styles for framework compatibility; it is not nonce-based.
- HSTS and deployed CDN/edge header verification are not evidenced.
- backend dependency audit currently fails as recorded under PR #23.
- main branch has no required status checks enforced.

## 6. RTL, accessibility, responsive UI, and offline behavior

- The document root is `lang="en"`; the reserved Arabic reader preview has `dir="rtl"` and `lang="ar"`. It is placeholder-only, not a functioning Quran reader. The Surah catalogue currently displays metadata labels, not Arabic Ayah text.
- Keyboard/accessibility foundations include a skip link, named navigation, live status regions, button labels, and Escape handling for the mobile navigation drawer.
- Responsive CSS includes breakpoints around 900px, 680px, and 480px.
- No browser automation, real-device viewport review, screen-reader run, keyboard-only manual pass, or production CSP/header inspection was evidenced in the Actions runs. Source inspection is not a substitute for those checks.
- The service worker caches the application shell, manifest/icon, and same-origin immutable Next.js build assets. It bypasses `/api/`, cross-origin, and non-GET requests. It does not cache religious content or user data. This is a safe shell-only offline policy; offline Quran reading/audio/bookmarks are not implemented or authorized.

## 7. Production database gate

On current main, `backend/src/index.ts` rejects every `NODE_ENV=production` startup before opening a database. This is stricter than merely rejecting SQLite and remains safe.

PR #22 changes the startup and migration CLI to resolve the database from `DATABASE_URL` / `DB_CLIENT`, allowing PostgreSQL while rejecting SQLite in production. PR #23's exact-head PostgreSQL 16 test proves that this path can connect, migrate, start, and report ready in CI. The same exact-head test proves that production SQLite startup is rejected before the configured SQLite file is created.

This is CI PostgreSQL evidence, not proof that a particular hosted production database, SSL policy, secret configuration, network path, backup policy, or deployment environment is ready. Before a production release, run the migration command against the intended hosted PostgreSQL instance and verify `/api/v1/ready` returns 200. Keep the SQLite subprocess guard in every release candidate's required test suite.

## 8. Merge/deploy decision

- Main CI is green on its audited SHA.
- PR #22's original CI is green but did not exercise PostgreSQL.
- PR #23 successfully exercises PostgreSQL, the SQLite guard, and stored digest mismatch behavior, but its exact-head workflow is red because backend dependency audit reports high/critical vulnerabilities.
- PR #1 is diverged and not mergeable; PR #11 is stale.
- Main branch required checks are not enforced.
- Religious content provenance/rights are not independently verified; the reader and auth/user features are incomplete.

**Do not merge PR #22 or PR #23 and do not deploy while the backend audit failure remains. Do not enable religious-content publication.** No merge or deployment was performed in this QA run.

## 9. Resume checklist

1. Remediate backend dependency advisories with reviewed compatible versions; regenerate `backend/package-lock.json`; do not use `npm audit fix --force` without a migration plan.
2. Re-run exact-head CI on the dependency-fix candidate: backend audit, typecheck, all tests (including PostgreSQL 16 and production SQLite subprocess guard), build, web typecheck/tests/build.
3. Rebase/retest PR #23 against the updated PR #22 head if its base changes; merge neither PR until all required checks are green.
4. Perform a hosted PostgreSQL migration/readiness check and document the exact deployment SHA/environment evidence before enabling production.
5. Implement immutable artifact retrieval/hash verification, authorized reviewer identity, explicit license-use matrix, append-only approval audit, and fail-closed deployment verification before any religious corpus is enabled.
6. Implement edition-scoped Ayah and other content APIs only after source/rights approval; never fabricate or silently substitute content.
7. Add authentication/authorization before bookmarks, progress, profiles, or other private user data.
8. Complete RTL Arabic rendering, accessibility/screen-reader, keyboard, responsive device, service-worker/offline and deployed-header checks.
9. Enable branch protection with required successful CI checks on main.
10. Refresh or retire stale PR #1 and PR #11 documentation branches.

## 10. QA work produced in this run

Isolated branch: `qa/postgres-runtime-verification-20261103`

PR #23 exact head: `e5b879c76b6fd2e6e661b1aa5871f20bfd151ba7`

Base: `integration/postgres-runtime-support` at `51b8735f6b3f39a659e4eb15a9e95d31076006c4`

Changed files:
- `.github/workflows/ci.yml` — PostgreSQL 16 service, dedicated `TEST_DATABASE_URL`, backend dependency audit after test/build steps.
- `backend/test/postgres-runtime.test.ts` — real PostgreSQL migrations, rerun, production process startup, and readiness test; requires a database name ending in `_test`.
- `backend/test/source-approval-integrity.test.ts` — synthetic-only mismatch/equality tests for the stored approval digest gate.

PR #23 is open and unmerged. This evidence branch is isolated from the integration branch and from the older agent workstreams. No other repository files were changed by this QA branch.
