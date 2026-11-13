# DEENVERSE Verified Content Source Register

**Snapshot:** 2026-11-13 10:30 UTC — current main `c93db8cc13a6016a3f67eccdcfc952a81824ba20`  
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


## Historical verification after PR #96 — 2026-11-11

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


## Current mainline verification after PR #100 — 2026-11-11 10:08 UTC

This section supersedes the older main-SHA and open-PR snapshots above. The detailed Tanzil Library-copy byte/hash comparison is recorded in `docs/TANZIL-SOURCE-DOSSIER.md`.

### Mainline and CI

- Current `main`: `73d2208b067fe2d11bf2a24c0741aa661e67c48f`; GitHub reports `protected=false`.
- PR #97 merged as `bd63da7785b33e74157a5dc1319350ea6ec970a9` (current production/source evidence documentation).
- PR #98 merged as `27733a4a5fbc7d116c9224a1667de49f1163757c` (CORS regression tests for the problem-report POST route: trusted origin succeeds; unlisted origin gets 403 and creates no row).
- PR #99 merged as `0e67288e12dd5f22a67c3626511234efdb379752` (Tanzil Library-copy structural/hash audit and mismatch with production metadata).
- PR #100 merged as `73d2208b067fe2d11bf2a24c0741aa661e67c48f` (rate-limit regression test for problem-report POST: first request stores one row; next request receives structured 429).
- Exact-head checks passed for PR #97 (run #42999684114), PR #98 (runs #42999898419 and #42999898316), PR #99 (run #43000533548), and PR #100 (runs #43000714320 and #43000714321). Post-merge main CI run #43000942774 passed backend and web jobs.
- The only open PRs are #79, #43, and #11. PR #79 targets an old `integration/platform-foundation` base (`a7ad2eb4dae5d2fdcfb682e1747d4b17d56dab29`), is dirty/non-mergeable, and requires rebase/review. PR #43 targets old main `ef559abe96417acd376df60b0f6ef7973bfd28c6`; its backend check was cancelled and it is not merge-ready. PR #11 targets the old integration base, is dirty/non-mergeable, and has no exact-head CI. Do not merge these without current-main reconciliation and fresh checks.
- PR #47 (older problem-report implementation) and PR #69 (public Quran beta) are closed unmerged. The merged report implementation is PR #93; the public Quran reader remains fail-closed.

### Neon production state

- Project `deenverse-db` and default branch `main` remain Ready. The Neon branch is unprotected; the IP allowlist is empty; `protected_branches_only=false`; `block_public_connections=false`.
- Read-only counts remain: `content_sources=1`, `content_source_approvals=1`, all Quran Surah/Ayah tables zero, and all Hadith book/chapter/record/translation/grade/review tables zero.
- Both `problem_reports` and `quran_ayah_reviews` are absent from Neon. The backend's `hasRequiredSchema` includes `problem_reports`, so the current API build must report readiness 503 until the additive PR #93 migration is applied. No production migration was run.
- The single Tanzil source row remains inactive. The stored source and approval digests are both `ac0724796cbbda0f4801470fbbd11d0f3c5802067bae0493466d0128b0c667af`; the user-Library copy hash is `6933e133dd56db778c801bf738848454e43648105a151e8d84d86a7cae39ec5f`. The Library copy matches the historical Git blob from commit `abb4dd06531d7585b13b8f29af45e7d05a995574`, but that proves only byte identity with the previously committed copy, not official upstream acquisition. Source and approval reviewers remain the same owner-chat identity; no independent human approval exists.
- No Quran or Hadith content was imported, activated, or modified.

### API, auth, and support-report operations

- Backend CORS is an explicit origin allowlist. PR #98 now tests the problem-report POST boundary for trusted/untrusted origins. The deployed `CORS_ALLOWED_ORIGINS`/`CORS_ORIGIN` values and browser CORS path remain unverified because Render is not accessible in this run.
- PR #100 proves the public report endpoint remains under the global rate limit. PR #93 provides public report submission only; there is no authenticated staff inbox, report-list API, assignment, or notification delivery. Do not expose report retrieval without authentication/authorization.
- No auth/session route or middleware was found in the backend tree. `backend/.env.example` contains only a blank `JWT_SECRET` placeholder; no working login/session implementation is evidenced.

### Render, manual QA, and release gates

- Render service configuration/deploys/events/logs were not rechecked: the connector lists “My Workspace” but reports no selected workspace, and the user-confirmed workspace ID is not available. No Render environment variable, service setting, deployment, or log was accessed or changed.
- The last recorded Render audit remains the 2026-11-11 09:36 UTC snapshot above: auto-deploy disabled; API/web deployed commits predate current main; API health/readiness returned 200 then, but that does not prove current main is deployed. Do not treat it as fresh evidence.
- Browser automation was unavailable because the TinyFish wallet balance was $0.00. RTL, keyboard, screen-reader, contrast/zoom, offline recovery, and physical Android/iOS QA remain unverified.
- Do not deploy current main or apply the production migration without a separately authorized, reversible rollout plan, verified backup/rollback, and exact deployed CORS/API-base configuration.
- No production data, network permissions, Render configuration, or deployment was changed in this run.


## Production runtime and release-gate recheck — 2026-11-11 10:30 UTC

This section supersedes the 10:08 UTC runtime-access and deployment statements above. It records read-only evidence gathered from GitHub, Neon, and the connected Render workspace. No production configuration, database rows, permissions, or deployments were changed.

### GitHub mainline and pull requests

- Current `main`: `65029fd41ab9da204ccefb8df014dd4bee0ac1a5`. It differs from the last passing application-code main commit `73d2208b067fe2d11bf2a24c0741aa661e67c48f` by one documentation-only change to this file.
- Main application-code CI at `73d2208b067fe2d11bf2a24c0741aa661e67c48f` passed backend and web jobs in run #43000942774. PR #101's exact-head documentation verification passed in run #43001201070. No application code changed in the subsequent main commit.
- Main reports `protected=false`; the repository rulesets endpoint returned an empty list. The branch-protection detail endpoint itself returned 403 to this integration, so no stronger protection claim is made.
- PR #91 and PR #92 are merged. PR #93–#101 are also merged, including problem reporting, report-form accessibility, fail-closed Quran-reader regression coverage, CORS/rate-limit tests, and the latest evidence refresh.
- PRs #85–#87 and #89 are closed unmerged; their old branch heads must not be treated as current open work. The only open PRs are #43, #79, and #11. PR #43 is 7 commits ahead / 56 behind current main and its backend check was cancelled; PR #79 and #11 target the old `integration/platform-foundation` base and are dirty/non-mergeable. None is merge-ready.

