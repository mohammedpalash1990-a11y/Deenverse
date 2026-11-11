# DEENVERSE Verified Content Source Register

**Snapshot:** 2026-11-11  
A provider being listed or reachable through an API does not approve its content for import, redistribution, caching, offline use, or publication. Each content type and edition requires its own evidence.

| Content type | Candidate/provider | Edition/version | Current implementation | Rights/authenticity status | Import/publication status |
|---|---|---|---|---|---|
| Quran Arabic | Tanzil Project | Uthmani, Version 1.1 | Importer/opt-in seed path exists. `main` still mounts the raw-GitHub beta reader; `integration/platform-foundation` now mounts only a fail-closed approval-pending placeholder. The Ayah API route remains source-gated but is not called by the public UI. | Official CC BY 3.0 terms permit verbatim copying/distribution with attribution, a Tanzil link, and the required copyright notice; changing the text is prohibited. The exact official artifact acquisition, selected options, independently recomputed SHA-256, and independent review are not evidenced. | The unverified `quran-uthmani.txt` copy is deleted from the current integration tree. The source remains candidate/not approved; no production import or activation is authorized. Main still exposes its older reader until a reviewed safety change is merged. |
| Quran Bengali translation | QuranEnc.com; translator Abu Bakr Muhammad Zakaria | `bengali_zakaria`, V1.1.1 | Parser/client unit code remains, but both public translation routes are unregistered on `integration/platform-foundation`; the active Quran UI does not request translation. | Explicit web/mobile redistribution, hosting, caching, offline, and export permissions remain unverified. | Not imported and not publicly served on the integration branch. Do not infer rights from provider API availability. |
| Hadith Arabic/translation | HadeethEnc, Sunnah.com API, Dorar are research candidates | Exact edition TBD per provider | Source-gated API/reader and dual narration-review checks exist | Provider-specific access, edition, grading, attribution, and reuse terms remain to be approved. | No approved collection or production corpus recorded. |
| Tafsir | TBD | TBD | No production source/API verified | Authenticity, publisher, edition, attribution, license, and caching rights unreviewed | Blocked |
| Dua/Adhkar | TBD | TBD | No approved library/source verified | References, grading, edition, attribution, and redistribution rights unreviewed | Blocked |
| Recitation audio | EveryAyah and Audiomack were referenced by the previous beta reader | Reciter-specific files/album; exact recording editions TBD | The integration branch replaces the legacy component with a fail-closed placeholder; no audio element or external audio link is rendered. | Recording identity, ownership, attribution, streaming, caching, download, and offline rights are not evidenced. | Not approved; playback remains disabled until each recording has a source-specific rights dossier. |

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
