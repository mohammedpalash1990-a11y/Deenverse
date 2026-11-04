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

1. **Quran edition selection:** resolved on `integration/platform-foundation` by a shared selector used by both catalogue and Ayah services. It fails closed unless exactly one active, redistribution-permitted source has a matching approved decision; regression tests cover both APIs. Keep the single-edition restriction until explicit edition-scoped routes are designed.
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
5. PR #1 exact-head OpenAPI parity, backend/web CI, and web-foundation checks now pass; keep it open for human review of the expanded cross-cutting diff and release blockers. Reconcile PR #11 against this current route inventory; do not merge it as-is.

## Agent status

`jules/backend-foundation` and `queen/frontend-foundation` remain assignment/documentation-only in their latest branch comparisons. Do not count these work items as agent implementation or claim either agent is currently working without new commits or an implementation PR.


## Integration follow-up — 2026-11-04

Verified implementation code head: `b3c890be21f8a9e33a9174d39a6cbaf13bdf21c4`. After documentation-only evidence updates, integration head before this final evidence refresh was `839b29a3bf409c13d40336d18210d6cb7a9bd391`, compared with main `a7ff4130f6d74e9319b6d894c118d270b44171cd` (69 ahead / 0 behind).

Completed on the integration branch:
- Fixed the OpenAPI validator's Ruby Psych scalar-node crash.
- Enforced exactly one eligible approved Quran source for both Surah catalogue and Ayah retrieval; ambiguous source sets fail closed with `503 CONTENT_UNAVAILABLE`.
- Added backend regression tests for ambiguous source selection and corrected catalogue review provenance fields.
- Added a validated frontend adapter for the already-implemented full-Surah Bengali translation endpoint.
- Routed Bengali translation API errors through the shared safe error mapper.
- Reconciled API error documentation and the single-edition OpenAPI/Ayah contract.

Exact-head verification on the implementation code head:
- DEENVERSE CI run #41838270768: backend install, typecheck, tests, build, and high-severity audit passed; web install, typecheck, tests, build, and high-severity audit passed.
- Web foundation run #41838270665: install, audit capture, typecheck, tests, and production build passed.
- OpenAPI route-parity run #41838270690: passed.

A later documentation-only head `839b29a3bf409c13d40336d18210d6cb7a9bd391` was also rechecked: DEENVERSE CI #41838823799, Web foundation #41838823586, and OpenAPI validation #41838823872 all passed.
- Push-triggered OpenAPI run #41837800895: passed.

Remaining blockers are unchanged: immutable source artifact retrieval/re-hashing, independent scholarly/source review, per-Ayah human review, QuranEnc redistribution/caching/offline/export terms, approved Hadith/tafsir/dua/audio sources, authentication/authorization for private features, manual accessibility/device QA, and hosted production PostgreSQL operations. No religious corpus was imported or approved by this integration work.

The named `jules/backend-foundation` and `queen/frontend-foundation` branches remain task-document-only in their latest comparisons (3/58 and 2/58 ahead/behind main respectively). Do not attribute merged mainline implementation PRs to these assignment branch heads.
