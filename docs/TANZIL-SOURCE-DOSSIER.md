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
