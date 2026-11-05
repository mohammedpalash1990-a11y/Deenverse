# DEENVERSE QA & release readiness — 2026-11-05

**Decision: BLOCKED. No merge or deployment is authorized by this report.**

## Repository snapshot

- Repository: mohammedpalash1990-a11y/Deenverse
- Base branch: main
- Base SHA: f098d650a9cbc5aaaaadee6a925e68dfa9dbdb9a
- QA branch: qa/release-safety-2026-11-05
- QA branch is based directly on the recorded main SHA. Existing agent-owned branches were not modified.
- Main has no branch protection, no required status checks, and no repository rulesets at this snapshot.

## Production deployment and database evidence

- Render web service: deenverse-web, Free plan, Singapore. Latest live deploy: f098d650a9cbc5aaaaadee6a925e68dfa9dbdb9a.
- Render API service: deenverse-api, Free plan, Singapore. Latest live deploy: 09c0532588881ef6e90f02c9fe6ffd641ad9ca31.
- The API deploy SHA is 10 commits behind current main, but the GitHub compare shows only web/data files changed in those 10 commits; no backend file changed. The deployed API backend therefore matches the backend tree at the recorded main SHA.
- Render API logs at 2026-11-05 04:48:39Z report “DEENVERSE database schema is ready” after the production migration command. The migration runner rejects non-PostgreSQL production configuration.
- Neon project: deenverse-db (project ID cool-mud-31679014), main branch br-spring-night-a14ey96s, PostgreSQL 17, Singapore region, database deenverse. The required 10 tables exist.
- Read-only row counts: content_sources 1; content_source_approvals 1; quran_surahs 0; quran_ayahs 0; hadith_books 0; hadith_chapters 0; hadith_records 0; hadith_translations 0; hadith_grade_assessments 0; hadith_record_reviews 0.
- The only source row is tanzil-uthmani-v1, inactive. The database approval row says approved and its artifact_sha256 string equals content_sources.checksum, but both reviewer fields are project-owner-chat-authorization. The importer explicitly rejects that identity and requires a distinct independent reviewer plus the exact metadata digest in the review notes. This is not a valid independent approval.
- The source dossier still says the official artifact has not been acquired and independently verified. The database checksum string was not independently recomputed from the official download in this run. Do not treat the stored equality as artifact verification.
- The exact operational blocker for Quran import is the invalid/non-independent approval identity, compounded by the absence of preserved official artifact evidence. The source remains inactive and the Quran tables are empty.
- Neon security posture observed: allowed IP list empty, public connections not blocked, and the main branch is not protected. Harden network access, branch protection, and database roles before production sign-off.

## Content provenance and publication findings

- Main’s Quran reader fetched data/quran/tanzil/quran-uthmani.txt directly from raw.githubusercontent.com. Its parser checked only the total count of 6,236 rows, not the complete edition-specific artifact digest or independent approval.
- The same reader exposed EveryAyah audio URLs and an Audiomack external library without a DEENVERSE source dossier proving redistribution rights.
- Main’s QuranEnc Bengali translation route was publicly registered. Its adapter pinned a publisher version and validated response coordinates, but it did not require a DEENVERSE source approval record bound to an acquired, preserved artifact digest.
- Hadith endpoints use source/record provenance checks and primary plus independent review requirements. The production database contains no Hadith books or records, so the reader must remain empty/unavailable.
- No approved tafsir, dua, or audio corpus is present in the database.
- This QA branch disables the direct Quran/audio reader, removes the unverified Quran text file from the current tree, removes the raw GitHub CSP connect source, and unregisters the public QuranEnc translation route. Historical Git commits are not rewritten; the deleted text may remain accessible through old commit URLs.

## Backend API contract and data integrity

