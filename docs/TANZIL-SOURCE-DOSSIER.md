# Tanzil Quran Text — DEENVERSE Source Dossier

**Status: CANDIDATE — NOT APPROVED FOR PUBLICATION OR IMPORT**

This dossier records the proposed Arabic Quran source and its published terms. A candidate copy in the user's Library has now been structurally inspected and hashed, but its exact official acquisition provenance is not established, it does not match the checksum stored in production, and it has not been independently approved or imported.

## Source identity

- Publisher: Tanzil Project
- Source: https://tanzil.net/
- Official download page: https://tanzil.net/docs/download
- Official text license: https://tanzil.net/docs/Text_License
- Proposed edition: Tanzil Quran Text, Uthmani script, Version 1.1
- Upstream release stated by the download page: February 2021
- Proposed license: Creative Commons Attribution 3.0 (CC BY 3.0)
- Official updates: https://tanzil.net/updates/

## Required attribution notice

The following notice is reproduced from the Tanzil Project's published text-license page. Preserve it verbatim with every copy of the text and reproduce it appropriately in files containing a substantial portion of the text.

```text
Tanzil Quran Text
Copyright (C) 2007-2021 Tanzil Project
License: Creative Commons Attribution 3.0

This copy of the Quran text is carefully produced, highly
verified and continuously monitored by a group of specialists
in Tanzil Project.

TERMS OF USE:

- Permission is granted to copy and distribute verbatim copies
  of this text, but CHANGING IT IS NOT ALLOWED.

- This Quran text can be used in any website or application,
  provided that its source (Tanzil Project) is clearly indicated,
  and a link is made to tanzil.net to enable users to keep
  track of changes.

- This copyright notice shall be included in all verbatim copies
  of the text, and shall be reproduced appropriately in all files
  derived from or containing substantial portion of this text.

Please check updates at: http://tanzil.net/updates/
```

## Proposed DEENVERSE use

Based on the source-specific terms above, the proposed use is limited to verbatim copies with visible Tanzil attribution and a link to https://tanzil.net/:

| Use | Dossier assessment | Condition |
|---|---|---|
| In-app display | Permitted by published website/application term | Exact unmodified text; attribution visible |
| Backend hosting | Candidate permitted | Only the verbatim source artifact; preserve notice |
| App redistribution | Permitted for verbatim copies | Preserve notice and source link |
| Offline cache | Candidate permitted as verbatim copying/distribution | No text alteration; keep source notice |
| User export | Candidate permitted as verbatim copying/distribution | Export must remain unmodified and attributed |
| Backup/archive | Candidate permitted as verbatim copying/distribution | Preserve original bytes and notice |
| Modified/derived Arabic text | Prohibited | Must remain disabled |

This is an engineering source assessment, not legal advice. Do not apply these permissions to translations, tafsir, audio, fonts, or other assets.


## Candidate user-library copy audit — 2026-11-11

A file named `quran-uthmani.txt` was found in the user's Library. Its Library metadata records creation at **2026-11-05 01:00:59 UTC**, MIME type `text/plain`, and size **1,396,087 bytes**. This is a Library timestamp, not a verified Tanzil download timestamp.

Independent byte-level and structural checks on that exact Library file found:

- SHA-256 of the complete file bytes, including its 30-line copyright footer: `6933e133dd56db778c801bf738848454e43648105a151e8d84d86a7cae39ec5f`.
- Git object identity: the local Git blob hash of this Library file is `9813920ae5afce9e50d2ac44562457e29bb4bfca`, exactly matching the historical GitHub blob for `data/quran/tanzil/quran-uthmani.txt` at commit `abb4dd06531d7585b13b8f29af45e7d05a995574` (2026-11-05 01:07:50 UTC). This proves byte identity with the historical repository copy, not official Tanzil acquisition provenance.
- 6,266 total lines: 6,236 numbered Ayah rows followed by 30 footer lines.
- 114 Surahs, 6,236 unique Ayah coordinates, complete ordered sequence from 1:1 through 114:6.
- Every Surah's Ayah count matches the repository's canonical `EXPECTED_AYAH_COUNTS` array.
- The file identifies itself as Tanzil Uthmani Version 1.1 and includes a CC BY 3.0 notice. Its footer says `Copyright (C) 2007-2026 Tanzil Project`; the historical notice quoted earlier in this dossier says 2007-2021. Reconcile the exact current publisher notice against the official download before release.

This proves that the available copy is structurally complete and contains a Tanzil-style notice. It does **not** prove that the bytes were obtained from the official Tanzil download endpoint, which options were selected, or when they were retrieved. No original download receipt or independently acquired Tanzil metadata XML was found in the Library search used for this audit.

### Production checksum comparison

