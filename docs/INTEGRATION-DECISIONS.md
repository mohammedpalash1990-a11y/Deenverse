# DEENVERSE Integration Decision & Blocker Log

Last reviewed: 2026-11-03 — current status appended below  
Owner: integration/platform-foundation

This is an evidence log. A proposal is not an accepted decision, and an assigned task is not evidence of implementation.

## Verified repository snapshot

- `main` contains repository bootstrap and policy/architecture documentation only; no application source, package manifest, lockfile, tests, migration, or workflow configuration was present in the inspected tree.
- `jules/backend-foundation` contains its `AGENT_TASK.md` assignment update only; no backend implementation files were present in the branch comparison.
- `queen/frontend-foundation` contains its `AGENT_TASK.md` assignment update only; no frontend implementation files were present in the branch comparison.
- `integration/platform-foundation` contains the integration documentation set, including the Phase 1 MVP, API contract, OpenAPI draft, QA plan and source register.
- PR #1 is the only PR found. It remains open and unmerged; it changes documentation only. No Jules/Queen implementation PR was found.
- No framework, runtime, package manager, database, authentication provider, or test runner is selected.
- No religious corpus is approved or imported. The source register remains pending/TBD.

## Branch relationship at start of QA review

GitHub compare results against `main` at the start of this QA pass:

| Branch | Ahead | Behind | Files reported in branch diff |
|---|---:|---:|---|
| `jules/backend-foundation` | 2 | 4 | `AGENT_TASK.md` only |
| `queen/frontend-foundation` | 2 | 4 | `AGENT_TASK.md` only |
| `integration/platform-foundation` | 9 | 4 | Seven documentation files only |

The QA pass added two documentation commits to the integration branch (the expanded QA plan and this refreshed blocker log). Therefore, the table above is a historical baseline, not the post-update branch count. Re-run the GitHub compare immediately before any merge. Do not merge based only on ahead/behind counts or GitHub's `mergeable` metadata. Do not force-push or rewrite another workstream's history from the integration branch.

## PR and CI evidence

- PR #1 head is `integration/platform-foundation`; base is `main`.
- PR #1 contains documentation changes only; it does not add application code, adapters, migrations, tests or CI.
- No review submissions were recorded at the QA review.
- GitHub Actions reported zero workflow runs. The reviewed main and PR-head commits returned zero check-runs; main had zero commit status contexts.
- PR metadata returned `mergeable: true` at inspection, but the PR is behind main and has no checks or review. This is not a release or merge approval.
- `docs/QA-PLAN.md` contains the repository snapshot, actual QA execution limitations, test matrix and release blockers. No runtime test result is claimed.

## Proposals recorded in this integration branch

1. Phase 1 is a Quran-reader application shell with verified-content gating; see `docs/PHASE-1-MVP.md`.
2. REST/JSON with OpenAPI 3.1 is recommended as a client-neutral API boundary; see `docs/API-CONTRACT.md` and `docs/OPENAPI-DRAFT.yaml`.
3. The API contract is provisional until Jules and Queen acknowledge or revise the route/schema shapes in their implementation PRs.
4. Audio stream URL issuance is deferred until provider behavior and source terms are verified.
5. No religious corpus is approved or imported by this integration work.

## Blocking decisions

| Decision | Why it blocks implementation | Required evidence/owner |
|---|---|---|
| Frontend framework/runtime/build tool | Cannot define reliable CI, route tests, or app shell conventions without it | Queen stack proposal + package manifest/lockfile |
| Backend framework/runtime | Cannot define runnable API, middleware, or server test commands | Jules stack proposal + package manifest/lockfile |
| Database and migrations | Needed for persistence model and reproducible integration environment | Jules ADR + migration tool/config |
| Authentication/session provider | Required before private bookmarks/progress routes can be enabled | Jules security/auth ADR |
| REST/OpenAPI acceptance | Prevents frontend/backend schema drift | Jules and Queen acknowledge draft 0.2 or submit a reconciled revision |
| Content source and license approval | Public delivery/caching may be prohibited even where content can be viewed | Source register evidence and human review |
| CI provider and test commands | No stack or package scripts exist to execute | Workstream PRs provide exact build/test commands |
| Quran source snapshot | Required to verify exact Arabic text and edition integrity | Approved source owner, immutable snapshot and checksum |