- Health/readiness: GET /api/v1/health and GET /api/v1/ready.
- Quran metadata: GET /api/v1/quran/surahs and GET /api/v1/quran/surahs/{surahNumber}.
- Single Ayah: GET /api/v1/ayah/{surahNumber}/{ayahNumber}; runtime checks the per-Ayah text SHA-256 against the stored text.
- Hadith: GET /api/v1/hadith/books, /books/{bookId}/chapters, /books/{bookId}/records, /records/{recordId}, and /search.
- Bengali translation route: disabled in this QA branch until source-specific approval exists.
- Frontend REST adapters structurally validate API envelopes and provenance. The generic content adapter intentionally supports Quran catalogue metadata only; the Quran reader on main bypassed it and fetched raw GitHub content directly. This branch removes that bypass.
- Current cursors are canonical base64-encoded numeric offsets, validated as non-negative safe integers. They are not signed or bound to book/search/locale/filter context. This can produce cross-query page inconsistencies; replace with query-bound opaque cursors before relying on pagination for a larger corpus.
- Source approval equality in the API compares the approval artifact_sha256 string to the source checksum string. It does not itself download/hash an immutable artifact. The Tanzil import pipeline recomputes the official artifact and metadata hashes before import, but the current independent-review precondition fails.

## Security, CORS, offline, RTL, and responsive UI

- Backend CORS uses exact configured origins, does not enable credentialed CORS, and has explicit allowlist tests.
- Helmet, a Content Security Policy, and a global rate limiter are configured. CSP still allows inline scripts/styles; evaluate nonce/hash-based script policy before a hardened production release.
- Current main exposes only public read-only content routes; no public approval-write/admin route is registered. Authentication is therefore not applied to public reads. Approval writes must remain restricted to a trusted operator process.
- The unmerged problem-report PR adds a public POST path and requires a separate abuse/authentication review before acceptance.
- The service worker caches only the root shell, immutable same-origin Next.js assets, manifest, and icon. It bypasses API and cross-origin requests; religious text, translations, audio, and user data are not cached.
- Existing Arabic renderers use lang=ar and dir=rtl; Bengali text uses Bengali locale metadata. The public Quran reader is disabled in this branch until content approval.
- Layout code uses responsive grid/flex and clamp sizing, but no real mobile/tablet/desktop browser viewport run was available in this automation. Responsive behavior is not certified by unit tests alone.

## Exact main CI evidence

- Main SHA f098d650a9cbc5aaaaadee6a925e68dfa9dbdb9a, workflow run 41957683025: https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/41957683025
- Backend job: typecheck passed; 83 tests, 83 pass, 0 fail, 0 skipped. The real PostgreSQL runtime/migration test passed. The production-startup subprocess test rejecting SQLite passed.
- Web job: typecheck passed; 18 test files, 17 passed and 1 failed; 171 tests, 170 passed and 1 failed. Failure: app-shell.test.tsx expected a region named “আল-কুরআন — আরবি ও বাংলা”, while the current reader exposed “আল-কুরআন — আরবি তিলাওয়াত” and did not expose the expected combobox. Production build did not run after the test failure.
- The web deploy of this failing main SHA is already live. No new deploy was triggered by this QA work.

## Open pull request inventory at the snapshot

