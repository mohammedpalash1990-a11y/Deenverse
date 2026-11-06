# DEENVERSE Integration Checklist — 2026-11-05

This checklist is evidence-based. A checked item means the corresponding code or CI evidence exists; it does not imply production release or religious-content approval.

## Stack and CI

- [x] Web stack selected: Next.js 15.5.28, React 19.1.2, TypeScript 5.8.3, Vitest 5.1.0.
- [x] Backend stack selected: Node 22, Fastify 5.2.1, Knex 3.1.x, Zod 4.6.7.
- [x] npm lockfiles committed; main CI uses `npm ci`.
- [x] PostgreSQL 16 service is used in backend CI; production rejects SQLite.
- [x] Main exact-head run #41812199822 passed backend/web typecheck, tests, builds, and high-severity dependency audits at `a7ff4130f6d74e9319b6d894c118d270b44171cd` (historical; it is not evidence for current main `f098d650a9cbc5aaaaadee6a925e68dfa9dbdb9a`).
- [x] Current implementation code head `4085196dc78580913c0f8b16700af38cac63f461` passed OpenAPI validation (#42033372745), backend/web CI (#42033372615), and web-foundation checks (#42033372656).
- [ ] Manual browser/device, responsive, RTL, keyboard, and screen-reader QA completed.

## API and adapters

- [x] Integration OpenAPI route inventory reconciled to 10 active GET routes: health, readiness, two Quran catalogue routes, one source-gated Ayah route, and five Hadith routes. Both QuranEnc translation routes are removed from registration and OpenAPI.
- [x] Quran catalogue, Ayah, and Hadith adapters use the shared API-base resolver. Translation parser/client code remains dormant; no public translation route is registered.
- [x] Active frontend adapter paths match registered backend paths. Translation service unit tests remain, while public endpoint tests assert canonical 404/NOT_FOUND.
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
- [ ] Tanzil acquisition evidence completed: a public copy remains committed and is still displayed by current `main`, but the exact official download options, retrieval timestamp, independently verified artifact digest, and independent source review are not recorded. The integration branch now routes the mounted reader through the backend approval gate; reconcile `SOURCE_INFO.md` and `docs/TANZIL-SOURCE-DOSSIER.md` before approval.
- [ ] Per-Ayah human review gate merged and enforced before Quran text publication.
- [ ] QuranEnc Bengali translation rights for web/mobile/caching/offline/export documented and approved.
- [ ] Hadith source/edition/redistribution rights approved and content reviewed.
- [ ] Tafsir and dua sources independently approved.
- [ ] Audio/reciter rights approved; legacy `quran-beta-reader.tsx` still contains EveryAyah and Audiomack external references but is no longer mounted by the integration `AppShell`. Verify identity, ownership, attribution, streaming/cache/offline terms, and playback before re-enabling audio.
- [ ] No unapproved or generated religious text is presented as canonical content.

## 2026-11-06 integration implementation

- [x] Both public QuranEnc translation routes are unregistered; backend integration tests assert HTTP 404 with `NOT_FOUND`.
- [x] The mounted Quran section is an approval-pending placeholder; it makes no fetch request and renders no scripture text or audio.
- [x] Browser CSP no longer permits `raw.githubusercontent.com` in `connect-src`.
- [x] The unverified `data/quran/tanzil/quran-uthmani.txt` file is deleted from the current integration branch. Git history is not rewritten.
- [x] Quran source selection excludes approvals by the same reviewer as the source reviewer and excludes `project-owner-chat-authorization`; regression tests cover both conditions.
- [x] OpenAPI route inventory has 10 active GET paths and the validator remains configured to run on integration-branch pushes and PR changes.
- [ ] Exact official Tanzil artifact acquisition, independent SHA-256 recomputation, source-specific license evidence, and independent human approval are still missing. No production import is authorized.
- [ ] Full backend/web CI, OpenAPI parity, PostgreSQL 16 integration, audit, and build checks must pass on the final updated integration head before PR #1 is considered ready.
- [ ] PR #75 remains an unmerged draft. The integration safety changes are not live on `main`.

## Operations and release

- [x] PostgreSQL migration/runtime CI exists and passes on main.
- [ ] Hosted production PostgreSQL connection, migration, readiness, backup/restore, and rollback tested.
- [ ] Production secrets configured only in the deployment secret store.
- [ ] API-origin CORS/CSP/browser network smoke test completed on the deployed domain.
- [ ] Release notes distinguish implemented code from unavailable content and blocked features.

## PR disposition

- [ ] PR #1's earlier CI applies to an older integration head. The current fail-closed reconciliation requires fresh exact-head route-parity, backend/web CI, PostgreSQL, audit, and build checks before merge.
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


## 2026-11-05 current-head implementation result

- Current integration head: `e0b74cec14bc611fde48386645a257e55fe89cc1`.
- The web shell now mounts `QuranAyahReader` rather than the raw-GitHub `QuranBetaReader`. The displayed Ayah must arrive through the backend API and pass client-side approval, licensing, and integrity metadata checks. The legacy component remains in the repository but is not mounted by the integration shell.
- This removes the direct raw-GitHub Quran and unreviewed external audio links from the integration app shell. It does not create a full-Surah Arabic endpoint, approve any corpus, or complete per-Ayah human review. Full-Surah reading and audio remain gated.
- Exact-head Actions: DEENVERSE CI #42032834719 passed backend locked install, typecheck, tests, build, high-severity audit and PostgreSQL 16 initialization; web locked install, typecheck, tests, build and high-severity audit. Web foundation #42032834877 passed install, audit capture, typecheck, tests and production build. OpenAPI route parity #42032834651 passed.
- A preceding synchronized documentation head `fa6cebdc50e80ea3cd8ae026d378d35e5460984a` had one stale app-shell test failure because it still expected the removed Bengali full-reader region and a Surah combobox. Commit `e0b74cec14bc611fde48386645a257e55fe89cc1` updated the shell and test to the API-gated Ayah reader; all three exact-head workflows above then passed.


## 2026-11-05 latest source-attribution check

- `QuranAyahReader` now displays the source-provided edition, attribution, license identifier, and HTTPS source link. Test coverage asserts that the source link and license identifier are rendered from the returned provenance.
- Exact implementation head `4085196dc78580913c0f8b16700af38cac63f461`: DEENVERSE CI #42033372615, Web foundation #42033372656, and OpenAPI validation #42033372745 all passed.
- Per-Ayah review remains unmerged: PR #43 is open, 7 ahead / 41 behind current `main`, and GitHub reports mergeable=false; its recorded DEENVERSE CI run #41757958528 was cancelled. PR #45 is stacked on PR #43 (23 ahead / 0 behind its base); its recorded DEENVERSE CI run #41760877560 was cancelled. Neither branch is integrated into `main`.

## 2026-11-06 exact-head integration verification

Evidence below was captured at integration implementation head `dc251bcc38dff3b7d0d975e31959a255e606960f`, before this checklist-only refresh. At that checkpoint the branch was 107 commits ahead / 0 behind main `f098d650a9cbc5aaaaadee6a925e68dfa9dbdb9a`.

- [x] Backend source-approval regression fixture now uses a distinct synthetic artifact reviewer. This preserves the runtime rule that source and artifact reviewers must be independent.
- [x] OpenAPI 3.1 snapshot has 10 paths / 10 operations; disabled QuranEnc routes and unused QuranEnc response schemas are absent.
- [x] OpenAPI checksum documentation distinguishes stored digest metadata from independent upstream artifact re-hashing.
- [x] Cursor contract documents that current offset cursors are unsigned and not query-bound.
- [x] DEENVERSE CI #42224958000 passed: backend 86/86 tests, typecheck, build, PostgreSQL 16 migrations/runtime, production SQLite startup guard, backend audit 0 vulnerabilities; web 18 test files / 174 tests, typecheck, build, web audit 0 vulnerabilities.
- [x] Web foundation #42224958140 passed: locked install, audit capture, typecheck, 18 test files / 174 tests, production build.
- [x] OpenAPI validation #42224958031 passed: YAML parse, unique keys, local references, and route parity (10 paths / 10 operations).
- [x] PR #69 received blocking review comment #6685706745 because its raw-GitHub fallback bypasses the fail-closed publication boundary.
- [ ] PR #1 still requires human review and merge decision. Its changes are not live on main.
- [ ] PR #75 remains an unmerged draft. Its latest documentation-only head was not independently CI-tested.
- [ ] Independent source acquisition, artifact re-hash, qualified source approval, per-Ayah review, translation rights, Hadith/tafsir/dua rights, audio rights, authentication/authorization, hosted PostgreSQL operations, and manual RTL/accessibility/device QA remain release blockers.

### Agent branch inspection

- `jules/backend-foundation`: head `f84e35c242ab37ccafca0528a1d06e0d4b244834`, 3 ahead / 69 behind main; only `AGENT_TASK.md` and `JULES_NEXT_TASK.md` differ from main.
- `queen/frontend-foundation`: head `9ef788c81de85e9ebfa139b35c42d606c38f2010`, 2 ahead / 69 behind main; only `AGENT_TASK.md` differs from main.
- No implementation work is attributed to either assignment branch; neither branch was modified.