## Integration gates

- Do not add framework-specific CI until package manifests and lockfiles exist.
- Do not create production adapters against guessed endpoint names; use the OpenAPI draft only after both workstreams acknowledge it.
- Do not create sample Quran/Hadith/dua text, even as test fixtures. Use empty states, schema-invalid values, and synthetic non-religious placeholders clearly marked as such.
- Do not claim a build, unit test, accessibility audit, RTL verification, security scan or OpenAPI validation passed without an executed command and retained output.
- Do not enable public content or audio until authenticity, attribution, redistribution and caching rights are documented and approved.
- Keep cross-cutting changes on `integration/platform-foundation`; workstream implementation remains on the Jules/Queen branches.
- Keep PR #1 open until the branch is synchronized with current main and reviewed. Do not merge it as a substitute for implementation or QA.

## Next integration sequence

1. Jules and Queen submit stack proposals and initial implementation PRs with lockfiles and exact commands.
2. Review both proposals and select a compatible API/data boundary.
3. Update the OpenAPI draft from agreed schemas; validate it with a pinned tool in CI.
4. Add CI with lockfile-based install, lint, typecheck, tests and build.
5. Integrate the shell with empty/verified-content states; test RTL and responsive layouts against the declared browser/device matrix.
6. Review content-source authenticity, attribution and license evidence independently of software test status.
7. Re-run the QA plan, resolve branch divergence and inspect all checks before merge.


## Current implementation reconciliation — 2026-11-03

**This section supersedes the historical repository/branch/stack/CI statements above.** Earlier entries are retained as a dated record of the initial planning phase.

- Current `main`: `6a1beb1c90aa7d195e8081ca1157649fae4dd305`.
- Current `jules/backend-foundation`: `f84e35c242ab37ccafca0528a1d06e0d4b244834`, 3 ahead / 14 behind main; current diff is `AGENT_TASK.md` and `JULES_NEXT_TASK.md` only.
- Current `queen/frontend-foundation`: `9ef788c81de85e9ebfa139b35c42d606c38f2010`, 2 ahead / 14 behind main; current diff is `AGENT_TASK.md` only.
- Current `integration/platform-foundation` before this reconciliation: `eac93a6616e73048ea3787dcced87bc471eb25bc`, 36 ahead / 14 behind main.
- Actual backend source was integrated through merged PR #18; frontend accessibility and typed REST adapter work through merged PRs #16 and #17. These are merged-code facts, not claims that the exact Jules/Queen assignment branches are currently active.
- Main now has Next.js/React/TypeScript web code, a Fastify/Knex backend, a typed Quran metadata REST adapter, database migrations, tests and GitHub Actions CI.
- Main CI run `41626698190` on the exact main SHA passed web typecheck/tests/build and backend typecheck/tests/build.
- PR #22 (head `51b8735f6b3f39a659e4eb15a9e95d31076006c4`) passed CI runs `41627796874` and `41627796745`, but remains open. No hosted PostgreSQL integration run is recorded; main still blocks production startup until the PostgreSQL runtime/migration change is merged.
- PR #1 remains open and unsynchronized; do not merge it in its current state. PR #11 remains open, but its static API gap register describes an earlier backend snapshot and needs revision against current main.
- Current route inventory, response schemas, adapter behavior, contract differences, source-integrity limitations, exact CI evidence and next gates are recorded in `docs/IMPLEMENTED-API-RECONCILIATION.md`.
- `docs/OPENAPI-DRAFT.yaml` has been changed from the future-surface proposal to an implementation-aligned snapshot containing only the four routes currently registered on main. The filename is retained for link compatibility.
- No Quran Ayah corpus, translation, tafsir, Hadith, dua or audio dataset has been imported or approved. The current backend compares stored approval/source digest fields but does not independently retrieve and hash the immutable source artifact.

### Current blockers