The read-only Neon source row and approval row both store artifact checksum `ac0724796cbbda0f4801470fbbd11d0f3c5802067bae0493466d0128b0c667af`. The Library copy's independently computed SHA-256 is different: `6933e133dd56db778c801bf738848454e43648105a151e8d84d86a7cae39ec5f`.

The importer hashes the exact downloaded `textBytes`; it does not treat a matching Surah/Ayah count as a substitute for the exact artifact digest. Therefore this Library copy is **not** the exact byte sequence represented by the current production source/approval checksum metadata. The approval notes also contain metadata digest `8867c1d88191472adec9db694b3cd9f135b1a2ef580574d32cf888dcb22c5c7a`, but the corresponding original metadata bytes were not available to recompute it.

The source row is inactive, and both the source reviewer and approval reviewer are `project-owner-chat-authorization`; this is not independent human approval. Do not overwrite the stored checksum, create a new approval row, import this Library copy, or activate the source to make the values match. Acquire and preserve the exact official text and metadata artifacts first, then obtain qualified independent review bound to those exact bytes.

## Artifact acquisition — still required

The following fields must be completed from the exact official download obtained by an operator:

- Exact artifact filename and selected text options.
- Retrieval timestamp (UTC) and exact download URL.
- Original artifact stored unchanged in a restricted source-artifact location.
- SHA-256 of the exact downloaded bytes.
- SHA-256 of the exact preserved license notice.
- Pinned parser/importer version and reproducible import log.
- Full 114-Surah / 6,236-Ayah coverage and ordering report for the selected standard edition; investigate any source-documented variation rather than forcing counts.
- Per-Ayah digests and exact source-to-database string comparison with zero mismatches.
- Independent human review of source identity, edition, sample records, and validation report.

**The checksum above is only for the user-library candidate copy. It is not an authenticated official-download checksum and does not match production metadata. Do not substitute it for the exact official artifact digest or use it to approve/import content.**

## Release decision

The source remains **CANDIDATE — NOT APPROVED/IMPORTED** until artifact acquisition, integrity validation, and independent review are complete. The API must continue to fail closed while no approved source record and verified Ayah rows exist. Never seed sample, generated, reconstructed, or third-party-mirror Quran text as production content.

## References

- Tanzil Text License: https://tanzil.net/docs/Text_License
- Tanzil Download Documentation: https://tanzil.net/docs/download
- Tanzil Updates: https://tanzil.net/updates/


---

# Bengali Translation — Abu Bakr Muhammad Zakaria

**Status: CANDIDATE — LIBRARY ARCHIVES FOUND; OFFICIAL PROVENANCE/VARIANT NOT VERIFIED; NOT IMPORTED OR APPROVED**

## Source identity

- Work: Bengali translation of the meanings of the Noble Quran by Dr. Abu Bakr Muhammad Zakaria.
- Official digital publisher and source: QuranEnc.com — Encyclopedia of the Noble Quran.
- Official Bengali edition page: https://quranenc.com/bn/browse/bengali_zakaria
- Official English edition page: https://quranenc.com/en/browse/bengali_zakaria/
- Translation key: `bengali_zakaria` (the dedicated Surah API endpoint accepts this key; the current translation-list API omitted it, so version metadata must be independently pinned).
- Publisher-listed edition: V1.1.1, dated 22 May 2021.
- Publisher's terms: https://quranenc.com/en/home
- Official publisher API documentation is displayed on the translation page.

## Publisher's republication conditions

QuranEnc states that translation contents may be downloaded and re-published subject to all of these conditions:

1. No modification, addition, or deletion of the content.
2. Clearly identify the publisher and source as QuranEnc.com.
3. State the version number when republishing.
4. Keep the transcript information inside the document.
5. Notify QuranEnc about any note concerning the translation.
6. Update the translation according to the latest version issued by the source.
7. Do not display inappropriate advertisements alongside translations of the meanings of the Noble Quran.

These are source-specific conditional republication terms, not a blanket open-source or public-domain license. Do not label this translation CC0, public domain, or CC BY. Keep the full publisher attribution and transcript metadata with every exported or cached copy. Before enabling redistribution beyond the stated terms, obtain a legal/rights review.

## Official API contract

The official page documents:

- Whole Surah: `GET https://quranenc.com/api/v1/translation/sura/{translation_key}/{sura_number}`
- Single Ayah: `GET https://quranenc.com/api/v1/translation/aya/{translation_key}/{sura_number}/{aya_number}`
- `translation_key`: the currently selected translation key; candidate value is `bengali_zakaria`.
- Surah number: 1–114.
- Response fields documented by QuranEnc: `sura`, `aya`, `translation`, and `footnotes`.

