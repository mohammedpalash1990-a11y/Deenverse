# DEENVERSE Integration Checklist — 2026-11-04

This checklist is evidence-based. A checked item means the corresponding code or CI evidence exists; it does not imply production release or religious-content approval.

## Stack and CI

- [x] Web stack selected: Next.js 15.5.28, React 19.1.2, TypeScript 5.8.3, Vitest 5.1.0.
- [x] Backend stack selected: Node 22, Fastify 5.2.1, Knex 3.1.x, Zod 4.6.7.
- [x] npm lockfiles committed; main CI uses `npm ci`.
- [x] PostgreSQL 16 service is used in backend CI; production rejects SQLite.
- [x] Main exact-head run #41812199822 passed backend/web typecheck, tests, builds, and high-severity dependency audits.
- [ ] Integration OpenAPI route-parity workflow passes on its exact new branch head.
- [ ] Manual browser/device, responsive, RTL, keyboard, and screen-reader QA completed.

## API and adapters

- [x] Main API route inventory statically reconciled: 12 GET routes across system, Quran catalogue, Ayah, Bengali translation, and Hadith.
- [x] Quran catalogue, Ayah, Bengali translation, and Hadith adapters use the shared API-base resolver.
- [x] Frontend adapter paths match the registered backend paths in the current source snapshot.
- [x] Success/error envelope and 400 validation convention documented.
- [ ] Enforce exactly one active approved Quran edition or add explicit edition-scoped route parameters; current `.first()` selection is ambiguous if multiple sources qualify.
- [ ] Bind pagination cursors to edition/query context.
- [ ] Add contract tests beyond route-path parity for response schema compatibility and failure mapping.

## Security and user data

- [x] Production database runtime is PostgreSQL-only; SQLite remains local/test.
- [x] CORS uses an explicit allowlist; default rate limiting is configured.
- [ ] Authentication/session lifecycle implemented and reviewed.
- [ ] Server-side roles/permissions and cross-user isolation tests implemented.
- [ ] Protected bookmark/progress/admin write APIs implemented only after auth.

## Religious content and licensing

- [x] Tanzil importer validates official-source artifacts, exact structure, and hashes; explicit seed requires independent source approval bound to text + metadata digests.
- [ ] Exact Tanzil artifact acquired, preserved, checksummed, independently reviewed, and recorded.
- [ ] Per-Ayah human review gate merged and enforced before Quran text publication.
- [ ] QuranEnc Bengali translation rights for web/mobile/caching/offline/export documented and approved.
- [ ] Hadith source/edition/redistribution rights approved and content reviewed.
- [ ] Tafsir and dua sources independently approved.
- [ ] Audio/reciter source and streaming/offline rights approved; playback tested.
- [ ] No unapproved or generated religious text is presented as canonical content.

## Operations and release

- [x] PostgreSQL migration/runtime CI exists and passes on main.
- [ ] Hosted production PostgreSQL connection, migration, readiness, backup/restore, and rollback tested.
- [ ] Production secrets configured only in the deployment secret store.
- [ ] API-origin CORS/CSP/browser network smoke test completed on the deployed domain.
- [ ] Release notes distinguish implemented code from unavailable content and blocked features.

## PR disposition

- [ ] PR #1 route-parity workflow passed and docs reviewed; do not merge automatically.
- [ ] PR #11 reconciled against current implementation; do not merge its stale snapshot.
- [ ] PR #43 exact-head CI and review complete.
- [ ] PR #45 security review and exact-head CI complete.
- [ ] PR #47 backend CI failure resolved and migration/readiness impact reviewed.
