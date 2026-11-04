# DEENVERSE Verified Content Source Register

**Snapshot:** 2026-11-04  
A provider being listed or reachable through an API does not approve its content for import, redistribution, caching, offline use, or publication. Each content type and edition requires its own evidence.

| Content type | Candidate/provider | Edition/version | Current implementation | Rights/authenticity status | Import/publication status |
|---|---|---|---|---|---|
| Quran Arabic | Tanzil Project | Uthmani, Version 1.1 | Official-source importer and opt-in seed path exist | Published CC BY 3.0 terms require verbatim text, attribution, source link, and license notice. Exact artifact/checksum and independent source review are not recorded in the dossier. | Candidate only; no approved source or import evidence recorded. Per-Ayah human approval is not enforced in main; PR #43 is open. |
| Quran Bengali translation | QuranEnc.com; translator Abu Bakr Muhammad Zakaria | `bengali_zakaria`, V1.1.1 | Live API service/client, edition-version pinned | Current code points to a generic provider home page for terms. Explicit web/mobile redistribution, caching, offline, and export permissions remain unverified in this register. | Not imported; do not treat API availability as redistribution permission. |
| Hadith Arabic/translation | HadeethEnc, Sunnah.com API, Dorar are research candidates | Exact edition TBD per provider | Source-gated API/reader and dual narration-review checks exist | Provider-specific access, edition, grading, attribution, and reuse terms remain to be approved. | No approved collection or production corpus recorded. |
| Tafsir | TBD | TBD | No production source/API verified | Authenticity, publisher, edition, attribution, license, and caching rights unreviewed | Blocked |
| Dua/Adhkar | TBD | TBD | No approved library/source verified | References, grading, edition, attribution, and redistribution rights unreviewed | Blocked |
| Recitation audio | TBD | TBD | No approved reciter/audio API or playback path verified | Recording ownership, streaming, caching, download, and offline rights unreviewed | Blocked; playback remains unavailable/disabled |

## Tanzil import prerequisites

The main-branch importer/seed code:
- downloads only from the official HTTPS Tanzil domain and rejects redirects outside that domain;
- validates the official text/metadata, exact coordinates/order, 114 Surahs and 6,236 Ayahs for the pinned Uthmani edition, and the required license-footer shape;
- computes text-artifact, metadata, and per-Ayah SHA-256 digests;
- requires a pre-registered inactive source and a separate independent approval whose reviewer differs from the source reviewer and whose approval record is bound to both exact artifact digests;
- refuses partial/mixed existing Quran data.

The source dossier and human-review protocol still record no acquired official artifact, no completed independent source review, and no Ayah human approvals. Do not create approval rows merely to make the importer run. A checksum proves integrity against a byte sequence; it does not establish scholarly correctness.

## Required evidence before any import or public release

1. Exact official source URL, filename, edition/version, retrieval time, and acquisition method.
2. Original bytes retained unchanged outside the Git repository.
3. Artifact and license-notice SHA-256; parser/importer version; complete validation report.
4. Exact attribution and license text plus a use-specific decision for display, hosting, redistribution, caching, offline, export, and backup.
5. Independent reviewer identity/role, evidence, date, and decision.
6. Per-record integrity and required human review appropriate to the content type.
7. Rollback/retirement plan if source terms change or permission is withdrawn.

Never commit source credentials, secrets, restricted artifacts, or production content datasets.