- PR #1, feat(integration): reconcile API contract and source selection. Base main f098d650a9cbc5aaaaadee6a925e68dfa9dbdb9a; head integration/platform-foundation 9a10cad804093f72701460c2c323f7876732b760. 26 files: .github/workflows/openapi-contract.yml; backend/src/services/approved-quran-source.ts; backend/src/services/quran-ayah.ts; backend/src/services/quran-catalogue.ts; backend/test/quran-api.test.ts; backend/test/quran-ayah.test.ts; docs/AGENT-HANDOFF-STATUS.md; docs/API-CONTRACT.md; docs/AYAH-API-CONTRACT.md; docs/CONTENT-API-ERROR-MAPPING.md; docs/CONTENT-API-RESPONSE-PARSING.md; docs/IMPLEMENTED-API-RECONCILIATION.md; docs/INTEGRATION-CHECKLIST.md; docs/INTEGRATION-DECISIONS.md; docs/OPENAPI-DRAFT.yaml; docs/PHASE-1-MVP.md; docs/QA-PLAN.md; docs/REMAINING-INTEGRATION-WORK.md; docs/SOURCE-REGISTER.md; scripts/verify-openapi-routes.rb; src/components/app-shell.test.tsx; src/components/app-shell.tsx; src/components/quran-ayah-reader.test.tsx; src/components/quran-ayah-reader.tsx; src/lib/quran-translation-client.test.ts; src/lib/quran-translation-client.ts. Mergeable clean, not merged. CI run 42033682522: backend 85/85 pass, web 18 files/174 tests pass, 0 skipped; OpenAPI route check run 42033682520 passed; web foundation run 42033726957 passed.
- PR #11, docs(api): map frontend/backend integration gaps. Base integration/platform-foundation eac93a6616e73048ea3787dcced87bc471eb25bc; head assistant/api-integration-contract-audit 22e90ed26142c5bf6046a80830e08d43a6ec680b. One file: docs/API-INTEGRATION-GAP-REGISTER.md. Mergeable clean, no Actions run.
- PR #43, feat(quran): enforce per-Ayah human review before publication. Base main ef559abe96417acd376df60b0f6ef7973bfd28c6; head feat/quran-per-ayah-review-gate-20261104 12c9b3590b1d96274d84039bc29d4314648aa8a6. Six files: backend/src/app.ts; backend/src/db/migrate.ts; backend/src/db/migrations/20261104_000004_quran_ayah_reviews.ts; backend/src/routes/quran-ayah.ts; backend/src/services/quran-ayah.ts; backend/test/quran-ayah.test.ts. Dirty/conflicting. CI run 41757958528 cancelled; web foundation run 41757958432 passed.
- PR #45, feat(quran): add shareable multi-reviewer Ayah review workspace. Base feat/quran-per-ayah-review-gate-20261104 12c9b3590b1d96274d84039bc29d4314648aa8a6; head feat/quran-team-review-links-20261104 36054fbb5986b645a87e25fd6bc8e12abaf30762. Ten files: backend/.env.example; backend/src/app.ts; backend/src/db/migrate.ts; backend/src/db/migrations/20261104_000006_quran_team_reviews.ts; backend/src/routes/quran-review.ts; backend/test/quran-review.test.ts; docs/QURAN-TEAM-REVIEW-GUIDE.md; src/app/quran/review/[token]/page.tsx; src/app/quran/review/page.tsx; src/components/app-shell.tsx. Stacked on PR #43, mergeable state unstable. CI run 41760877560 cancelled.
- PR #47, Add direct in-app problem reporting. Base main 339d9c66057137ba5d1d1a6ff36232bd32f4cc29; head feature/unified-problem-reporting be096ab7161b1336c7351d06f1ffcfc20574d0f2. Nine files: backend/src/app.ts; backend/src/db/migrate.ts; backend/src/db/migrations/20261104_000004_problem_reports.ts; backend/src/routes/problem-reports.ts; backend/test/migrate.test.ts; backend/test/problem-reports.test.ts; src/app/globals.css; src/components/app-shell.tsx; src/components/settings-panel.tsx. Dirty/conflicting. CI run 41763195016 failed: backend 64 tests, 61 pass, 3 fail, 0 skipped; web 18 files/174 tests passed. Backend failures include readiness fixture expecting 200 but receiving 503 and incomplete problem-report validation expecting 0 persisted rows but receiving 1.
- PR #66, docs(qa): record Deenverse release-readiness evidence. Base main a7ff4130f6d74e9319b6d894c118d270b44171cd; head qa/release-readiness-evidence-20261104 7e2ba09349e92630c9c6be7fbbaff9ad5f9ac4ac. One file: docs/RELEASE-READINESS-2026-11-04.md. Mergeable clean but stale base; only web foundation run 41874698061 passed.
- PR #69, Publish Quran reader in public beta. Base main abb4dd06531d7585b13b8f29af45e7d05a995574; head codex/quran-public-beta-reader 5ce130f5e6b312948e3ed0165295572aa509e5e3. Six files: next.config.ts; src/components/app-shell.test.tsx; src/components/app-shell.tsx; src/components/quran-ayah-reader.test.tsx; src/components/quran-ayah-reader.tsx; src/lib/security-headers.test.ts. Dirty/conflicting and stale; no Actions run.
- PR #75, fix(release): fail closed for unapproved Quran and translation content. Base main f098d650a9cbc5aaaaadee6a925e68dfa9dbdb9a; head qa/release-safety-2026-11-05 a6cbb86a7bb43ef366ae8c6ecc811259b6848eb3. Eleven files; open draft, unmerged, mergeable clean. Exact-head CI run 42071469368 passed; web foundation run 42071469612 passed.

## QA branch changes in this PR

