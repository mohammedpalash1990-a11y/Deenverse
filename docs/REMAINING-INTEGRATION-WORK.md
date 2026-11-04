# DEENVERSE — Remaining Integration Work

**Evidence date:** 2026-11-04  
**Owner:** `integration/platform-foundation`  
**Current main:** `a7ff4130f6d74e9319b6d894c118d270b44171cd`  
**Scope:** cross-cutting integration only. Agent work is tracked separately and is not counted without branch/PR evidence.

## Verified complete in main

- Next.js/React/TypeScript web app and Fastify/Knex backend are selected and have committed lockfiles.
- PostgreSQL production runtime/migrations and PostgreSQL 16 CI verification are merged (#22/#23).
- Frontend API-origin configuration and shared typed adapters are merged (#28 and later integration work).
- Quran catalogue, Ayah, QuranEnc Bengali translation, and source-gated Hadith read APIs are registered.
- Main exact-head CI run #41812199822 passed backend and web typecheck, tests, builds, and high-severity dependency audits.
- Tanzil importer requires an independently approved source registration bound to exact artifact and metadata digests.

## P0 — contract and content safety

1. **Quran edition selection:** enforce exactly one active approved Quran source until an explicit edition ID is added to catalogue/Ayah routes. Current services use `.first()` and do not reject multiple eligible editions.
2. **Per-Ayah review:** complete/review PR #43 and its dependency PR #45. Require exact-head CI, migration/readiness tests, invitation-token security review, and evidence that no Ayah is published without the required human decisions.
3. **Tanzil acquisition/approval:** obtain the official artifact and metadata, preserve original bytes and license notice, record exact SHA-256 values, run the importer's full structural/string checks, and obtain independent human source review. No import/publication until all evidence exists.
4. **Translation rights:** resolve QuranEnc terms for web/mobile display, server-side delivery, caching, offline, and export. The pinned API version is not a license grant.
5. **Hadith sources:** choose a source only after exact edition, attribution, grading, redistribution/caching terms, artifact/API provenance, and review roles are approved. Current candidates are research only.

## P1 — secure user features

1. Define authentication/session lifecycle, password/reset or external identity model, revocation, account deletion, and secure cookie/token handling.
2. Add server-side roles/permissions and cross-user isolation tests before bookmarks, notes, reading progress, reports requiring identity, or admin writes.
3. Add idempotency and audit logging for privileged review/approval writes.

## P2 — missing product domains

1. Audio/reciter catalogue and playback only after recording identity, rights, streaming/cache terms, and a real successful playback path are verified.
2. Dua/adhkar and tafsir require independent source/edition/licensing/review records.
3. Keep offline Quran/Hadith content disabled until each source's caching/offline permissions and integrity lifecycle are proven.

## P3 — release QA and operations

1. Manual responsive checks at 320, 360, 390, 768, and 1280px.
2. Manual Arabic RTL/mixed-direction, keyboard/focus, and screen-reader testing with evidence.
3. Browser CORS/CSP/network checks against the configured API origin.
4. Hosted PostgreSQL migration/readiness, backup/restore, rollback, secret-store, and deployment smoke tests.
5. PR #1 is synchronized and the initial route-parity CI passed; keep it open for human review of the documentation diff and release blockers. Rerun CI after validator hardening. Reconcile PR #11 against this current route inventory; do not merge it as-is.

## Agent status

`jules/backend-foundation` and `queen/frontend-foundation` remain assignment/documentation-only in their latest branch comparisons. Do not count these work items as agent implementation or claim either agent is currently working without new commits or an implementation PR.
