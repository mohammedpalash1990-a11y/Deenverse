# DEENVERSE Verified Content Source Register

**Snapshot:** 2026-11-11 — current main `f56731a39606027da2e8240e729503713521857d`  
A provider being listed or reachable through an API does not approve its content for import, redistribution, caching, offline use, or publication. Each content type and edition requires its own evidence.

| Content type | Candidate/provider | Edition/version | Current implementation | Rights/authenticity status | Import/publication status |
|---|---|---|---|---|---|
| Quran Arabic | Tanzil Project | Uthmani, Version 1.1 | Current `main` mounts the fail-closed approval-pending `QuranBetaReader`; it makes no fetch and renders no Quran text, translation, or audio. The source-gated Ayah API and official-source importer remain dormant until approval evidence is valid. | Tanzil's official CC BY 3.0 terms permit verbatim distribution with clear Tanzil attribution, a link to `tanzil.net`, and the required copyright notice; modification is prohibited. The exact official project artifact and acquisition options/time remain unverified. A user-library candidate copy was structurally checked (114 Surahs / 6,236 Ayahs) and hashed as `6933e133dd56db778c801bf738848454e43648105a151e8d84d86a7cae39ec5f`; this differs from the production source/approval checksum `ac0724796cbbda0f4801470fbbd11d0f3c5802067bae0493466d0128b0c667af`. Qualified independent review is still absent. | Not imported or activated. Production Quran tables contain zero rows. Keep the reader fail-closed until artifact provenance, exact digest, rights evidence, and independent review are complete. |
| Quran Bengali translation | QuranEnc.com; translator Abu Bakr Muhammad Zakaria | `bengali_zakaria`, V1.1.1 (official dashboard lists release date 2021-05-22) | Parser/client code is dormant; no public translation route is registered and the fail-closed Quran UI makes no translation request. | QuranEnc's published republishing conditions require unchanged text, publisher/source attribution, version identification, preserved transcript information, notifying QuranEnc of translation notes, updating to the latest source version, and no inappropriate advertisements. The exact V1.1.1 artifact/transcript metadata is not retained or hashed in this repository; separate caching/offline/export permissions are not established. | Not imported or served. Keep disabled until the exact official artifact and its metadata are acquired, hashed, and reviewed against the applicable use conditions. |
| Hadith Arabic/translation | HadeethEnc, Sunnah.com API, Dorar are research candidates | Exact edition TBD per provider | Source-gated API/reader and dual narration-review checks exist | Provider-specific access, edition, grading, attribution, and reuse terms remain to be approved. | No approved collection or production corpus recorded. |
| Tafsir | TBD | TBD | No production source/API verified | Authenticity, publisher, edition, attribution, license, and caching rights unreviewed | Blocked |
| Dua/Adhkar | TBD | TBD | No approved library/source verified | References, grading, edition, attribution, and redistribution rights unreviewed | Blocked |
| Recitation audio | EveryAyah and Audiomack were referenced by the legacy beta reader | Reciter-specific recordings; exact editions TBD | Current `main` fail-closed reader renders no audio element or external audio link. | Recording identity, ownership, attribution, streaming, caching, download, and offline rights are not evidenced. | Not approved; playback remains disabled until each recording has a source-specific rights dossier. |

## 2026-11-05 repository evidence refresh