- backend/src/app.ts — unregister public QuranEnc translation routes.
- backend/test/quran-translation.test.ts — assert translation routes remain 404 until approval.
- src/components/quran-beta-reader.tsx — replace direct raw-GitHub text and unapproved audio with an accessible fail-closed state.
- src/components/app-shell.tsx — label the Quran section as approval-pending rather than live.
- src/components/app-shell.tsx — label the Quran section as approval-pending rather than live.
- src/components/app-shell.test.tsx — test the fail-closed state and no external source fetch.
- next.config.ts and src/lib/security-headers.test.ts — remove and test removal of raw.githubusercontent.com from connect-src.
- data/quran/tanzil/quran-uthmani.txt — delete the unverified public copy from the current tree.
- docs/API-CONTRACT.md and docs/CONTENT-SOURCE-APPROVAL.md — document actual endpoint/publication gates.
- docs/QA-RELEASE-READINESS-2026-11-05.md — preserve this evidence and next tasks.

## QA branch exact-SHA verification

- Functional candidate SHA: a6cbb86a7bb43ef366ae8c6ecc811259b6848eb3; base SHA: f098d650a9cbc5aaaaadee6a925e68dfa9dbdb9a.
- PR #75 is open as a draft, not merged, and currently mergeable clean. It changes exactly 11 files: backend/src/app.ts; backend/test/quran-translation.test.ts; data/quran/tanzil/quran-uthmani.txt (deleted); docs/API-CONTRACT.md; docs/CONTENT-SOURCE-APPROVAL.md; docs/QA-RELEASE-READINESS-2026-11-05.md; next.config.ts; src/components/app-shell.test.tsx; src/components/app-shell.tsx; src/components/quran-beta-reader.tsx; src/lib/security-headers.test.ts.
- DEENVERSE CI on the exact functional candidate SHA passed: https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/42071469368. Backend: typecheck/build passed; 80 tests, 80 pass, 0 fail, 0 skipped. Real PostgreSQL migration/runtime test passed. Production-startup subprocess test rejected SQLite before creating a database. Backend npm audit: 0 vulnerabilities.
- Web: typecheck and production build passed; 18 test files, 171 tests passed, 0 failed. Web npm audit: 0 vulnerabilities.
- Web foundation checks on the same exact SHA passed: https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/42071469612; 18 test files and 171 tests passed.
- The preceding functional commit 9322e6d5682aafc6c28bcd2d3eb55f932a6ba19a also passed CI run 42071128952 and web foundation run 42071129238, but it was superseded by the approval-pending topbar label in a6cbb86.
- These green checks resolve the main web test mismatch on the candidate branch; main remains at the failing base SHA until a reviewed merge. No merge or deployment was performed.

## Next release-blocking tasks

1. Obtain the exact official Tanzil artifact and license notice through the official publisher channel; preserve original bytes read-only and independently recompute artifact and metadata SHA-256 values.
2. Obtain a genuinely independent reviewer; replace the invalid project-owner-chat-authorization approval only through a controlled process. Keep the source inactive until exact source, edition, rights, full 114-Surah/6,236-Ayah coverage, ordering, per-Ayah digests, and human review all pass.
3. Re-import only through the guarded official-source pipeline; verify zero mismatches and that the production API serves only the exact approved edition.
4. Obtain separate publisher terms and exact edition approval for Bengali translation. Do not re-register the translation route before that gate passes.
5. Obtain separate redistribution rights and provenance for every recitation/audio source before restoring audio.
6. Review PR #1's single-approved-source selector and OpenAPI route contract; do not merge it until current main CI is green and the full diff is reviewed.
7. Replace offset cursors with signed, query-bound opaque cursors and test cross-book/search/filter replay.
8. Restrict Neon network access, protect the production branch, separate migration and runtime roles, and enable required GitHub status checks on main.
9. Run real browser accessibility and viewport checks at mobile, tablet, and desktop widths, including keyboard, screen-reader, RTL, and offline-shell behavior.
10. Re-run focused tests and full CI on the exact final candidate SHA. Do not merge or deploy while any blocking test, typecheck, security, integrity, or CI failure remains.


---

## Automation QA refresh — 2026-11-05 17:14 UTC