### User-library Quran candidate and source terms

- The Library file `quran-uthmani.txt` was independently re-hashed from its raw bytes: 1,396,087 bytes; SHA-256 `6933e133dd56db778c801bf738848454e43648105a151e8d84d86a7cae39ec5f`.
- Structural checks found 6,236 Ayah records across all 114 Surahs; every per-Surah count matched the repository's canonical count array; coordinates were unique and sequential from 1:1 through 114:6; the Tanzil copyright/footer block was present. These checks establish structure and byte identity only, not official acquisition provenance or scholarly approval.
- The candidate hash does not match the production source/approval digest `ac0724796cbbda0f4801470fbbd11d0f3c5802067bae0493466d0128b0c667af`. The Library upload timestamp is not an upstream retrieval timestamp. No official Tanzil artifact, exact download-option record, or independently qualified reviewer evidence was acquired in this run.
- Tanzil's official pages state that Version 1.1 is the latest text release and permit verbatim copying/distribution for websites and applications with clear Tanzil attribution, a link to `tanzil.net`, and preservation of the copyright notice; changing the text is prohibited. These published terms do not authenticate this candidate file.
- QuranEnc's published terms allow downloaded translations to be republished only without modification/addition/deletion, with publisher/source attribution, version number, transcript information retained, source notification for translation notes, updates to the latest version, and no inappropriate advertisements. The exact Abu Bakr Muhammad Zakaria V1.1.1 artifact and its transcript metadata are not retained and hashed here; caching/offline/export use remains unverified.
- Hadith editions, translations, grading data, and audio still lack source-specific artifact, reuse-rights, attribution, and independent review dossiers. Do not import or publish any religious corpus on this evidence.

### Neon production database and network posture

- Project `deenverse-db` and default branch `main` are Ready, but the branch is unprotected. The IP allowlist is empty, `protected_branches_only=false`, and `block_public_connections=false`.
- Exact table inventory contains only: `content_sources`, `content_source_approvals`, `quran_surahs`, `quran_ayahs`, `hadith_books`, `hadith_chapters`, `hadith_records`, `hadith_translations`, `hadith_grade_assessments`, and `hadith_record_reviews`. `problem_reports` and `quran_ayah_reviews` are absent.
- Counts: one content source and one source approval; zero Quran Surahs/Ayahs; zero Hadith books, chapters, records, translations, grade assessments, and record reviews. The source is inactive. The stored approval decision says approved, but source reviewer and approval reviewer are both `project-owner-chat-authorization`; this is not independent human approval. The stored digest mismatch above remains unresolved.
- Main contains the additive `problem_reports` migration and `hasRequiredSchema` requires that table. Production has not applied it. The per-Ayah review table is not part of current main; open PR #43 is stale and unmerged. No production SQL writes were run.

### Render production runtime

- The connected Render workspace is accessible. The API service `deenverse-api` is configured on branch `main` with auto-deploy disabled; its latest live deployment is commit `f15e82748f1724d5995fe863e54d178a8a22b2b7` from 2026-11-08 22:54 UTC. The web service `deenverse-web` also has auto-deploy disabled; its latest live deployment is commit `f098d650a9cbc5aaaaadee6a925e68dfa9dbdb9a` from 2026-11-05 02:50 UTC. Both are behind current main.
- At 2026-11-11 10:30 UTC, external requests to API `/api/v1/health`, API `/api/v1/ready`, and the public web root each returned HTTP 503. Render reports both services as not suspended, but public availability is not healthy.
- The latest API application logs show the database migration command completing with “DEENVERSE database schema is ready” and the process listening at `127.0.0.1:10000` on 2026-11-11 09:29 UTC. This loopback bind is inconsistent with Render's externally reachable web-service port requirement and is a strong runtime lead; the effective `HOST` environment value is not exposed by the connected read tools, so its source is not independently confirmed.
- The deployed API commit predates PR #93 and the `problem_reports` migration; the deployed web commit predates the current fail-closed reader. The live site must not be treated as the safe current-main experience.
- The current code uses an explicit CORS origin allowlist and merged PR #98 tests trusted/untrusted origins. Live CORS behavior and deployed `CORS_ALLOWED_ORIGINS`/`CORS_ORIGIN` values could not be verified while the API returns 503. No environment variables, service settings, deploys, or logs were modified.

### Authentication, PWA, accessibility, and release state

- No authentication, login, OTP, session, or user-identity routes/middleware were found in the current backend tree. `backend/.env.example` contains a blank `JWT_SECRET` placeholder, not a working authentication implementation. Staff access to problem-report triage is not implemented.
- The current main branch contains a standalone manifest and production-only service-worker registration. Automated tests verify that the app shell and immutable assets wait for cache persistence and that API responses are never cached. Offline support is limited to the app shell; religious and user data are intentionally excluded.
- The app shell includes a skip link, labelled navigation, and explicit Bengali language attributes for Bengali notices. The Quran reader remains an approval-pending placeholder and renders no Arabic text, Bengali translation, or audio. Manual RTL, keyboard, screen-reader, contrast/zoom, install, offline-recovery, and physical Android/iOS QA remain unverified.
- Highest-priority release work is to restore Render API/web availability with a reversible, reviewed rollout; apply the additive report migration only after backup/rollback checks; secure Neon branch/network controls; implement authenticated staff/report access; and complete source acquisition, independent digest verification, rights review, and qualified independent content approval. No content publication, production migration, permission change, or deployment is authorized by this evidence snapshot.


## Verified release-gate recheck — 2026-11-12

