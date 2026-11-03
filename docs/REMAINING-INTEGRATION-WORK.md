# DEENVERSE — Remaining Integration Work Register

**Maintained on:** `integration/platform-foundation`  
**Evidence date:** 2026-11-03  
**Scope:** Cross-cutting work only. This register does not represent agent activity, a release approval, or a deployment.

## Verified baseline

- The application stack is selected in `main`: Next.js/React/TypeScript web app and Fastify/Knex TypeScript backend.
- Main currently exposes liveness, readiness, Surah catalogue metadata, and Surah metadata detail routes. It does not expose Ayah text, editions, audio, authentication, or user-library APIs.
- The frontend adapter is read-only and consumes Surah metadata only.
- Main CI evidence exists for web and backend typecheck, tests, and builds. This is not evidence of browser, screen-reader, hosted database, or production deployment verification.
- PostgreSQL runtime work is proposed in PR #22. PostgreSQL integration verification is in PR #23. Review each PR's exact current head and checks before accepting it.
- PR #1 is based on an old, divergent integration history. Do not merge it until it is synchronized with current main and its duplicate documentation paths are reconciled.
- The exact named Jules and Queen assignment branches must be checked independently; merged PRs are evidence of accepted work, not proof that those assignment branches are active.

## Priority 0 — unblock safe integration

1. **Synchronize integration history.** Rebase/merge current main into this branch through a reviewed operation, resolve duplicate documentation paths, then rerun checks. Do not force-push.
2. **Review PostgreSQL runtime PR #22.** Verify the exact head, migration idempotence, production SQLite rejection, environment configuration, and CI. Do not declare hosted production readiness from a disposable CI database.
3. **Review PostgreSQL/source-gate PR #23.** Verify exact head CI, database isolation safeguards, migration repeat-safety, readiness behavior, digest mismatch behavior, and dependency audit output. A stored digest comparison is not independent artifact authentication.
4. **Refresh PR #24 evidence.** Confirm each cited workflow run and commit still corresponds to the recorded evidence; preserve dated snapshots rather than treating them as current indefinitely.

## Priority 1 — contract and client integration

1. Keep `docs/OPENAPI-DRAFT.yaml` limited to routes actually registered in backend source.
2. Validate the OpenAPI YAML in CI and assert that only the four currently implemented GET routes are documented. This is syntax and boundary validation, not full OpenAPI semantic validation.
3. Add executable contract tests that compare route response schemas with the frontend adapter's accepted shapes.
4. Reconcile the frontend provenance type with the backend response without weakening required integrity fields.
5. Do not add calls to future endpoints until backend routes, schemas, authorization, and tests are merged.

## Priority 2 — product foundations

1. Implement edition identity and immutable source-artifact retrieval/hash verification before any Ayah corpus can be approved.
2. Build an auditable source approval workflow with reviewer authority, exact artifact digest, edition, attribution, license, redistribution, caching, and offline-use permissions.
3. Add authentication/session lifecycle and server-side authorization before bookmarks, notes, progress, or private user-library APIs.
4. Add responsive, RTL, keyboard, focus, and screen-reader verification against a declared browser/device matrix.
5. Define PWA installability and offline behavior only after content licensing permits caching and offline copies.

## Release blockers

- No approved Quran Arabic/Ayah corpus, translation, tafsir, Hadith, dua, or audio dataset is available for import based on the evidence in this register.
- No content may be fabricated, reconstructed, paraphrased as canonical text, or published based only on a metadata approval row.
- No hosted PostgreSQL production instance, production credentials, domain, or deployment evidence is established here.
- No end-to-end browser, mobile-device, screen-reader, or production API verification is claimed.
- No secrets or production data belong in Git.

## Acceptance rule

A work item moves to complete only when its exact commit/PR, changed files, executed command or workflow run, result, and remaining limitations are recorded. A proposed task, open PR, or green unrelated workflow is not completion evidence.