**Decision remains BLOCKED. No merge or deployment was performed.** This refresh supersedes stale branch-head, PR inventory, and check references in the earlier snapshot above.

### Exact repository and PR state

- Current `main`: `f098d650a9cbc5aaaaadee6a925e68dfa9dbdb9a`.
- Safety PR #75 base: `f098d650a9cbc5aaaaadee6a925e68dfa9dbdb9a`.
- Safety PR #75 head at the start of this refresh: `7c19026d8c15d6bb7b4654fa6a4ae70a5f50b61d` (`qa/release-safety-2026-11-05`), 3 commits ahead / 0 behind main.
- PR #75 is open, draft, unmerged, and GitHub reports `mergeable_state=clean`. This is not release approval.
- Main branch reports `protected=false`; repository rulesets endpoint returned an empty list. Required checks are therefore not enforced by branch protection/rulesets.

### Exact-SHA CI evidence

**Main SHA `f098d650a9cbc5aaaaadee6a925e68dfa9dbdb9a`:**
- [DEENVERSE CI run 41957683025](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/41957683025) failed.
- Backend job: typecheck/build passed; 83 tests, 83 pass, 0 fail, 0 skipped. Real PostgreSQL migration/runtime test passed. Production-startup subprocess test rejected SQLite before creating the database.
- Web job: typecheck passed; 18 test files, 17 passed / 1 failed; 171 tests, 170 passed / 1 failed. The failing assertion in `src/components/app-shell.test.tsx` expects the old Bengali-Arabic region name and Surah combobox; the current main reader renders the Arabic-only reader with a different heading and controls. The web production build and audit did not run after the test failure.
- Render nevertheless has this failing main SHA live on the web service.

**Safety PR #75 exact head `7c19026d8c15d6bb7b4654fa6a4ae70a5f50b61d`:**
- [DEENVERSE CI run 42071843318](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/42071843318) passed.
- Backend: typecheck/build passed; 80 tests, 80 pass, 0 fail, 0 skipped. PostgreSQL integration/runtime test passed. SQLite production-startup subprocess guard passed. The QuranEnc route-unavailable test passed. Tanzil parser/import fixture tests passed. Backend audit: 0 vulnerabilities.
- Web: typecheck/production build passed; 18 test files, 171 tests, 171 pass, 0 fail. Web audit: 0 vulnerabilities.
- [Web foundation run 42071843376](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/42071843376) passed on the same head; [repeat run 42072112350](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/42072112350) also passed, with 18 files / 171 tests passing.
- The candidate's green CI validates the fail-closed UI/API changes, not source approval, production network hardening, or browser/device certification.

**Integration PR #1 exact head `9a10cad804093f72701460c2c323f7876732b760`:**
- [DEENVERSE CI run 42033682522](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/42033682522) passed: backend 85/85 tests; web 18/18 files and 174/174 tests; 0 skipped; both typechecks/builds passed; both audits reported 0 vulnerabilities.
- [OpenAPI route check run 42033682520](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/42033682520) passed; [web foundation run 42033726957](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/42033726957) passed.
- PR #1 is open, not draft, and clean/mergeable (82 commits ahead / 0 behind main). Do not merge it as-is: it retains the public QuranEnc translation route, and its Quran source selector compares stored digest strings but does not itself recompute an immutable artifact digest. Its OpenAPI snapshot includes the translation route that PR #75 deliberately disables. Reconcile the contract and safety gate first.

### Current open PR inventory (all heads checked against current main)