- Current `main` is `f098d650a9cbc5aaaaadee6a925e68dfa9dbdb9a`. It contains `data/quran/tanzil/quran-uthmani.txt` and `data/quran/tanzil/SOURCE_INFO.md`; the source-info file records only source, Uthmani text, Version 1.1, URL, and an unverified statement that the original text is unchanged.
- On current `main`, `src/components/app-shell.tsx` still mounts the legacy `QuranBetaReader`, which fetches the raw GitHub file and exposes unverified audio links. The integration branch now mounts a fail-closed approval-pending placeholder instead; it does not request the Ayah or translation APIs and does not render audio. These changes are in the unmerged integration PR #1 and are not live on `main`.
- The official Tanzil download page and text-license page were checked on 2026-11-05. Tanzil permits verbatim copying/distribution for websites and applications, requires clear Tanzil attribution and a link to `tanzil.net`, requires preservation of its copyright/license notice, and prohibits changing the text. This establishes the published terms, not the provenance of the particular GitHub-uploaded bytes.
- No exact acquisition timestamp, selected download options, independently computed artifact SHA-256, preserved original download, or completed human source-review evidence is present in the current source register. `docs/TANZIL-SOURCE-DOSSIER.md` still says no artifact has been downloaded; that statement must be reconciled with the committed public copy.
- The importer and seed path require a separate approval record bound to the exact text and metadata digests. No production database import/activation or per-Ayah human review is evidenced by the repository snapshot. Do not treat the committed file or its UI display as source approval.
- The legacy beta-reader component also references EveryAyah MP3 paths and an Audiomack album. The integration branch no longer mounts that component in `AppShell`, so those external links are not rendered by the integration UI. Their recording-specific rights and permitted streaming/cache/offline uses remain unverified; no approved audio corpus exists.

## Tanzil import prerequisites

The main-branch importer/seed code:
- downloads only from the official HTTPS Tanzil domain and rejects redirects outside that domain;
- validates the official text/metadata, exact coordinates/order, 114 Surahs and 6,236 Ayahs for the pinned Uthmani edition, and the required license-footer shape;
- computes text-artifact, metadata, and per-Ayah SHA-256 digests;
- requires a pre-registered inactive source and a separate independent approval whose reviewer differs from the source reviewer and whose approval record is bound to both exact artifact digests;
- refuses partial/mixed existing Quran data.

The public repository copy is not accompanied by a reproducible official acquisition record. The source dossier still records no acquired official artifact, and no completed independent source review or Ayah human approvals are evidenced. Reconcile the dossier before treating the committed file as the approved artifact. Do not create approval rows merely to make the importer run. A checksum proves integrity against a byte sequence; it does not establish scholarly correctness.

## Required evidence before any import or public release

1. Exact official source URL, filename, edition/version, retrieval time, and acquisition method.
2. Original bytes retained unchanged outside the Git repository.
3. Artifact and license-notice SHA-256; parser/importer version; complete validation report.
4. Exact attribution and license text plus a use-specific decision for display, hosting, redistribution, caching, offline, export, and backup.
5. Independent reviewer identity/role, evidence, date, and decision.
6. Per-record integrity and required human review appropriate to the content type.
7. Rollback/retirement plan if source terms change or permission is withdrawn.

Never commit source credentials, secrets, restricted artifacts, or production content datasets.


## 2026-11-06 integration safety refresh

- `integration/platform-foundation` now removes both QuranEnc public routes, removes the raw-content host from browser CSP, replaces the public Quran reader with a no-fetch approval-pending state, and deletes the unverified Quran text copy from the current branch tree.
- The single-Ayah backend source selector now requires distinct source and artifact reviewers and rejects the project-owner chat authorization identity. The official Tanzil importer still requires exact artifact/metadata validation and independent approval before import.
- These are integration-branch changes only. `main` remains unchanged and still contains the older public beta reader until a reviewed safety PR is merged.
- No Quran Arabic, Bengali translation, Hadith, tafsir, dua, or audio data was imported or generated by this refresh.


## Current publication-state reconciliation — 2026-11-09

This section supersedes older statements in this register that describe the raw-GitHub beta reader or say that the old reader remains active on main.