Do not guess the API schema beyond the official documentation. Before implementation, capture and validate real responses for Surah 1/Ayah 1, a verse with footnotes, and the final Ayah of a Surah. Preserve the publisher's translation and footnote text exactly; only render presentation markup safely and deterministically. Never merge footnotes into the translation field or silently omit them.

## DEENVERSE integration requirements

- Treat Arabic Quran text and Bengali translation as separate content sources with independent provenance, versions, approvals, and checksums.
- Store the translation key, publisher, translator, edition/version, source URL, retrieval timestamp, source response/artifact digest, and transcript metadata.
- Preserve every verse coordinate and confirm complete coverage/order against the source's own Surah/Ayah boundaries; do not assume a total count without verifying the official payload.
- The official browse listing identifies `V1.1.1` (2021-05-22), but the current translation-list API does not return `bengali_zakaria`. Before implementation, capture the exact official Surah API responses and pin the edition/version from the official listing; fail closed if that version cannot be verified. Do not infer a version from the Library filename.
- Compare every imported translation and footnote byte-for-byte (after a documented transport decoding only) with the official source response. Any mismatch blocks publication.
- Retain the original source payload unchanged in restricted source storage and produce a reproducible import/validation report.
- Show attribution in the reader and provide a direct link to QuranEnc.com and the edition page.
- Do not paraphrase, edit, auto-correct, normalize, or AI-rewrite the translation or footnotes.
- Do not publish the translation until acquisition, full coverage validation, rights-condition review, and independent human review are complete.
- If the upstream API is unavailable or the approved edition cannot be verified, fail closed rather than substituting another Bengali translation.

## Release decision

The Abu Bakr Muhammad Zakaria translation is an **identified official source candidate**, not yet a production-approved dataset. The Library contains candidate DB/JSON archives that have now been independently hashed and structurally checked. They are not proven official source artifacts, and no production import or independent human review has occurred. See the 2026-11-13 candidate-archive audit below and docs/QURANENC-SOURCE-DOSSIER.md.

## References

- QuranEnc Bengali edition and API specification: https://quranenc.com/bn/browse/bengali_zakaria
- QuranEnc English edition and republication conditions: https://quranenc.com/en/browse/bengali_zakaria/
- QuranEnc Bengali translations index and edition version/date: https://quranenc.com/bn/home


## QuranEnc Library candidate archive correction — 2026-11-13

The earlier wording "not yet acquired" means that no verified official download has been acquired. It does not mean that no candidate file exists. Two candidate archives are present in the user's Library:

- dr-abu-bakr-muhammad-zakaria-simple.db.zip — 513,989 bytes; SHA-256 ddd05bf3c6780e8231b39f4fc5e63fbee5d0affd46879678bc9f7fdfd63026e0. Extracted DB: 2,449,408 bytes; SHA-256 bfdc89c228fc2d8edc78ab3cd3db74b5c55f02c346e815c220c3727275190358.
- dr-abu-bakr-muhammad-zakaria-simple.json.zip — 414,183 bytes; SHA-256 a4939eff1291b0527fad109895fb8e556b12d7fa8866989242ce4ed32aac1b82. Extracted JSON: 2,254,464 bytes; SHA-256 e053a63f7e59d65b197041878b009e39ca4f53e1f72351c8e465fd1f4815bb59.

The SQLite and JSON archives each contain 6,236 unique Ayah coordinates covering all 114 Surahs and matching the canonical per-Surah Ayah counts. All coordinates and translation strings match exactly between the two formats. The SQLite file has one translation table; JSON values contain only a text field. Neither archive includes source URL, publisher/version metadata, last-update date, transcript metadata, or footnotes.

The current official QuranEnc index lists Abu Bakr Zakaria as V1.1.1, last updated 2021-05-22, but shows only a Browse Translation link for this entry, not a direct XML/CSV/SQLite download. The documented translation-list API returned 76 entries without the bengali_zakaria key, while the dedicated Surah endpoint still returned the translation and footnotes. Fourteen sampled coordinates across Surahs 1, 2, 18, 36, 55, and 114 matched the candidate text after bracketed footnote-marker removal; the candidate archives contain neither those markers nor the separate footnotes. This could be an authorized "simple" export, but no official release manifest proves that variant or its version.

QuranEnc's terms require unchanged content, publisher/source attribution, version identification, transcript information retained in the document, notification of notes, current-version updates, and no inappropriate advertisements. The archive's omission of markers/footnotes and lack of embedded metadata must be reconciled against an official release before use. The internal ZIP timestamp and Library creation timestamp are not official retrieval evidence.

Do not import, activate, or publish either candidate archive. The complete hash/structure/API comparison and release decision are in docs/QURANENC-SOURCE-DOSSIER.md. No production data or religious content was changed during this audit.
