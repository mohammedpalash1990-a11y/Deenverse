# DEENVERSE Verified Content Source Register

**Snapshot:** 2026-11-05  
A provider being listed or reachable through an API does not approve its content for import, redistribution, caching, offline use, or publication. Each content type and edition requires its own evidence.

| Content type | Candidate/provider | Edition/version | Current implementation | Rights/authenticity status | Import/publication status |
|---|---|---|---|---|---|
| Quran Arabic | Tanzil Project | Uthmani, Version 1.1 | Importer/opt-in seed path exists. `main` still mounts a raw-GitHub beta reader; `integration/platform-foundation` now mounts the API approval-gated single-Ayah reader instead. | Official CC BY 3.0 terms permit verbatim copying/distribution with attribution, a Tanzil link, and the required copyright notice; changing the text is prohibited. The committed file's exact official-source acquisition, selected options, SHA-256, and independent review are not evidenced by `SOURCE_INFO.md`. | Public repository copy exists; integration UI no longer bypasses the backend source gate, but full-Surah API, DB import/activation, and independent per-Ayah review remain unverified. Treat as candidate, not release-approved. |
| Quran Bengali translation | QuranEnc.com; translator Abu Bakr Muhammad Zakaria | `bengali_zakaria`, V1.1.1 | Live API service/client, edition-version pinned | Current code points to a generic provider home page for terms. Explicit web/mobile redistribution, caching, offline, and export permissions remain unverified in this register. | Not imported; do not treat API availability as redistribution permission. |
| Hadith Arabic/translation | HadeethEnc, Sunnah.com API, Dorar are research candidates | Exact edition TBD per provider | Source-gated API/reader and dual narration-review checks exist | Provider-specific access, edition, grading, attribution, and reuse terms remain to be approved. | No approved collection or production corpus recorded. |
| Tafsir | TBD | TBD | No production source/API verified | Authenticity, publisher, edition, attribution, license, and caching rights unreviewed | Blocked |
| Dua/Adhkar | TBD | TBD | No approved library/source verified | References, grading, edition, attribution, and redistribution rights unreviewed | Blocked |
| Recitation audio | EveryAyah URLs and an Audiomack album remain referenced by the legacy beta-reader component | Reciter-specific files/album; exact recording editions TBD | Legacy `src/components/quran-beta-reader.tsx` is no longer mounted by `AppShell` on the integration branch; no approved audio catalogue/API | Recording identity, ownership, attribution, streaming, caching, download, and offline rights are not evidenced | Not approved. External links are not a license review; playback remains out of the integration UI until rights are verified. |

## 2026-11-05 repository evidence refresh

- Current `main` is `f098d650a9cbc5aaaaadee6a925e68dfa9dbdb9a`. It contains `data/quran/tanzil/quran-uthmani.txt` and `data/quran/tanzil/SOURCE_INFO.md`; the source-info file records only source, Uthmani text, Version 1.1, URL, and an unverified statement that the original text is unchanged.
- On current `main`, `src/components/app-shell.tsx` still mounts `QuranBetaReader`, which fetches the raw GitHub file and displays it. This is already public content delivery, even though it is not a database import. The integration branch changes `AppShell` to mount `QuranAyahReader` instead; that single-Ayah reader only renders after the backend API returns valid approval, licensing, and integrity metadata. This change is in PR #1 and is not yet on `main`.
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
