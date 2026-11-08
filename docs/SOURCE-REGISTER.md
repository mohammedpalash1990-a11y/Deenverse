# DEENVERSE Verified Content Source Register

**Snapshot:** 2026-11-05  
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


## Mainline publication-state reconciliation — 2026-11-08

This section supersedes earlier statements in this register that main still exposes the raw-GitHub Quran beta reader or that PR #1/#80 are unmerged. The current main SHA is `aa6e283de36a72d56f347dc474d9f29f92286fc8`; PR #1 and PR #80 changes are integrated.

- The mounted Quran UI on current main is an approval-pending, fail-closed state. It does not fetch or render Quran text, translation, or audio. The backend has a source-gated single-Ayah route and client adapter, but the public UI does not activate them while publication approval is absent.
- The unverified repository Quran text copy is not part of current main. Do not reintroduce a raw-GitHub fallback or treat a client-side checksum as publisher acquisition, independent approval, or redistribution permission.
- Both public QuranEnc Bengali translation routes are unregistered. The Bengali translation client is dormant code only. Web/mobile hosting, redistribution, caching, offline, and export rights remain unverified.
- PR #80's Hadith source-binding checks are now in main. This is a software integrity gate, not evidence that any Hadith collection or edition has been approved or imported.
- The current source register still has no approved production Quran, Bengali translation, Hadith, tafsir, dua/adhkar, or recitation-audio corpus. No such content was imported or fabricated by the 2026-11-08 integration review.
- PR #81 (reviewer identity normalization), #82 (exact Unicode search-cursor scope), and #83 (service-worker cache persistence) remain open drafts at the time of review. Their passing PR-head CI does not mean those changes are in main.
- Keep publication disabled until exact immutable source artifacts, independent SHA-256 recomputation, edition identity, use-specific rights, attribution, and qualified independent review are evidenced. Quran Arabic additionally requires the approved per-Ayah review gate.