- Current main baseline inspected: `f15e82748f1724d5995fe863e54d178a8a22b2b7`.
- `src/components/app-shell.tsx` mounts `QuranBetaReader`, but the current `src/components/quran-beta-reader.tsx` is an approval-pending placeholder. It performs no fetch and renders no Quran text, translation, or audio. The current Content Security Policy does not allow `raw.githubusercontent.com`.
- `data/quran/tanzil/SOURCE_INFO.md` and `docs/TANZIL-SOURCE-DOSSIER.md` state that no official artifact has been acquired for this workflow. The path `data/quran/tanzil/quran-uthmani.txt` is absent from current main (GitHub Contents API returned 404). No artifact digest, acquisition timestamp/options, or independent source review is recorded. Tanzil remains a candidate, not approved for import or publication.
- Tanzil's published CC BY 3.0 terms allow verbatim copying/distribution with the required attribution, source link, and copyright/license notice, and prohibit changing the text. Published terms do not authenticate an absent or previously uploaded artifact.
- QuranEnc Bengali Zakaria V1.1.1 remains a candidate. Public translation routes are not registered, and web/mobile redistribution, hosting, caching, offline, and export rights remain unverified.
- Hadith API/readers are source-gated. PR #80 is merged and record-level primary/independent review rows are bound to the record's exact source ID. No production Hadith collection or corpus approval is recorded; each collection/edition and translation needs its own rights and review evidence.
- Tafsir and dua/adhkar sources remain TBD and unpublished.
- Recitation audio remains disabled. No active audio API/adapter or approved recording-specific streaming, caching, download, or offline rights are evidenced.
- The integration candidate additionally ports PR #85 reviewer-identity normalization, but its combined exact-head CI is pending. Do not treat that candidate as deployed main behavior before merge.

No Quran Arabic, translation, tafsir, Hadith, dua, or audio corpus was imported or generated by this integration pass. Do not seed synthetic religious records to make an endpoint return data.


## Current repository and production evidence — 2026-11-11

This dated snapshot supersedes all earlier statements above about the current main branch, mounted Quran reader, active integration PR, and production database state. Earlier dated sections are retained as historical audit notes.