| PR | Exact head | Current-main relationship | Exact check disposition | Merge/release disposition |
|---|---|---:|---|---|
| #75 safety gate | `7c19026d8c15d6bb7b4654fa6a4ae70a5f50b61d` | 3 ahead / 0 behind | CI + web foundation green | Keep draft; do not merge/deploy yet |
| #1 integration | `9a10cad804093f72701460c2c323f7876732b760` | 82 ahead / 0 behind | Backend 85/85, web 174/174, OpenAPI check green | Open; reconcile translation approval and OpenAPI with #75 |
| #11 API gap docs | `22e90ed26142c5bf6046a80830e08d43a6ec680b` | 37 ahead / 69 behind | No checks | Stacked on #1; stale, docs-only |
| #69 Quran reader | `5ce130f5e6b312948e3ed0165295572aa509e5e3` | 8 ahead / 5 behind | No checks | Dirty/conflicting; stale |
| #66 release-readiness docs | `7e2ba09349e92630c9c6be7fbbaff9ad5f9ac4ac` | 1 ahead / 11 behind | One web-foundation check green | Stale, docs-only |
| #47 problem reporting | `be096ab7161b1336c7351d06f1ffcfc20574d0f2` | 12 ahead / 40 behind | Backend failed (61 pass / 3 fail / 0 skipped); web passed | Dirty/conflicting; do not merge; public POST needs abuse/auth review |
| #43 Ayah review gate | `12c9b3590b1d96274d84039bc29d4314648aa8a6` | 7 ahead / 41 behind | Backend CI cancelled; web foundation passed | Dirty/conflicting; do not merge |
| #45 team review workspace | `36054fbb5986b645a87e25fd6bc8e12abaf30762` | 30 ahead / 41 behind | Backend CI cancelled; web passed | Stacked on #43; unstable; do not merge |

No changes were made to other workstream branches.

### Live deployment and PostgreSQL verification

- Render web service `deenverse-web`: live deploy `dep-dblutft6e07s73aj96cg`, commit `f098d650a9cbc5aaaaadee6a925e68dfa9dbdb9a`, finished 2026-11-05 02:50:45 UTC.
- Render API service `deenverse-api`: live deploy `dep-dblrlbugekts73c7kka0`, commit `09c0532588881ef6e90f02c9fe6ffd641ad9ca31`, finished 2026-11-04 23:08:36 UTC.
- API deploy is 10 commits behind current main. GitHub compare shows only web/data files changed in those 10 commits; no backend file changed. The deployed API therefore has the same backend route registration as main, including the public QuranEnc translation route.
- Render has auto-deploy disabled for both services. The safety PR has not been deployed.
- Render API logs show `npm run db:migrate`, “DEENVERSE database schema is ready”, then “DEENVERSE backend listening” at 2026-11-05 04:48:32–04:48:44 UTC.
- Neon project `deenverse-db` (`cool-mud-31679014`) is PostgreSQL 17 in `aws-ap-southeast-1`; default branch `main` (`br-spring-night-a14ey96s`) is ready. The ten required tables exist.
- Read-only production row counts remain: `content_sources=1`, `content_source_approvals=1`; all Quran and Hadith corpus/review tables are zero.
- The sole source is inactive Tanzil Uthmani 1.1. Its approval row is marked approved and its stored `artifact_sha256` equals the stored source checksum, but both reviewer identities are `project-owner-chat-authorization`. The importer explicitly rejects that identity and requires distinct reviewers plus the exact text-artifact and metadata digests. The source dossier says the official bytes have not been acquired/preserved. Therefore the approval is invalid and no Quran import is authorized.
- The database has no Hadith books, chapters, records, translations, grade assessments, or reviews. There are no approved tafsir, dua, or audio records.
- Neon project settings still show an empty allowed-IP list, `block_public_connections=false`, and an unprotected default branch.
- The `deenverse_api` Postgres role is non-superuser but currently has SELECT, INSERT, UPDATE, and DELETE grants on every content table. `deenverse_owner` has CREATEDB, CREATEROLE, REPLICATION, and BYPASSRLS. The Render service's actual connection role could not be read through the available Render read interface; do not assume it uses the least-privilege role. Restrict the runtime role to the minimum required (read-only for current GET-only API) and separate it from the migration owner before sign-off.

### Additional QA findings

