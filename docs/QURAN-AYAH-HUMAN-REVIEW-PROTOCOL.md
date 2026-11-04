# Quran Ayah-by-Ayah Human Review Protocol

**Status: READY FOR REVIEWER ASSIGNMENT — NO AYAH HAS BEEN HUMAN-APPROVED**

This protocol prepares the review process. It does not approve a source, certify an edition, or authorize publication. The Tanzil source dossier remains the controlling source-acquisition record: `docs/TANZIL-SOURCE-DOSSIER.md`.

## 1. Work that must happen before verse review

The operator must obtain the source directly from the official Tanzil download page and record the exact selected options. Do not use a mirror, copied dataset, package, or an artifact supplied by an unknown third party.

Record and preserve:

- Exact source filename, format, script/edition, and every download option.
- Official download URL and retrieval timestamp in UTC.
- Original downloaded bytes, unchanged, in restricted source-artifact storage.
- SHA-256 of the original artifact and of the preserved license notice.
- Tanzil copyright and license notice, verbatim.
- Importer/parser version and reproducible command/log.
- Source-reported Surah/Ayah counts and any documented numbering conventions.

Do not infer the edition from appearance alone. The chosen script must be explicitly identified as the intended Uthmani edition. Do not silently convert, normalize, strip diacritics, replace characters, or reformat Arabic.

## 2. Required review coverage

Review every Ayah in the exact acquired artifact, in Surah order, from the first Ayah through the final Ayah of the final Surah.

The often-quoted total of 6,236 Ayahs is a planning reference, not a hard-coded acceptance rule. The selected source artifact's own documented structure is authoritative for the expected row count. If its count differs, stop and investigate the edition/numbering explanation; never pad, drop, or renumber records to force a target.

For every Ayah, the reviewer must:

1. Open the exact official source edition and the corresponding reference Mushaf/approved reference copy.
2. Confirm Surah number/name and Ayah number against the reference.
3. Compare the complete Arabic string, including letters, harakat/diacritics, hamza forms, alif forms, madd signs, pause marks, and any source-defined symbols.
4. Check that no character is missing, added, reordered, substituted, or normalized.
5. Confirm the next and previous Ayah boundaries so text has not shifted between records.
6. Record the result and a concise issue note where a discrepancy exists. Never repair the text by typing a corrected verse into the review record.

A reviewer must not approve an Ayah solely because it looks plausible or because its checksum matches the imported database. A checksum proves byte/string consistency with the recorded source, not religious correctness of the source itself.

## 3. Review states and decision rules

Use only these states:

- `not_started`: no comparison performed.
- `in_review`: comparison started but not completed.
- `passed`: full comparison completed with no discrepancy.
- `failed`: any mismatch, uncertainty, wrong reference, or boundary issue.
- `needs_second_review`: reviewer cannot resolve a question and requires an independent qualified reviewer.

A failed or uncertain Ayah blocks the affected record from publication. Do not mark it passed after editing the Arabic. Resolve the cause against the original source, document the decision, reacquire/re-import if necessary, and repeat review from the unchanged artifact.

Record reviewer identity as the person's real, accountable name/role in the controlled review log, review timestamp (UTC), source artifact SHA-256, reference edition used, and decision. Do not publish personal contact details.

## 4. Independent review and sign-off

- The primary reviewer checks every Ayah, not a sample.
- A second qualified reviewer independently checks all failed/uncertain Ayahs and a documented risk-based sample of passed Ayahs.
- Any disagreement returns the Ayah to `needs_second_review`; no majority vote or automated model may settle Quran text.
- Final sign-off must identify the exact source artifact SHA-256, importer version, expected/actual Ayah count, number passed/failed/unresolved, and reviewers.
- Keep the signed review report with the source artifact and import log.

This repository currently has no named human reviewer or completed human review. Do not invent either.

## 5. Automated checks after human review

Automation supplements, but never replaces, human review. The import/verification pipeline must establish:

- Unique key for each `(source_id, surah_number, ayah_number)`.
- No missing or duplicate coordinates.
- Source order preserved exactly.
- Every stored Arabic string equals the corresponding source-artifact string byte-for-byte after the documented file decoding step; no Unicode normalization.
- SHA-256 recomputed from each stored Arabic string and compared with its stored digest.
- Source artifact SHA-256 independently recomputed from the original bytes.
- Actual row count and per-Surah Ayah counts match the acquired source manifest.
- All review records refer to the same immutable artifact SHA-256 and edition.
- Any mismatch causes a hard failure and leaves the Quran endpoint unavailable.

## 6. Review log fields

Create one row per Ayah in a controlled spreadsheet or database review log with these columns:

| Field | Required content |
|---|---|
| source_artifact_sha256 | SHA-256 of the unchanged official source file |
| edition | Exact source edition/script and selected options |
| surah_number | Source Surah number |
| ayah_number | Source Ayah number |
| reviewer_status | One of the five states above |
| reference_edition | Exact Mushaf/reference edition used |
| text_match | `yes`, `no`, or `uncertain` |
| boundary_match | `yes`, `no`, or `uncertain` |
| issue_note | Concise factual description; no rewritten Quran text |
| reviewer | Accountable reviewer name/role |
| reviewed_at_utc | ISO 8601 UTC timestamp |
| second_reviewer | Second reviewer name/role, when required |
| second_review_status | Decision or `not_required` |

Do not place the full Quran text in this log. The immutable source artifact and database are the text records; the log records review decisions only.

## 7. Release gate

Quran Arabic may be enabled only after all of the following are true:

- Official artifact acquired and its exact bytes preserved.
- License notice and attribution retained.
- Artifact checksum independently verified.
- Import is reproducible and exact-string validation passes.
- Every Ayah has a `passed` primary review status.
- Required second review and final sign-off are complete.
- Source approval metadata refers to the same artifact checksum and edition.
- Backend integration tests prove unavailable/failed/unreviewed content is never returned.

Until then, the backend must remain fail-closed. No demo Arabic, generated text, third-party mirror, or unreviewed Ayah may be displayed as verified Quran content.