This snapshot records evidence gathered directly from GitHub, Neon, and the user's Library on 2026-11-12. Render service reads were not performed because the available workspace was not confirmed for service access. No production rows, credentials, infrastructure settings, network permissions, or deployments were changed.

### GitHub mainline and pull requests

- Current `main`: `1ac3acc42e6c084a394748a8ade90d5a4de34a3d` — [commit](https://github.com/mohammedpalash1990-a11y/Deenverse/commit/1ac3acc42e6c084a394748a8ade90d5a4de34a3d).
- Exact-head main CI run #43007513683 passed both backend and web jobs: [run](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/43007513683).
- PR #91 and PR #92 are merged; PR #92 merge commit is [`5613041b5df7919c84267976595b1aaf4c0efd9b`](https://github.com/mohammedpalash1990-a11y/Deenverse/commit/5613041b5df7919c84267976595b1aaf4c0efd9b). PRs #103 and #104 are also merged; #104 corrects Hadith provenance so source-review identity/date are distinct from source-approval authority/date.
- The current open PRs are #105, #43, #79, and #11. PR #105 is a new fail-closed per-Ayah review-gate change based on the current main SHA; its web and verification jobs passed, while its backend test job was still in progress at this snapshot. Do not merge until the exact-head backend job and all checks complete successfully.
- PR #43 is stale (7 commits ahead / 59 behind current main); its earlier backend check was cancelled. PR #79 and #11 target the old `integration/platform-foundation` branch and are dirty/non-mergeable against that base. PRs #85–#87 and #89 are closed unmerged; PR #88 is merged. PR #47 is closed unmerged; the later report implementation is PR #93.
- GitHub reports `main` as unprotected and the repository rulesets list is empty. Required-check enforcement is therefore not established.
- No new release/deployment commit was found in the recent main commit history. GitHub deployment/release inventory could not be independently retrieved through the available GitHub endpoint wrapper in this run.

### Neon production database and access controls

- Project `deenverse-db`, default branch `main`, is Ready. The branch is unprotected. The project IP allowlist is empty, `protected_branches_only=false`, and `block_public_connections=false`.
- The public table inventory contains `content_sources`, `content_source_approvals`, the Quran tables, and the Hadith tables. Both `problem_reports` and `quran_ayah_reviews` are absent from production.
- Read-only row counts: `content_sources=1`, `content_source_approvals=1`; `quran_surahs=0`, `quran_ayahs=0`; all Hadith book/chapter/record/translation/grade/review tables are zero. No Quran or Hadith corpus is present in production.
- The sole Tanzil source row is inactive. Its metadata says `CC-BY-3.0` and redistribution allowed, but source reviewer and approval reviewer are both `project-owner-chat-authorization`; the approval is not independent. The stored source/approval checksum is `ac0724796cbbda0f4801470fbbd11d0f3c5802067bae0493466d0128b0c667af`.
- The production role check confirms `deenverse_runtime_ro` can SELECT but cannot INSERT or UPDATE; `deenverse_api` cannot INSERT or UPDATE Quran rows. The separate `deenverse_migrator` role has write capability. Role metadata itself is not a proof of application runtime configuration.

### Immutable source artifact and rights evidence

- The Library file `quran-uthmani.txt` was re-read as raw bytes: 1,396,087 bytes; SHA-256 `6933e133dd56db778c801bf738848454e43648105a151e8d84d86a7cae39ec5f`. Structural inspection found 6,236 records across Surahs 1–114, sequential Ayah numbering per Surah, and no duplicate coordinates. Its footer identifies Tanzil Uthmani Version 1.1 / CC BY 3.0. These checks prove the bytes and structure of this Library copy only; they do not prove official acquisition provenance.
- The Library-copy digest does not match the production source/approval digest above. The official [Tanzil terms](https://tanzil.net/docs/Text_License) permit verbatim copying/distribution, prohibit changing the text, and require clear Tanzil attribution, a link to tanzil.net, and preservation of the copyright notice. The exact official download artifact/options and acquisition record are still not evidenced for this copy.
- The [QuranEnc republication terms](https://quranenc.com/bn/home/api) require no modification/addition/deletion, publisher and source attribution, version number, transcript information, source notification for translation notes, updates to the latest version, and no inappropriate advertising. No exact Abu Bakr Muhammad Zakaria translation artifact/version/transcript file was found in the Library search for this recheck.
- No Hadith corpus artifact or source-specific redistribution dossier was found in the Library search. Hadith edition, translator, grading, audio, attribution, and reuse rights remain unverified. No religious content was imported or activated.

### Render, API, authentication, and client QA

- Render's workspace listing returned `My Workspace`, but no workspace was confirmed for service reads in this run. Service configuration, environment values, deployments, events, logs, health/readiness, live CORS, and database connectivity were not rechecked.
- The latest recorded Render snapshot elsewhere in this register is 2026-11-11 10:30 UTC: API health, API readiness, and public web root returned HTTP 503; auto-deploy was disabled; API and web deployments were behind current main. Treat that as historical evidence, not a current health check.
- Backend code uses an explicit CORS origin allowlist. The deployed `CORS_ALLOWED_ORIGINS`/`CORS_ORIGIN` values and browser CORS behavior remain unverified.
- No authentication/session/login/OTP route or middleware was found in the current backend tree. `backend/.env.example` contains an empty `JWT_SECRET` placeholder, not a working authentication implementation. Staff report triage remains unauthenticated/unimplemented.
- The service worker caches the app shell and immutable application assets only; API and religious content are not cached offline. Manual RTL, keyboard, screen-reader, contrast/zoom, install/offline recovery, and physical Android/iOS QA remain unverified.

### Release decision

Keep public Quran/Hadith content fail-closed. Do not activate the Library Quran copy, translations, Hadith, tafsir, dua, or audio until immutable source acquisition, independent SHA-256 recomputation, source-specific lawful redistribution evidence, required attribution, and qualified independent human approval are documented. The new per-Ayah code gate in PR #105 checks distinct reviewer identities and review metadata, but it does not establish scholarly qualifications or authenticate reviewer identity.

Highest-priority next work: finish exact-head CI and safely merge PR #105 if all checks pass; then plan a separately reviewed, backed-up production migration and deployment only after Render access, rollback, CORS, and runtime configuration are confirmed. Secure GitHub/Neon branch and network controls after verified Render egress; implement authenticated staff/report access; then complete manual client QA. No production migration, permission change, Render configuration change, or deployment was performed in this recheck.


## Verified release-gate recheck — 2026-11-13

This snapshot supersedes the 2026-11-12 release-gate snapshot for the current mainline, Neon schema, source-artifact recheck, and PR reconciliation. It records read-only checks only; no production rows, migrations, credentials, permissions, infrastructure settings, or deployments were changed.

### GitHub mainline and CI

- Current `main`: `89b0d7880e1544f16e162f57bbd286a514cd78f7` — [commit](https://github.com/mohammedpalash1990-a11y/Deenverse/commit/89b0d7880e1544f16e162f57bbd286a514cd78f7). This is PR #105, which adds the source-bound per-Ayah review table, independent reviewer-identity checks, and migration/readiness regression coverage.
- Exact-head main push CI run #43202041023 passed both backend typecheck/tests/build and web typecheck/tests/production build: [run](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/43202041023). PR #105 exact-head checks also passed: [backend/combined CI #43196524459](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/43196524459) and [web checks #43196524417](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/43196524417).
- PR #91 remains merged at `888157747892681ed50360c1140d482967354ceb`; its exact head `874a53406fff0c2e580643e11f34e0aadb5f575d` passed DEENVERSE CI, Web foundation, and OpenAPI validation (runs #42790399241, #42790399235, #42790399346). The reviewer-normalization, Hadith cursor-scope, and PWA cache-persistence changes from PRs #85–#87 are present through #91; those old PRs and integration PR #89 are closed unmerged.
- PR #105 is merged at the current main SHA. PR #106 is merged at `e55c310aaf2443d5cb54a213cc948f8c813a58f9` and records the 2026-11-12 audit.
- PR #43 was closed unmerged on 2026-11-13 as superseded by PR #105. Its old branch was based on `ef559abe96417acd376df60b0f6ef7973bfd28c6`, was non-mergeable, and its backend CI was cancelled; no code from that stale branch was merged separately. [PR #43](https://github.com/mohammedpalash1990-a11y/Deenverse/pull/43).
- Remaining open PRs: [#79](https://github.com/mohammedpalash1990-a11y/Deenverse/pull/79) targets the old `integration/platform-foundation` base `a7ad2eb4dae5d2fdcfb682e1747d4b17d56dab29`; its exact head has passing historical runs #42368981912 and #42368981954, but the PR is a 48-file/136-commit divergent branch and is not safe to merge as-is. [#11](https://github.com/mohammedpalash1990-a11y/Deenverse/pull/11) targets the same old integration base and has no exact-head CI. Neither is merge-ready.
- GitHub branch metadata reports `main` as `protected=false`; the branch-protection detail endpoint returned 403 to this integration. No required-check enforcement is evidenced. The GitHub releases list is empty; the deployment inventory endpoint is not supported by the available GitHub fetch wrapper.

### Neon production schema and network posture

- Project `deenverse-db` (`cool-mud-31679014`) and default branch `main` (`br-spring-night-a14ey96s`) are Ready. The branch is unprotected; project IP allowlist is empty; `protected_branches_only=false`; `block_public_connections=false`.
- The public schema currently contains ten tables: `content_sources`, `content_source_approvals`, four Quran/Hadith catalogue tables plus review/translation/grade tables. `quran_ayah_reviews` and `problem_reports` are absent from the production table inventory, although current main's `hasRequiredSchema` requires both.
- Read-only counts: `content_sources=1`, `content_source_approvals=1`; `quran_surahs=0`, `quran_ayahs=0`; `hadith_books=0`, `hadith_chapters=0`, `hadith_records=0`, `hadith_translations=0`, `hadith_grade_assessments=0`, and `hadith_record_reviews=0`. No Quran or Hadith corpus is present in production.
- The only source row is `tanzil-uthmani-v1`, inactive, with metadata `CC-BY-3.0` and `redistribution_allowed=true`. Its approval row says `approved`, but source and approval reviewer IDs are the same reserved project-owner chat identity. The stored source/approval checksum strings match each other (`ac0724796cbbda0f4801470fbbd11d0f3c5802067bae0493466d0128b0c667af`) but do not match the independently re-hashed Library candidate below. This is not independent human approval or verified upstream provenance.
- Because both additive tables are absent, the current main readiness schema check would return unavailable until the `problem_reports` and `quran_ayah_reviews` migrations are applied. This is a schema inference from current code plus read-only table inventory, not a live Render readiness response. No production migration was run.

### Quran/Hadith artifacts, licensing, and human approval

- The Library `quran-uthmani.txt` was independently re-materialized and re-hashed in this run: 1,396,087 bytes; SHA-256 `6933e133dd56db778c801bf738848454e43648105a151e8d84d86a7cae39ec5f`. Structural checks found 6,236 numbered Ayahs, all 114 Surahs, no duplicate coordinates, sequential Ayah numbering, per-Surah counts matching the repository's `EXPECTED_AYAH_COUNTS`, and the Tanzil copyright/license block. This verifies only the Library copy's bytes and structure, not official Tanzil acquisition or scholarly correctness.
- `data/quran/tanzil/quran-uthmani.txt` remains absent from current main; only `SOURCE_INFO.md` is present, and it explicitly labels the source candidate/not approved. The Library hash differs from the production source/approval checksum. No official download receipt/options, retrieval timestamp, preserved official metadata artifact, or qualified independent source approval was found. Do not restore/import/activate this copy on the current evidence.
- Tanzil's dossier records published CC BY 3.0 terms for verbatim distribution with attribution, source link, and preserved copyright notice; changing the text is prohibited. The published terms do not authenticate the Library copy. QuranEnc Bengali Zakaria V1.1.1 remains a candidate; the exact translation/transcript artifact is not retained and web/mobile hosting, caching, offline, and export rights are not established.
- Hadith source evaluation remains research-only (HadeethEnc, Sunnah.com API, and Dorar candidates). No approved Hadith collection, translation, grading artifact, or production corpus is recorded; no matching Hadith dataset was returned by the Library search used for this recheck. No tafsir, dua, or audio source dossier is approved.
- PR #105 enforces source-bound per-Ayah review rows and distinct reviewer identities before the Ayah service can return text. It does not authenticate reviewer identity or establish scholarly qualifications. The review protocol still states no Ayah has been human-approved; qualified independent human sign-off remains outstanding.

### Render, authentication, CORS, PWA, and manual QA

- Render workspace listing returned `My Workspace`, but no workspace is selected. The connector requires a user-confirmed workspace ID before service access; therefore no Render service, deployment, event, log, environment value, API health/readiness, live CORS, or Render-to-Neon connectivity was accessed in this run.
- Backend code has an explicit CORS origin allowlist, but deployed `CORS_ALLOWED_ORIGINS`/`CORS_ORIGIN` values and live browser behavior remain unverified. Current production API/web deploy SHAs and availability are unavailable in this run.
- No authentication/session/login/OTP route or middleware is evidenced in the current backend tree. `backend/.env.example` has only a blank JWT placeholder. The public problem-report POST stores reports, but there is no authenticated staff inbox/list/assignment/notification workflow.
- PWA code caches the root app shell and same-origin immutable build assets plus manifest/icon; `/api/` responses, religious content, and user data are excluded. Automated service-worker tests are included in CI. Manual installation/offline-recovery, Arabic RTL, keyboard, screen-reader, contrast/zoom, responsive, and physical Android/iOS QA remain unverified.

### Release decision and next priority

- Keep Quran, translation, Hadith, tafsir, dua, and audio publication fail-closed. No corpus was imported or activated.
- Highest-priority operational work is to obtain the correct Render workspace selection, inspect the deployed commits and service health, then prepare a separately reviewed/backup-backed migration and deployment plan for the two missing additive tables. Do not apply migrations or deploy until the exact service configuration, backup/rollback, CORS, and runtime credentials are verified.
- Secure GitHub/Neon branch and network controls only after the deployed Render egress path is known. Authentication/authorization and manual RTL/accessibility/device QA remain release blockers.
- No production data, schema, network permissions, environment variables, Render configuration, or deployment was changed in this recheck.

## Verified release-gate recheck — 2026-11-13 13:08 UTC

This snapshot supersedes the 09:46 UTC snapshot above for current GitHub mainline and the read-only Neon checks performed at 13:08 UTC. No production rows, schema, permissions, environment variables, Render settings, or deployments were changed.

### GitHub mainline, PRs, and CI

- Current `main` is `69c497435c1bfe773e8ccaa2273507833fd1b605`, merge commit for PR #107: [commit](https://github.com/mohammedpalash1990-a11y/Deenverse/commit/69c497435c1bfe773e8ccaa2273507833fd1b605) · [PR #107](https://github.com/mohammedpalash1990-a11y/Deenverse/pull/107).
- PR #107's exact head `59ca4617e06290827bb8da41056c02ed4f2eb415` passed its `verify` check in [run #43404862487](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/43404862487). The PR has no submitted reviews or issue comments. The merge commit is documentation-only; it has no check-runs because the main CI workflow's push path filter excludes `docs/**`. Its commit status endpoint currently reports pending with zero status contexts, so do not describe the merge SHA itself as having a fresh CI run.
- The immediately preceding code mainline `89b0d7880e1544f16e162f57bbd286a514cd78f7` (PR #105) has successful backend and web checks in [run #43202041023](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/43202041023). PR #105's exact head also passed [backend/combined run #43196524459](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/43196524459) and [web run #43196524417](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/43196524417).
- PR #91 remains merged at `888157747892681ed50360c1140d482967354ceb`; its reviewer-identity normalization, Hadith cursor scoping, and PWA cache-persistence work is already in main. PR #92 and PR #107 are merged documentation reconciliations. PR #105 is merged and adds the source-bound per-Ayah review gate.
- The only open PRs returned by the current repository query are #79 and #11. Both target the old `integration/platform-foundation` base `a7ad2eb4dae5d2fdcfb682e1747d4b17d56dab29` and GitHub reports them `dirty` / non-mergeable. PR #79 carries a 48-file mixed change set; PR #11 is an older nine-file API/integration documentation set. Neither is safe to merge as-is.
- GitHub branch metadata reports `main` as `protected=false`; the repository rulesets endpoint returns an empty list. The branch-protection detail endpoint returns 403 to the current integration, so required-check enforcement cannot be independently inspected. The releases endpoint returns an empty list. The deployment inventory endpoint is rejected by the available GitHub fetch wrapper; no release/deployment commit is claimed from that endpoint.

### Neon production schema, content, and access posture

- Neon project `deenverse-db` (`cool-mud-31679014`) and default branch `main` (`br-spring-night-a14ey96s`) are Ready. The default branch is unprotected. The project IP allowlist is empty, `protected_branches_only=false`, and `block_public_connections=false`.
- The current public schema has ten base tables. It does not contain `quran_ayah_reviews` or `problem_reports`, both of which are required by current main's schema-readiness definition.
- Read-only role inspection found `deenverse_api` and `deenverse_runtime_ro` can SELECT Quran/source rows but cannot INSERT, UPDATE, or DELETE them; `deenverse_migrator` has the expected migration write privileges. The listed Deenverse roles are not superusers. The owner role can create roles/databases; no role or grant was changed. If the deployed API is updated to this mainline while still using this database before those additive migrations are applied, readiness is expected to fail; no live Render readiness request was possible in this run.
- Fresh read-only exact row counts: `content_sources=1`, `content_source_approvals=1`; `quran_surahs=0`, `quran_ayahs=0`; `hadith_books=0`, `hadith_chapters=0`, `hadith_records=0`, `hadith_translations=0`, `hadith_grade_assessments=0`, and `hadith_record_reviews=0`. No Quran or Hadith corpus is present in this production branch.
- The sole source row is `tanzil-uthmani-v1`, inactive. Its metadata lists `CC-BY-3.0`, attribution, and `redistribution_allowed=true`; the associated approval row says `approved`. However, the source reviewer and approval reviewer are both `project-owner-chat-authorization`, so this is not independent human approval. The stored source and approval digest is `ac0724796cbbda0f4801470fbbd11d0f3c5802067bae0493466d0128b0c667af`.
- The Library candidate `quran-uthmani.txt` was re-materialized and SHA-256 recomputed in this run: 1,396,087 bytes; digest `6933e133dd56db778c801bf738848454e43648105a151e8d84d86a7cae39ec5f`. Parsing found 6,236 numbered records across all 114 Surahs, sequential Ayah numbering within every Surah, and no duplicate Surah/Ayah coordinates. This is evidence about the Library copy only. Its digest does not match the production source/approval digest, and no official Tanzil acquisition receipt, selected download options, or retrieval timestamp establishes that these bytes are the exact official artifact. Do not import or activate it.
- Tanzil's published CC BY 3.0 terms allow verbatim copying/distribution with clear Tanzil attribution, a link to `tanzil.net`, and preservation of the copyright/license notice; changing the text is prohibited. These terms do not establish the provenance of the Library copy. See the [official Tanzil download terms](https://tanzil.net/pub/download/).
- QuranEnc's published republishing conditions require unchanged content, publisher/source attribution, version number, retained transcript information, notifying QuranEnc about translation notes, updates to the latest source version, and no inappropriate advertisements. No exact QuranEnc Bengali Zakaria V1.1.1 artifact or transcript metadata was found in the current Library search; separate caching/offline/export rights remain unverified. See [QuranEnc API and republishing terms](https://quranenc.com/en/home/api).
- No Hadith corpus artifact or source-specific redistribution dossier was found in the Library search. Hadith edition, translation, grading, attribution, and caching/offline rights remain unverified.
- PR #105's code now requires source-bound per-Ayah review rows with distinct reviewer identities before serving Ayah text. The production `quran_ayah_reviews` table is absent and no qualified independent human review has been evidenced. Code-level identity separation does not authenticate a reviewer or establish scholarly qualifications.

### Render, authentication, CORS, PWA, and client QA

- Render workspace selection is still not confirmed. Therefore no Render service configuration, environment values, deploys, events, logs, API health/readiness, live CORS, or Render-to-Neon connectivity was accessed in this run. Current production deploy SHAs and availability remain unavailable.
- Backend CORS code uses `CORS_ALLOWED_ORIGINS` / `CORS_ORIGIN` as an explicit allowlist, but deployed values and live browser CORS behavior are not verified.
- The current backend tree has no auth/login/session/OTP route or auth middleware. `backend/.env.example` contains only a blank `JWT_SECRET` placeholder and says to reject missing/weak secrets when auth is enabled. Authentication and staff authorization remain release blockers.
- The service worker caches the app shell and immutable same-origin application assets; API responses and religious content are excluded. Automated tests are not a substitute for manual installation/offline recovery, Arabic RTL, keyboard, screen-reader, contrast/zoom, responsive, and physical Android/iOS QA. Those manual checks remain unverified.

### Release decision and next priority

Keep Quran Arabic, Bengali translation, Hadith, tafsir, dua, and audio unavailable. The exact official source artifacts, independently matching digests, source-specific rights dossier for the actual bytes/use cases, and qualified independent human approval are not established. Do not seed synthetic religious content or manufacture approval records.

The backend entry point does not run migrations during normal API startup. Production schema changes use the separate `npm run db:migrate` / `tsx src/db/migrate.ts` path, which requires a PostgreSQL `MIGRATION_DATABASE_URL`; the HTTP runtime uses `DATABASE_URL`. The current `backend/.env.example` documents the runtime URL but not the separate migration URL. Do not point the migration command at an unverified legacy or production database.

Next priority is to inspect the correct Render workspace and live API/web services, then prepare a backup-backed, reversible plan for the missing additive migrations and a controlled deployment. Do not migrate or deploy until the service configuration, CORS, runtime credentials, backup, and rollback path are verified. Branch/network hardening must wait until the deployed Render egress path is known. Authentication and manual client QA remain separate release blockers.


## Post-merge verification — 2026-11-13 10:30 UTC

This section supersedes earlier GitHub mainline/PR status in this register. The read-only Neon evidence was rechecked after the merges and remains unchanged. No production data, schema, credentials, permissions, Render settings, or deployments were changed.

### Merged repository work and exact verification

- Current `main`: `c93db8cc13a6016a3f67eccdcfc952a81824ba20` — [commit](https://github.com/mohammedpalash1990-a11y/Deenverse/commit/c93db8cc13a6016a3f67eccdcfc952a81824ba20).
- PR #108 refreshed the evidence register. Exact-head web verification passed: [run #43407805763](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/43407805763).
- PR #109 documented the separate write-capable `MIGRATION_DATABASE_URL` for the controlled `npm run db:migrate` step. Exact-head checks passed: [DEENVERSE CI #43407962280](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/43407962280) and [web foundation #43407962442](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/43407962442). Post-merge main push CI passed: [run #43408130136](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/43408130136).
- PR #111 added explicit `lang="bn"` to Bengali reader heading/status copy with regression tests. Exact-head checks passed: [DEENVERSE CI #43408192304](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/43408192304) and [web foundation #43408192412](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/43408192412). Post-merge main push CI passed: [run #43408331619](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/43408331619).
- PR #112 made the Quran Surah catalogue fail closed unless all 114 Surahs are present in order and each has the canonical Ayah count from the existing count registry. Both list and single-Surah reads use this gate. Tests use synthetic metadata only and add no Quran text. Exact-head checks passed: [DEENVERSE CI #43408864832](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/43408864832) and [web foundation #43408864845](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/43408864845). Post-merge main push CI passed: [run #43409005793](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/43409005793).
- PR #113 moved keyboard focus into the first mobile navigation item and made the closed off-canvas sidebar `visibility:hidden`, removing hidden controls from keyboard/assistive navigation while retaining the open/close transition. Exact-head checks passed: [DEENVERSE CI #43409371713](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/43409371713) and [web foundation #43409371752](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/43409371752). Post-merge main push CI passed on current main: [run #43409590711](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/43409590711).
- PR #110 was closed unmerged as a stale-base duplicate of PR #111. No changes from #110 were merged.
- The only open PRs remain #79 and #11. Both still target the old `integration/platform-foundation` base `a7ad2eb4dae5d2fdcfb682e1747d4b17d56dab29`; both remain dirty/non-mergeable and were not merged.
- The main branch remains unprotected and the repository rulesets list remains empty. Code changes now receive a post-merge main push CI run, but GitHub does not enforce required checks through branch protection. The releases list remains empty; deployment inventory is still unavailable through the current GitHub fetch integration.

### Reconfirmed production gates

- Neon `deenverse-db` (`cool-mud-31679014`) remains Ready in `aws-ap-southeast-1`; default branch `main` (`br-spring-night-a14ey96s`) remains unprotected. The IP allowlist remains empty, `protected_branches_only=false`, and `block_public_connections=false`.
- Fresh table inventory still contains only ten public base tables. `quran_ayah_reviews` and `problem_reports` are still absent. The content row counts remain: one source row and one approval row; zero Quran Surahs/Ayahs; zero Hadith books, chapters, records, translations, grade assessments, and record reviews.
- The only Quran source remains inactive. Source reviewer and approval reviewer remain the same reserved `project-owner-chat-authorization` identity; the stored digest still does not match the independently re-hashed Library candidate. No independent human approval or official artifact acquisition was established.
- A further Tanzil notice discrepancy remains: the official [Text License page](https://tanzil.net/docs/Text_License) displays `Copyright (C) 2007-2021 Tanzil Project` and says the notice must be included in verbatim copies and derivatives; the Library candidate's embedded footer says `Copyright (C) 2007-2026 Tanzil Project`. The production seed stores only a short attribution string, and the Quran Ayah reader displays edition, attribution, license ID, and source URL rather than the full copyright block. Do not guess which notice applies to the candidate; exact official bytes and their matching notice must be verified and surfaced before any publication.
- The merged 114-Surah API gate improves code safety but does not add production content or waive any source, digest, licensing, or reviewer gate.
- The backend still requires a separate controlled `npm run db:migrate` using `MIGRATION_DATABASE_URL`; API startup does not run migrations. Do not run it until the correct Render service, backup, migration target, and rollback plan are verified.
- Render workspace/service access remains unconfirmed, so current deploy SHAs, service environment, logs, health/readiness, live CORS, and Render-to-Neon connectivity remain unverified. The backend source tree still has no authentication/session/OTP middleware or login route. Manual RTL, screen-reader, keyboard, offline-install/recovery, and Android/iOS device QA remain outstanding.

### Release decision

Keep Quran Arabic, Bengali translation, Hadith, tafsir, dua, and audio unavailable. Production still has no corpus rows, the independent review and exact official artifact/provenance gates are unresolved, and the database schema is missing the two current-main readiness tables. Next priority remains Render runtime verification followed by a backup-backed additive migration plan; no production migration or deployment was performed.


## Verified mainline and release-gate recheck — 2026-11-13 10:58 UTC

This snapshot supersedes earlier mainline/PR and read-only Neon observations above. It records repository, database, and source evidence checked after PR #115 and PR #117 merged. No production data, schema, credentials, permissions, Render settings, or deployments were changed.

### GitHub mainline, PRs, and CI

- Current main is \`9042d546d82a6a175f4d07235b780af50e19e5cf\`: [commit](https://github.com/mohammedpalash1990-a11y/Deenverse/commit/9042d546d82a6a175f4d07235b780af50e19e5cf).
- PR #114 reconciled the source register with the 2026-11-13 production evidence. PR #115 added a modal mobile navigation drawer with Tab/Shift+Tab focus containment, an inert/aria-hidden main page while open, Escape/backdrop close, and focus restoration. Its exact-head checks passed: [backend/web run #43411917978](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/43411917978) and [verify run #43411918040](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/43411918040).
- PR #117 makes production startup fail if neither CORS_ALLOWED_ORIGINS nor CORS_ORIGIN contains an exact HTTP(S) origin. It rejects wildcard, credential, path, query, and fragment entries; non-production retains the localhost fallback. Exact-head backend/web checks passed in [run #43412555644](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/43412555644); OpenAPI/verify passed in [run #43412555498](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/43412555498). Post-merge main CI passed on the current main SHA: [run #43412747653](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/43412747653).
- PR #91 remains merged; its reviewer-identity normalization, Hadith cursor scoping, and awaited PWA cache writes are in main. PRs #85–#87 were overlapping inputs to that integration and are no longer active. PR #93 added the in-app problem-report endpoint/form; PR #95 improved error announcements; PR #105 added the per-Ayah review gate; PR #112 added complete-Surah-catalogue fail-closed checks; PR #113/#115 improved mobile navigation accessibility.
- PR #116 was closed after its backend startup-guard test failed because CORS validation ran before the existing production PostgreSQL guard. The corrected/rebased PR #117 passed all exact-head checks and was merged. No failed PR was merged.
- The only open PRs are #79 and #11. Both target the old integration/platform-foundation base and are non-mergeable. PR #79 contains a 48-file mixed change set including data/quran/tanzil/quran-uthmani.txt; do not merge it because it reintroduces an unverified religious artifact and unrelated code. PR #11 is an older documentation-only integration-gap set and is stale as-is.
- GitHub reports main as unprotected and the repository rulesets list is empty. The releases list is empty. The deployment inventory endpoint is unavailable through the current GitHub fetch integration; no deployment commit is claimed.

### Neon production schema, content, and network posture

- Neon project deenverse-db (cool-mud-31679014), region aws-ap-southeast-1, default branch main (br-spring-night-a14ey96s), is Ready. The default branch is unprotected. Project IP allowlist is empty, protected_branches_only=false, and block_public_connections=false.
- Current production table inventory has ten tables. quran_ayah_reviews and problem_reports are absent, although current main's schema-readiness check requires both. A current-main API deployment against this schema should report readiness unavailable until both additive migrations are applied; this is a code/schema inference, not a live Render readiness response.
- Read-only row counts: content_sources=1, content_source_approvals=1; quran_surahs=0, quran_ayahs=0; hadith_books=0, hadith_chapters=0, hadith_records=0, hadith_translations=0, hadith_grade_assessments=0, hadith_record_reviews=0. No Quran or Hadith corpus is present.
- The only source row is tanzil-uthmani-v1, inactive, with redistribution_allowed=true and metadata license CC-BY-3.0. Its approval row says approved, but the source reviewer and approval reviewer are both project-owner-chat-authorization. The stored source/approval digest is ac0724796cbbda0f4801470fbbd11d0f3c5802067bae0493466d0128b0c667af. This is not independent human approval.
- Existing Deenverse roles are not superusers. The read-only role query confirmed SELECT-only access to content_sources for deenverse_runtime_ro; no database grant, role, or permission was changed.

### Source artifact, digest, licensing, and review

- The Library candidate quran-uthmani.txt was independently re-materialized and SHA-256 recomputed: 1,396,087 bytes; digest 6933e133dd56db778c801bf738848454e43648105a151e8d84d86a7cae39ec5f. Structural parsing found 6,236 unique numbered Ayahs across 114 Surahs, with no duplicate coordinates and canonical per-Surah counts. This verifies only the Library copy's bytes and structure, not official Tanzil acquisition or scholarly correctness.
- The candidate digest does not match the production source/approval digest above. The artifact is absent from current main. No official download receipt, selected download options, retrieval timestamp, or independently approved acquisition record was found. Do not import or activate the Library copy.
- The Library file's copyright block says 2007–2026, while the official [Tanzil Text License page](https://tanzil.net/docs/Text_License) currently displays Copyright (C) 2007–2021. Tanzil permits verbatim copying/distribution with clear attribution, a tanzil.net link, and preservation of the copyright/license notice; changing the text is prohibited. The notice discrepancy and byte-provenance mismatch remain unresolved.
- The official QuranEnc listing still identifies Bengali Translation — Abu Bakr Zakaria as V1.1.1, dated 22 May 2021. Its [republishing terms](https://quranenc.com/en/home/api/) require unchanged content, publisher/source attribution, version number, retained transcript information, notification of translation notes, updating to the latest version, and no inappropriate advertising. No exact translation/transcript artifact is retained in the Library; caching/offline/export use still needs a documented use-specific review.
- No Hadith source artifact, approved collection, translation, grading dataset, or source-specific redistribution dossier is present. PR #105's per-Ayah gate is in main, but the required production review table is absent and no qualified independent human review is evidenced. Reviewer identity separation does not authenticate a reviewer or prove scholarly qualification.

### Render, authentication, CORS, PWA, and manual QA

- Render workspace selection remains unconfirmed. No Render service configuration, environment values, deploys, events, logs, API health/readiness, live CORS behavior, or Render-to-Neon connectivity was accessed. Production deploy SHAs and availability remain unavailable.
- PR #117 now prevents a production API from silently starting with only the localhost CORS fallback. The deployed allowlist values are not visible without Render access.
- No login/session/OTP/authentication middleware or private-resource authorization route is present. The public problem-report endpoint stores support reports, but there is no authenticated staff inbox/list/assignment/notification workflow.
- The service worker caches the app shell and immutable same-origin build assets plus manifest/icon. API responses and religious/user data are excluded. Automated tests do not replace manual install/offline-recovery testing.
- Manual Arabic RTL, Bengali/English localization, keyboard, screen-reader, contrast/zoom, responsive, browser, and physical Android/iOS QA remain unverified. The mobile drawer focus behavior has automated regression coverage only.

### Release decision

Keep Quran Arabic, Bengali translation, Hadith, tafsir, dua, and audio publication fail-closed. Do not run production migrations or deploy until the correct Render workspace/service is verified, the two missing additive migrations have a backup-backed reversible plan, CORS/runtime credentials are confirmed, and readiness is observed on the deployed API. Do not change Neon network settings until the actual Render egress path is known. Authentication and manual client QA remain separate release blockers.


## QuranEnc Bengali Zakaria Library archive recheck — 2026-11-13 11:10 UTC

This section corrects the earlier 10:58 UTC snapshot: two candidate Abu Bakr Zakaria archives are present in the user's Library. The previous statement that no translation archive was retained is superseded. They are still not official-provenance or publication-approved artifacts.

- Library candidates: dr-abu-bakr-muhammad-zakaria-simple.db.zip (513,989 bytes; SHA-256 ddd05bf3c6780e8231b39f4fc5e63fbee5d0affd46879678bc9f7fdfd63026e0) and dr-abu-bakr-muhammad-zakaria-simple.json.zip (414,183 bytes; SHA-256 a4939eff1291b0527fad109895fb8e556b12d7fa8866989242ce4ed32aac1b82).
- Extracted member SHA-256 values: SQLite DB bfdc89c228fc2d8edc78ab3cd3db74b5c55f02c346e815c220c3727275190358; JSON e053a63f7e59d65b197041878b009e39ca4f53e1f72351c8e465fd1f4815bb59.
- The SQLite archive has one translation table and 6,236 rows. The JSON archive has 6,236 coordinate keys. Both cover all 114 Surahs, match the canonical per-Surah Ayah counts, have no duplicate coordinates or empty strings, and match each other exactly across all 6,236 translation strings.
- Neither archive embeds the source URL, publisher/translator metadata, translation version, last-update date, transcript metadata, or footnotes. The internal ZIP timestamp (2025-05-27 07:12) and Library creation timestamp (2026-11-05 01:00:40 UTC) are not proof of official retrieval.
- QuranEnc's official listing identifies key bengali_zakaria, V1.1.1, last updated 2021-05-22. Its current API and republishing terms require unchanged content, source/publisher attribution, version, retained transcript information, notifying QuranEnc of notes, updating to the latest version, and no inappropriate advertisements. The current official listing shows only Browse Translation for Abu Bakr Zakaria (no XML/CSV/SQLite download link); the documented API response includes translation and footnotes. A spot-check of the official page shows footnote markers absent from the simple archive. The exact simple variant/version is unverified.
- Full hashes, structure, source links, and limitations are recorded in docs/QURANENC-SOURCE-DOSSIER.md. The files are not in main or Neon and were not imported. Keep the translation fail-closed.

