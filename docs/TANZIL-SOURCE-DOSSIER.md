# Tanzil Quran Text — DEENVERSE Source Dossier

**Status: CANDIDATE — NOT APPROVED FOR PUBLICATION OR IMPORT**

This dossier records the proposed Arabic Quran source and its published terms. It does not claim that a source artifact has been downloaded, hashed, independently reviewed, or imported.

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

**No artifact checksum is recorded here because the official download bytes have not been acquired in this repository workflow. Do not invent or substitute a checksum from a third-party mirror.**

## Release decision

The source remains **CANDIDATE — NOT APPROVED/IMPORTED** until artifact acquisition, integrity validation, and independent review are complete. The API must continue to fail closed while no approved source record and verified Ayah rows exist. Never seed sample, generated, reconstructed, or third-party-mirror Quran text as production content.

## References

- Tanzil Text License: https://tanzil.net/docs/Text_License
- Tanzil Download Documentation: https://tanzil.net/docs/download
- Tanzil Updates: https://tanzil.net/updates/


---

# Bengali Translation — Abu Bakr Muhammad Zakaria

**Status: CANDIDATE — OFFICIAL PUBLISHER TERMS IDENTIFIED; NOT YET ACQUIRED, IMPORTED, OR APPROVED**

## Source identity

- Work: Bengali translation of the meanings of the Noble Quran by Dr. Abu Bakr Muhammad Zakaria.
- Official digital publisher and source: QuranEnc.com — Encyclopedia of the Noble Quran.
- Official Bengali edition page: https://quranenc.com/bn/browse/bengali_zakaria
- Official English edition page: https://quranenc.com/en/browse/bengali_zakaria/
- Translation key: `bengali_zakaria` (from the official page route; verify against the official API response before use).
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
- The API adapter is pinned to publisher edition `V1.1.1`; if QuranEnc reports any other version, it must fail closed until the new edition is acquired, compared, and explicitly reviewed. A live version-list response is not permission to silently switch editions.
- Compare every imported translation and footnote byte-for-byte (after a documented transport decoding only) with the official source response. Any mismatch blocks publication.
- Retain the original source payload unchanged in restricted source storage and produce a reproducible import/validation report.
- Show attribution in the reader and provide a direct link to QuranEnc.com and the edition page.
- Do not paraphrase, edit, auto-correct, normalize, or AI-rewrite the translation or footnotes.
- Do not publish the translation until acquisition, full coverage validation, rights-condition review, and independent human review are complete.
- If the upstream API is unavailable or the approved edition cannot be verified, fail closed rather than substituting another Bengali translation.

## Release decision

The Abu Bakr Muhammad Zakaria translation is an **identified official source candidate**, not yet a production-approved dataset. The current dossier does not claim that its full text has been downloaded, hashed, checked, imported, or independently reviewed.

## References

- QuranEnc Bengali edition and API specification: https://quranenc.com/bn/browse/bengali_zakaria
- QuranEnc English edition and republication conditions: https://quranenc.com/en/browse/bengali_zakaria/
- QuranEnc Bengali translations index and edition version/date: https://quranenc.com/bn/home
