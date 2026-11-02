# DEENVERSE Integration Decision & Blocker Log

Last reviewed: 2026-11-02  
Owner: integration/platform-foundation

This is a live evidence log. A proposal is not an accepted decision, and an assigned task is not evidence of implementation.

## Verified repository snapshot

- `main` contains repository bootstrap and policy/architecture documentation only.
- `jules/backend-foundation` contains its `AGENT_TASK.md` assignment update; no backend implementation files were present in the branch comparison.
- `queen/frontend-foundation` contains its `AGENT_TASK.md` assignment update; no frontend implementation files were present in the branch comparison.
- `integration/platform-foundation` contains the integration documentation set, including the Phase 1 MVP brief.
- Pull request #1 is the only PR found in this repository search. It is documentation-only and remains open according to the search result. No agent implementation PR was found.
- No framework, runtime, package manager, database, authentication provider, or test runner is selected in the repository snapshot reviewed for this entry.

## Branch relationship at review time

GitHub compare results against `main`:

| Branch | Ahead | Behind | Files reported in branch diff |
|---|---:|---:|---|
| `jules/backend-foundation` | 2 | 4 | `AGENT_TASK.md` |
| `queen/frontend-foundation` | 2 | 4 | `AGENT_TASK.md` |
| `integration/platform-foundation` | 5 | 4 | `docs/API-CONTRACT.md`, `docs/INTEGRATION-CHECKLIST.md`, `docs/PHASE-1-MVP.md`, `docs/QA-PLAN.md`, `docs/SOURCE-REGISTER.md` |

The branches have diverged from the current main branch. Do not merge based only on ahead/behind counts. Before integration, each workstream should update from current main using a reviewed merge/rebase and resolve any conflicts on its own branch. Do not force-push or rewrite another workstream's history from the integration branch.

## Proposals recorded in this integration branch

1. Phase 1 is a Quran-reader application shell with verified-content gating; see `docs/PHASE-1-MVP.md`.
2. REST/JSON with OpenAPI 3.1 is recommended as a client-neutral API boundary; see `docs/API-CONTRACT.md` and `docs/OPENAPI-DRAFT.yaml`.
3. The API contract is still provisional until Jules and Queen acknowledge the route and schema shapes in their PRs.
4. Audio stream URL issuance is deliberately deferred until source terms and provider behavior are verified.
5. No religious corpus is approved or imported by this integration work.

## Blocking decisions

| Decision | Why it blocks implementation | Required evidence/owner |
|---|---|---|
| Frontend framework/runtime/build tool | Cannot define reliable CI, route tests, or app shell conventions without it | Queen stack proposal + lockfile/package manifest |
| Backend framework/runtime | Cannot define runnable API, middleware, or server test commands | Jules stack proposal + package manifest |
| Database and migrations | Needed for persistence model and reproducible integration environment | Jules ADR + migration tool/config |
| Authentication/session provider | Required before private bookmarks/progress routes can be enabled | Jules security/auth ADR |
| REST/OpenAPI acceptance | Prevents frontend/backend schema drift | Jules and Queen acknowledge draft 0.2 or submit a reconciled revision |
| Content source and license approval | Public delivery/caching may be prohibited even where content can be viewed | Source register evidence and human review |
| CI provider and test commands | No stack or package scripts exist to execute | Workstream PRs provide exact build/test commands |

## Integration gates

- Do not add framework-specific CI until package manifests and lockfiles exist.
- Do not create production adapters against guessed endpoint names; use the draft OpenAPI only after both workstreams acknowledge it.
- Do not create sample Quran/Hadith/dua text, even as test fixtures. Test with empty states, schema-invalid strings, and synthetic non-religious placeholders clearly marked as such.
- Do not claim a build, unit test, accessibility audit, or RTL verification passed without an executed command and retained output.
- Do not enable public content or audio until authenticity, attribution, redistribution, and caching rights are documented and approved.
- Keep all cross-cutting changes on `integration/platform-foundation`; workstream implementation remains on the Jules/Queen branches.

## Next integration sequence

1. Jules and Queen submit stack proposals and initial implementation PRs.
2. Review both proposals and select a compatible API/data boundary.
3. Update the OpenAPI draft from actual agreed schemas; generate or validate typed clients only after the stack is known.
4. Add CI with exact lockfile-based install, lint, typecheck, test, and build commands.
5. Integrate the shell with empty/verified-content states; test RTL and responsive layouts using real implementation.
6. Review content-source and license evidence independently of software test status.