- Main's deployed Quran UI fetches the repository text file directly from `raw.githubusercontent.com`, validates the total 6,236 rows and basic coordinates, but does not validate complete per-Surah counts, unique/order-preserving coordinates, or the approved artifact digest. It displays Tanzil attribution/link but the visible reader does not show the complete required copyright notice.
- Main's reader also exposes EveryAyah audio URLs and an Audiomack library without a DEENVERSE rights dossier. The official Tanzil terms permit only verbatim, unmodified redistribution with attribution/link and the copyright notice; the official QuranEnc terms allow republishing only under their stated no-modification, attribution/version/transcript, update, notification, and advertising conditions. These conditions do not substitute for DEENVERSE's required artifact acquisition and approval evidence. See [Tanzil text license](https://tanzil.net/docs/Text_License), [Tanzil download terms](https://tanzil.net/download/), and [QuranEnc API/republication terms](https://quranenc.com/en/home/api/).
- The deployed API registers `/api/v1/translation/bn/...` and calls QuranEnc without a DEENVERSE approval row bound to a preserved, independently reviewed artifact. PR #75 unregisters those routes, but is not deployed.
- The Quran catalogue, Ayah, and Hadith REST adapters validate response envelopes/provenance. Main's visible Quran reader bypasses those adapters and fetches raw GitHub content. The Hadith UI uses its REST adapter and fails closed with the currently empty database.
- Pagination cursors are canonical base64 numeric offsets, not signed or bound to the book/search/locale/filter query. Cross-query replay can yield inconsistent page positions; replace them with query-bound opaque cursors before publishing a larger corpus.
- CORS code uses exact configured origins and has allow/deny tests, but the deployed Render CORS environment value could not be independently read. The code also allows origin-less server-to-server requests and lists POST/PUT/DELETE methods although main has no public write route. No API authentication/session system is implemented; current registered content endpoints are public GET-only, with no public approval-write route.
- The web CSP still permits `'unsafe-inline'` scripts/styles. Use nonce/hash-based script policy for a hardened release. The backend rate limiter and Helmet are present.
- The service worker registers only in production, caches the app shell and same-origin static assets/manifest/icon, and bypasses API, cross-origin, POST, and religious content/audio. This is the correct conservative offline boundary. Browser-level offline verification was not run.
- Arabic Quran/Hadith text uses `lang=ar` and `dir=rtl`; translation components use locale/direction metadata. Unit tests cover skip navigation, mobile menu state, Escape/focus restoration, and labelled controls. No real browser/screen-reader test or mobile/tablet/desktop viewport matrix was run; responsive/RTL accessibility is not certified.

### Exact changed files in the safety PR

PR #75 changes exactly:
1. `backend/src/app.ts`
2. `backend/test/quran-translation.test.ts`
3. `data/quran/tanzil/quran-uthmani.txt` (deleted)
4. `docs/API-CONTRACT.md`
5. `docs/CONTENT-SOURCE-APPROVAL.md`
6. `docs/QA-RELEASE-READINESS-2026-11-05.md` (this evidence record)
7. `next.config.ts`
8. `src/components/app-shell.test.tsx`
9. `src/components/app-shell.tsx`
10. `src/components/quran-beta-reader.tsx`
11. `src/lib/security-headers.test.ts`

### Next release-blocking tasks

1. Keep Quran, translation, tafsir, Hadith, dua, and audio unavailable until each exact artifact/source has preserved bytes, verified SHA-256, explicit redistribution terms, attribution, edition/version, and independent human approval. Do not use the current owner-chat approval row.
2. Preserve the official Tanzil text and metadata artifacts read-only; independently recompute both digests; complete exact parser/import validation and the human review protocol before import. Do not enable the seed flag or activate the source before that.
3. Obtain a separate QuranEnc Bengali edition snapshot and rights/review record. Keep the translation API route disabled until its exact artifact and terms are approved.
4. Remove EveryAyah/Audiomack from production until rights to stream/embed are evidenced for the exact recordings.
5. Harden Neon network access, protect the production branch, remove DML from the runtime API role, and ensure Render uses a least-privilege runtime role distinct from the migration owner.
6. Enable GitHub branch protection with required CI checks; keep PR #75 draft until the current release blockers are addressed.
7. Reconcile PR #1/OpenAPI with PR #75's disabled translation route; add independent-review checks at the API source selector, then rerun CI on the reconciled exact head.
8. Replace offset cursors with signed, query-bound opaque cursors and add cross-book/search/filter replay tests.
9. Verify deployed CORS allowlist and CSP headers through an authenticated runtime/config inspection; replace unsafe-inline script policy where feasible.
10. Run browser automation at mobile, tablet, and desktop widths; test keyboard, screen reader, RTL, install, and offline shell behavior.
11. Re-run focused source-import, approval, Hadith review, CORS, API-contract, and SQLite-production-guard tests plus full repository CI on the exact final candidate SHA.
12. Do not merge or deploy while any security, integrity, typecheck, test, or CI blocker remains.