1. Synchronize this integration branch with main through a reviewed merge/update and resolve duplicate documentation paths before PR #1 can be considered.
2. Add OpenAPI parser validation and contract tests to CI.
3. Run PostgreSQL migration and backend integration tests against a real disposable PostgreSQL service before production readiness is claimed.
4. Complete manual responsive, RTL, keyboard and screen-reader verification.
5. Complete independent source identity, artifact, attribution, redistribution and caching/offline rights review before importing or publishing religious content.

### Integration commits in this reconciliation

- `f37f459df19637ec1b1ec97db051f3a846698289` — added `docs/IMPLEMENTED-API-RECONCILIATION.md`.
- `9a9efad92d715503a009643531255ded3f559597` — first implementation-aligned OpenAPI update.
- `abdbaddee990eaade77dca827c442a6b133703c4` — tightened the list response metadata schema.
- `8a988ada9f1f486ce0f31d5b42282710cc3a65ee` — corrected the OpenAPI Surah-number patterns to reject values above 114.
- `13bb92244136ddf3e75d214f6494e65e765f5cfb` — removed Surah metadata constraints not enforced by the current database schema.

No changes were made to main or either named Jules/Queen assignment branch.


## Current accepted stack and integration snapshot — 2026-11-04

**This section supersedes earlier statements that no stack, runtime, API implementation, or CI existed.** Current main is `a7ff4130f6d74e9319b6d894c118d270b44171cd`.

### Accepted stack
- Web: Next.js 15.5.28, React 19.1.2, TypeScript 5.8.3, Vitest 5.1.0.
- Backend: Node.js 22, TypeScript, Fastify 5.2.1, Knex 3.1.x, Zod 4.6.7.
- Database: PostgreSQL in production; SQLite local/test; pg driver 8.13.x.
- Package manager: npm; committed root/backend lockfiles; CI installs with `npm ci`.
- Backend tests: Node native test runner through tsx.
- Transport: REST/JSON under `/api/v1`; OpenAPI 3.1 snapshot is maintained in `docs/OPENAPI-DRAFT.yaml`.

### Accepted contract behavior from current code
- Success: `{ meta: { requestId, nextCursor? }, data }`.
- Error: `{ error: { code, message, requestId, details, retryable } }`.
- Validation failures use HTTP 400.
- Paginated routes default to 20 and cap at 50; cursors are canonical Base64 numeric offsets, not edition/query-bound.
- Public read routes are implemented; no authentication/session or private user-library API exists.
- Shared frontend API root is `NEXT_PUBLIC_API_BASE_URL`, resolved by `src/lib/api-config.ts`; browser CSP allows only the configured origin, not a wildcard.

### Current release blockers
1. Quran catalogue/Ayah source selection uses an unordered `.first()` and has no explicit edition selector. Enforce one eligible source or add edition-scoped routes before activating multiple editions.
2. The current runtime checks source approval metadata and stored Ayah digests but does not independently retrieve/hash the immutable upstream artifact. Per-Ayah human review is not yet enforced in main; PR #43 is open.
3. QuranEnc Bengali translation is pinned to V1.1.1, but explicit redistribution/caching/offline/export permission remains unverified.
4. Hadith source candidates remain research-only; no approved collection is populated. Audio, tafsir, and dua sources remain unapproved.
5. Authentication/session, private-data authorization, hosted PostgreSQL backup/restore, and manual accessibility QA remain open.

Main exact-head CI run #41812199822 passed both backend and web jobs on `a7ff4130f6d74e9319b6d894c118d270b44171cd` (typecheck, tests, builds, and high-severity dependency audits; backend job included PostgreSQL 16). This does not close the release blockers above.

### Current branch evidence
- `jules/backend-foundation`: 3 ahead / 58 behind; diff only `AGENT_TASK.md` and `JULES_NEXT_TASK.md`.
- `queen/frontend-foundation`: 2 ahead / 58 behind; diff only `AGENT_TASK.md`.
- No implementation commit or PR from either named branch was found. Do not infer agent activity from assignment issues or owner-authored PRs.


## OpenAPI validator hardening — 2026-11-04

The first route-parity workflow passed on the exact sync head. The validator is now being hardened to reject duplicate YAML mapping keys and unresolved local component references before comparing all documented path/method pairs with the backend route registrations. The duplicate `SurahPage` schema key was removed. The hardened version requires a fresh exact-head Actions run; no pass is claimed for it yet.
