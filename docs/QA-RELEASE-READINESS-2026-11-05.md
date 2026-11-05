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

## QA branch changes in this PR

- backend/src/app.ts — unregister public QuranEnc translation routes.
- backend/test/quran-translation.test.ts — assert translation routes remain 404 until approval.
- src/components/quran-beta-reader.tsx — replace direct raw-GitHub text and unapproved audio with an accessible fail-closed state.
- src/components/app-shell.test.tsx — test the fail-closed state and no external source fetch.
- next.config.ts and src/lib/security-headers.test.ts — remove and test removal of raw.githubusercontent.com from connect-src.
- data/quran/tanzil/quran-uthmani.txt — delete the unverified public copy from the current tree.
- docs/API-CONTRACT.md and docs/CONTENT-SOURCE-APPROVAL.md — document actual endpoint/publication gates.
- docs/QA-RELEASE-READINESS-2026-11-05.md — preserve this evidence and next tasks.

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