- GitHub `main` is `888157747892681ed50360c1140d482967354ceb` (PR #91 merge commit). The mounted `QuranBetaReader` is the fail-closed approval-pending placeholder: it makes no source fetch and renders no Quran text, translation, or audio.
- The exact main commit has two completed successful checks: Backend typecheck/tests/build and Web typecheck/tests/production build (Actions run #42796282839).
- The main branch protection API reports `protected: false`; required status-check enforcement is off.
- The Neon project `deenverse-db` default branch is Ready but unprotected. Project IP allowlist is empty, `protected_branches_only=false`, and public connections are not blocked.
- Read-only production row counts: `quran_surahs=0`, `quran_ayahs=0`, `hadith_books=0`, `hadith_chapters=0`, `hadith_records=0`, `hadith_translations=0`, `hadith_grade_assessments=0`, and `hadith_record_reviews=0`. There is one source row and one approval row; both identify the reviewer as `project-owner-chat-authorization`. The source is inactive. The matching stored checksum strings are metadata and have not been independently recomputed from an acquired official artifact.
- The open PR list still contains old overlapping work (#85, #86, #87, #89) after #91 merged the corresponding reviewer-identity, Hadith cursor, and PWA persistence changes. These PRs require reconciliation before any further integration.
- Render runtime, deploy history, logs, API health/readiness, live CORS, and Render-to-Neon connectivity were not rechecked in this run because the available Render workspace has not been confirmed for use.
- Authentication implementation, independent religious-content approval, official immutable source artifact acquisition and digest recomputation, and manual RTL/accessibility/offline/device QA remain unverified or blocked. No religious corpus is present in production.

No Quran, translation, Hadith, tafsir, dua, or audio content was imported or activated by this verification.


## Production and release recheck — 2026-11-11 09:36 UTC

This snapshot supersedes the 2026-11-11 01:11 UTC snapshot above for current repository, Render, and Neon state. Earlier entries remain historical evidence.

### GitHub mainline

- Current `main` is `c4d37a0f7f044405c6efe469fcc7b4710902f5a7`. PR #91, PR #92, and PR #93 are merged. PR #93 adds the in-app problem-report form and additive `problem_reports` migration; its exact-head backend, web, and OpenAPI checks passed, and the post-merge main backend/web CI passed.
- GitHub reports `main` as unprotected. The repository has no enforced required status checks.
- PR #47's stale, 46-commits-behind implementation branch was closed as superseded by PR #93. PR #93 is the current merged implementation.
- The current main Quran reader remains the fail-closed approval-pending placeholder. It makes no direct Quran/audio source request and renders no religious text.

### Render production services

- The `deenverse-api` service is on branch `main`, but auto-deploy is disabled. Its latest live deployment is commit `f15e82748f1724d5995fe863e54d178a8a22b2b7` from 2026-11-08 22:53 UTC, not current main. The service has no configured Render health-check path and its service IP allowlist is `0.0.0.0/0`.
- At 2026-11-11 09:35 UTC, `GET /api/v1/health` returned HTTP 200 with `status=healthy`; `GET /api/v1/ready` returned HTTP 200 with `database=connected` and `migrations=applied`. The successful readiness response confirms the currently deployed API can connect to its configured database; it does not prove the current main code is deployed.
- The `deenverse-web` service is also on branch `main`, but auto-deploy is disabled. Its latest live deployment is commit `f098d650a9cbc5aaaaadee6a925e68dfa9dbdb9a` from 2026-11-05 02:49 UTC, substantially behind current main. It has no configured Render health-check path and its service IP allowlist is `0.0.0.0/0`.
- A fresh read of the live web HTML still exposes the legacy Quran reader UI: “QURAN · ARABIC & AUDIO”, Tanzil Uthmani 1.1, 114 Surahs, 6,236 Ayahs, a reciter selector, and “সম্পূর্ণ আরবি কুরআন লোড হচ্ছে…”. This conflicts with current main's fail-closed reader. The live bundle must be treated as a release-safety incident until the current fail-closed mainline is deployed and rechecked. This HTML fetch did not establish which external network requests the browser subsequently makes.
- Both Render services are configured for public access. Current Render environment-variable values could not be inspected through the available read actions; therefore the deployed `CORS_ALLOWED_ORIGINS` / `CORS_ORIGIN` values and browser CORS behavior remain unverified.
- Render's latest deploy records do not include current main `c4d37a0`. No production deployment or environment change was made.

### Neon production database and content provenance

- Neon `deenverse-db` default branch is Ready but `protected=false`. The project IP allowlist is empty, `protected_branches_only=false`, and `block_public_connections=false`.
- Read-only production counts: `content_sources=1`, `content_source_approvals=1`, `quran_surahs=0`, `quran_ayahs=0`, `hadith_books=0`, `hadith_chapters=0`, `hadith_records=0`, `hadith_translations=0`, `hadith_grade_assessments=0`, and `hadith_record_reviews=0`.
- The single Tanzil source row is inactive. Its stored `license_id=CC-BY-3.0`, attribution, `redistribution_allowed=true`, and checksum are database metadata, not independently verified rights or artifact evidence. The source reviewer and approval reviewer are both `project-owner-chat-authorization`; this is not independent human approval. The stored checksum strings match, but no immutable official artifact was acquired and independently re-hashed in this run.
- The official Quran text file `data/quran/tanzil/quran-uthmani.txt` is absent from current main. The `problem_reports` table is also absent from Neon because PR #93 has not been deployed and no production migration was run.

### Remaining release gates

- Deploy current main to the public web service only after explicit production-deployment authorization; recheck the live page and confirm the fail-closed reader is actually served. Do not assume a GitHub merge updates Render while auto-deploy is disabled.
- Before deploying the new API, verify its exact CORS allowlist and `NEXT_PUBLIC_API_BASE_URL`, then let the existing PostgreSQL migration runner apply the additive `problem_reports` migration and verify readiness. No manual production SQL was run.
- Keep Quran, translation, Hadith, tafsir, dua, and audio unavailable until exact immutable artifacts, independently recomputed SHA-256 digests, source-specific redistribution rights/attribution, and qualified independent human approval are evidenced.
- Authentication/authorization remains unimplemented or unverified. Manual RTL, screen-reader, accessibility, offline, and physical-device QA remain outstanding. CI and service-worker unit tests are not substitutes for those manual checks.
- Browser network inspection was not completed because the available TinyFish browser-automation wallet balance is $0.00. No secret values were retrieved or exposed.

No production content, database rows, network permissions, Render environment variables, or deployments were changed by this audit.


### Pull-request reconciliation — 2026-11-11

- Merged: PR #91 (reviewer-identity, Hadith cursor, and PWA persistence integration), PR #92 (source-register evidence refresh), and PR #93 (in-app problem reporting).
- Closed as superseded by current main: PRs #47, #85, #86, #87, #89, #75, and #77. PR #47's report implementation was ported to current main and merged as PR #93. PRs #85–#87's code/test files are byte-identical to current main after PR #91. PR #89's integration snapshot is based on an older main and its code changes are already integrated; its remaining documentation snapshot is superseded by PRs #92 and #93.
- Closed for release safety: PR #69, which reintroduces a direct browser-side raw-GitHub Quran fallback and unapproved translation/audio publication. The current main reader remains fail-closed.
- Closed as out of scope: PR #45's 3–5-person shareable review workspace. The requested public feedback path is implemented in PR #93; reports do not approve or publish religious content.
- Still open and not safe to merge automatically: PR #43 (per-Ayah review workflow, based on an old branch and 48 commits behind current main), PR #79 (share-card/integration branch, 136 commits ahead and 6 behind current main at the last comparison), and PR #11 (older API documentation branch). Their current heads need separate review and exact-head CI before any merge. No religious-content or deployment change is authorized by these PRs.


### Official source redistribution terms recheck — 2026-11-11

- Tanzil's official Text License and Download pages state that verbatim Quran text may be copied and distributed under CC BY 3.0, but the text must not be changed; the Tanzil source/link and required copyright notice must accompany the copy. This establishes published general terms, not the identity, completeness, digest, or independent approval of the absent project artifact.
- QuranEnc's official Bengali Abu Bakr Zakaria page states that translations may be downloaded and republished subject to conditions: no modification/addition/deletion; clearly identify publisher and source; mention the version; preserve transcript information; notify QuranEnc about notes; keep the translation updated to the latest source version; and do not display inappropriate advertisements.
- These official terms improve the rights evidence for the named sources, but the project still lacks the exact downloaded translation artifact, verified version/transcript metadata, and an evidence trail proving compliance. Separate caching/offline/export permissions are not established by the current project record. No translation route or corpus was activated.


### Deployed web source-code verification — 2026-11-11

- The deployed web commit `f098d650a9cbc5aaaaadee6a925e68dfa9dbdb9a` contains `src/components/quran-beta-reader.tsx` with an active `useEffect` fetch from `https://raw.githubusercontent.com/mohammedpalash1990-a11y/Deenverse/main/data/quran/tanzil/quran-uthmani.txt`. The same deployed file constructs recitation URLs under `https://everyayah.com/data/` and includes an external Audiomack album for a reciter. Its deployed `next.config.ts` explicitly allows `https://raw.githubusercontent.com` in `connect-src`.
- This is stronger than the live HTML evidence alone: the currently deployed source code contains an executable direct Quran-text fetch and unverified audio integrations. The live page HTML independently displays the Arabic/audio reader UI. Browser network capture was not completed, so actual request completion is not claimed.
- Current main has a different `src/components/quran-beta-reader.tsx` placeholder, no raw GitHub/Audiomack/EveryAyah references in that component, and a CSP without the raw GitHub exception. Render auto-deploy is off, so this mainline safety change has not reached the public web service.
- The currently deployed API commit `f15e82748f1724d5995fe863e54d178a8a22b2b7` does not contain the PR #93 problem-report route or migration; the currently deployed web commit `f098d650a9cbc5aaaaadee6a925e68dfa9dbdb9a` does not contain the Settings problem-report component. The Neon `problem_reports` table is absent. PR #93 is merged source code, not a live production feature.


### Raw Quran URL follow-up — 2026-11-11

- The exact raw-GitHub URL embedded in the deployed legacy reader currently returns HTTP 404: `https://raw.githubusercontent.com/mohammedpalash1990-a11y/Deenverse/main/data/quran/tanzil/quran-uthmani.txt`. Therefore this audit does not claim that the legacy web deployment successfully delivered Quran text. It does prove the deployed bundle still attempts that unapproved fetch and still contains EveryAyah/Audiomack audio integrations whose source-specific rights have not been established.
- The live page's server-rendered HTML shows the legacy Quran/audio UI and a loading state. Browser-side post-hydration behavior and actual audio playback were not observed because the browser automation wallet was unavailable. Keep the public deployment classified as unsafe/stale until the fail-closed mainline is deployed and the live UI/network behavior is rechecked.


- Remaining PR evidence: PR #79's exact old head passed its recorded backend and web CI runs, but its branch is 136 commits ahead and 6 behind current main; it must be rebased and retested before merge. PR #43's backend CI was cancelled (its web check passed) and it is 48 commits behind current main. PR #11 has no exact-head CI and is 37 commits ahead / 76 behind current main. None was merged.


### Support-report operational limitation — 2026-11-11

- PR #93 implements the public Settings form and POST storage route, but it does not add an authenticated staff inbox, report-list API, assignment workflow, or notification delivery. Reports are stored in `problem_reports` with status `new`; operational triage currently requires authorized database access. Do not expose report retrieval publicly until authentication/authorization is implemented.
- The new form and API are not live in Render: the current web/API deployment commits predate the Settings component, report route, and migration. The Neon production database also does not yet contain the `problem_reports` table.


## Current verification after PR #96 — 2026-11-11

This section supersedes earlier dated statements above about the current main SHA, open pull requests, and production database state. Older audit entries are retained as historical records.

### GitHub mainline and checks

- Current `main`: `f56731a39606027da2e8240e729503713521857d`. PR #96, “test(security): guard the fail-closed Quran reader”, merged at 2026-11-11 09:53:47 UTC as this commit.
- PR #96 adds one frontend regression test only. It asserts that the approval-pending reader makes no network fetch, renders no audio element or external link, and continues to show the approval-pending status. No Quran/Hadith data, runtime code, production configuration, or deployment was changed by PR #96.
- PR #96 exact-head checks passed: DEENVERSE CI run #42998488240 (backend and web jobs) and Web foundation run #42998488339 (verify). Post-merge main CI run #42999013078 passed both backend typecheck/tests/build and web typecheck/tests/production build.
- GitHub still reports `main` as unprotected; required status-check enforcement is off.
- Open PRs after #96: #79, #43, and #11. PR #79 is based on old `integration/platform-foundation` SHA `a7ad2eb4dae5d2fdcfb682e1747d4b17d56dab29`, changes 48 files, and GitHub reports it as dirty/non-mergeable; its recorded exact-head CI passed, but it requires a current-main rebase and fresh review. PR #43 is based on old main SHA `ef559abe96417acd376df60b0f6ef7973bfd28c6`; its backend check was cancelled, so it is not merge-ready. PR #11 is based on the same old integration SHA as #79, GitHub reports it dirty/non-mergeable, and it has no exact-head checks. None was merged.
- PR #91 (platform integration), #92 (source-register evidence), #93 (problem reporting), #94 (production safety evidence), #95 (problem-report error announcements), and #96 (fail-closed reader regression test) are merged.

### Neon production database

- Project `deenverse-db` (`cool-mud-31679014`) and default branch `main` (`br-spring-night-a14ey96s`) are Ready. The branch is unprotected. Project IP allowlist is empty, `protected_branches_only=false`, and `block_public_connections=false`.
- Read-only row counts: `content_sources=1`, `content_source_approvals=1`, `quran_surahs=0`, `quran_ayahs=0`, `hadith_books=0`, `hadith_chapters=0`, `hadith_records=0`, `hadith_translations=0`, `hadith_grade_assessments=0`, and `hadith_record_reviews=0`.
- The additive `problem_reports` and `quran_ayah_reviews` tables do not exist in Neon yet. PR #93 is merged in GitHub, but its migration has not been applied; PR #43 (which proposes per-Ayah review storage) remains open and is not merge-ready. No production SQL or data was changed in this run.
- The one source row is `tanzil-uthmani-v1`, inactive, with stored metadata `license_id=CC-BY-3.0`, `redistribution_allowed=true`, reviewer `project-owner-chat-authorization`, and checksum `ac0724796cbbda0f4801470fbbd11d0f3c5802067bae0493466d0128b0c667af`. Its one approval row has the same owner-chat reviewer identity and the same stored artifact checksum. These are database metadata only: the immutable official artifact is absent from the repository, the digest was not independently recomputed from acquired bytes, and the approval is not independent human review.
- No Quran or Hadith content was imported, activated, or modified.

### Render and runtime access

- Render was not rechecked in this run. `list_workspaces` returned only “My Workspace”, but no workspace is selected; the Render connector requires the user-confirmed workspace ID before service reads. No Render service, environment variable, deployment, event, log, or setting was accessed or changed.
- The last recorded Render audit in this file (2026-11-11 09:36 UTC) found auto-deploy disabled for both services; API live on `f15e82748f1724d5995fe863e54d178a8a22b2b7`, web live on `f098d650a9cbc5aaaaadee6a925e68dfa9dbdb9a`; the public web bundle still exposed the legacy Quran/audio UI. The API health/readiness probes returned 200 at 09:35 UTC, but those checks do not establish that current main is deployed. Treat these as the last recorded evidence, not a fresh check.
- Backend source code enforces explicit CORS origin allowlisting, but deployed `CORS_ALLOWED_ORIGINS`/`CORS_ORIGIN` and browser CORS behavior remain unverified because Render environment configuration was not accessible in this run.
- No auth/session route or module was found in the current backend source tree. Authentication and server-side authorization remain release blockers.

### Remaining release gates

- Keep Quran Arabic, Bengali translation, Hadith, tafsir, dua, and audio unavailable until exact immutable publisher artifacts, independently recomputed SHA-256 digests, source-specific redistribution/attribution evidence, and qualified independent human approval are documented.
- Do not treat the stored Tanzil checksum or owner-chat approval row as independent verification.
- Do not deploy the current mainline or apply the additive problem-report migration without a separately authorized, reversible production rollout plan. GitHub merge does not update Render while auto-deploy is disabled.
- Complete authentication/authorization, backup/restore and rollback drills, Neon network restrictions after verified Render egress, live CORS checks, RTL/screen-reader/keyboard/contrast/zoom QA, offline recovery, and physical Android/iOS device QA.
- No production data, network permissions, Render environment variables, or deployment was changed by this verification.


## Tanzil user-library copy audit — 2026-11-11

- A Library file named `quran-uthmani.txt` was located (Library-created 2026-11-05 01:00:59 UTC; 1,396,087 bytes). That timestamp is not evidence of the upstream retrieval time.
- Independently computed SHA-256 of the complete Library file bytes: `6933e133dd56db778c801bf738848454e43648105a151e8d84d86a7cae39ec5f`.
- The Library file's Git blob SHA `9813920ae5afce9e50d2ac44562457e29bb4bfca` matches the historical GitHub blob at commit `abb4dd06531d7585b13b8f29af45e7d05a995574`; this establishes byte identity with the previously committed copy, not its upstream source authenticity.
- Structural validation: 6,236 Ayah rows, 114 Surahs, 6,236 unique ordered coordinates (1:1 through 114:6), with each per-Surah count matching the repository's canonical array. Thirty copyright-footer lines follow the Ayah rows.
- The file's footer identifies Tanzil Uthmani v1.1 and CC BY 3.0, but its copyright year is 2007-2026 while the historical notice quoted in the dossier is 2007-2021. Confirm the current official notice and exact download options before treating the file as the publisher artifact.
- The production source and approval rows both store `ac0724796cbbda0f4801470fbbd11d0f3c5802067bae0493466d0128b0c667af`, which does not match the Library copy hash. The approval notes' metadata hash `8867c1d88191472adec9db694b3cd9f135b1a2ef580574d32cf888dcb22c5c7a` cannot be independently recomputed without the corresponding metadata XML bytes.
- The production source remains inactive; both stored reviewer identities are `project-owner-chat-authorization`. No independent human approval is evidenced. Do not import the Library copy, edit production metadata, or activate the source. The current main tree still does not contain the Quran text file.
- This is a structural/integrity comparison only, not proof of source authenticity, scholarly correctness, or redistribution approval for any other asset.
