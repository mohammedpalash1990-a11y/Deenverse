# DEENVERSE Integration Decision & Blocker Log

Last reviewed: 2026-11-02 19:22 Asia/Riyadh  
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
