# DEENVERSE Integration Checklist — 2026-11-05

This checklist is evidence-based. A checked item means the corresponding code or CI evidence exists; it does not imply production release or religious-content approval.

## Stack and CI

- [x] Web stack selected: Next.js 15.5.28, React 19.1.2, TypeScript 5.8.3, Vitest 5.1.0.
- [x] Backend stack selected: Node 22, Fastify 5.2.1, Knex 3.1.x, Zod 4.6.7.
- [x] npm lockfiles committed; main CI uses `npm ci`.
- [x] PostgreSQL 16 service is used in backend CI; production rejects SQLite.
- [x] Main exact-head run #41812199822 passed backend/web typecheck, tests, builds, and high-severity dependency audits at `a7ff4130f6d74e9319b6d894c118d270b44171cd` (historical; it is not evidence for current main `f098d650a9cbc5aaaaadee6a925e68dfa9dbdb9a`).
- [x] Pre-sync integration head `0ae72b361772ad667ef4ef94d395eb8e14c9ecfb` passed OpenAPI validation (#41839209842), backend/web CI (#41839209748), and web-foundation checks (#41839209867). [ ] New synchronized head `aef189917f9eb13a9a4b97d0f5bc64e3da8b57de` requires fresh exact-head checks.
- [ ] Manual browser/device, responsive, RTL, keyboard, and screen-reader QA completed.

## API and adapters

- [x] Main API route inventory statically reconciled: 12 GET routes across system, Quran catalogue, Ayah, Bengali translation, and Hadith.
- [x] Quran catalogue, Ayah, Bengali translation (single Ayah + full Surah), and Hadith adapters use the shared API-base resolver.
- [x] Frontend adapter paths match registered backend paths; full-Surah translation adapter and safe error mapping have contract tests.
- [x] Success/error envelope and 400 validation convention documented.
- [x] Shared Quran source selector fails closed unless exactly one active, redistribution-permitted, approved source exists; catalogue and Ayah regression tests cover ambiguity.
- [ ] Bind pagination cursors to edition/query context.
- [ ] Expand contract tests to cover every response schema and pagination/error edge case; current coverage includes source ambiguity, full-Surah ordering/provenance, and safe error mapping.

## Security and user data

- [x] Production database runtime is PostgreSQL-only; SQLite remains local/test.
- [x] CORS uses an explicit allowlist; default rate limiting is configured.
- [ ] Authentication/session lifecycle implemented and reviewed.
- [ ] Server-side roles/permissions and cross-user isolation tests implemented.
- [ ] Protected bookmark/progress/admin write APIs implemented only after auth.

## Religious content and licensing

- [x] Tanzil importer validates official-source artifacts, exact structure, and hashes; explicit seed requires independent source approval bound to text + metadata digests.
- [ ] Tanzil acquisition evidence completed: a public copy is now committed and displayed by the beta reader, but the exact official download options, retrieval timestamp, independently verified artifact digest, and independent source review are not recorded. Reconcile `SOURCE_INFO.md` and `docs/TANZIL-SOURCE-DOSSIER.md` before approval.
- [ ] Per-Ayah human review gate merged and enforced before Quran text publication.
- [ ] QuranEnc Bengali translation rights for web/mobile/caching/offline/export documented and approved.
- [ ] Hadith source/edition/redistribution rights approved and content reviewed.
- [ ] Tafsir and dua sources independently approved.
- [ ] Audio/reciter rights approved; the beta reader currently references EveryAyah and Audiomack external sources without recording-specific rights evidence. Verify identity, ownership, attribution, streaming/cache/offline terms, and playback before calling this feature approved.
- [ ] No unapproved or generated religious text is presented as canonical content.

## Operations and release

- [x] PostgreSQL migration/runtime CI exists and passes on main.
- [ ] Hosted production PostgreSQL connection, migration, readiness, backup/restore, and rollback tested.
- [ ] Production secrets configured only in the deployment secret store.
- [ ] API-origin CORS/CSP/browser network smoke test completed on the deployed domain.
- [ ] Release notes distinguish implemented code from unavailable content and blocked features.

## PR disposition

- [x] PR #1 pre-sync exact-head route-parity and backend/web CI passed. [ ] Current synchronized head needs fresh CI; PR #1 is open, mergeable, 71 commits ahead / 0 behind `main`, with 22 changed files and no submitted reviews. Human review and release-blocker review remain before merge.
- [ ] PR #11 reconciled against current implementation; do not merge its stale snapshot.
- [ ] PR #43 exact-head CI and review complete.
- [ ] PR #45 security review and exact-head CI complete.
- [ ] PR #47 backend CI failure resolved and migration/readiness impact reviewed.


## 2026-11-05 synchronization and evidence refresh

- `main` head: `f098d650a9cbc5aaaaadee6a925e68dfa9dbdb9a`.
- `integration/platform-foundation` was safely synchronized with current `main` by merge commit `aef189917f9eb13a9a4b97d0f5bc64e3da8b57de`. The two branch deltas had no overlapping changed paths before the merge. The branch now compares 71 ahead / 0 behind `main`.
- PR #1 remains open and unmerged; GitHub reports mergeable=true. Its current head is the merge commit above. No PR review submissions were present at the time of inspection. Do not merge automatically.
- `jules/backend-foundation` remains 3 ahead / 69 behind `main`, with only `AGENT_TASK.md` and `JULES_NEXT_TASK.md` in its diff. `queen/frontend-foundation` remains 2 ahead / 69 behind, with only `AGENT_TASK.md`. No new implementation work is attributed to either assignment branch.
- The last recorded passing integration CI applies to pre-sync head `0ae72b361772ad667ef4ef94d395eb8e14c9ecfb`, not the new merge commit. The new head had no workflow run/status evidence returned at this checkpoint; do not infer a pass.
- Tanzil's official published terms were verified, but the GitHub-uploaded artifact's exact acquisition and digest remain unverified. The public beta reader currently bypasses the backend approval gate by loading the raw repository file. Per-Ayah review remains a release blocker.
