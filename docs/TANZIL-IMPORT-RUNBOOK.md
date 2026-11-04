# Tanzil Uthmani Import Runbook

**Current status: importer implemented; no official Quran text artifact has been acquired or imported by this repository workflow.**

## Official files

1. Download the Arabic text only from the [official Tanzil download page](https://tanzil.net/download/).
2. Select **Uthmani** (not Uthmani Minimal or Simple).
3. Select the output that includes coordinates in the exact `surah|ayah|text` form (Tanzil's `txt-2` format).
4. Apply and record the official download-page options used for pause marks, sajdah signs, rub-el-hizb signs, and tatweel. Do not alter the downloaded text after retrieval.
5. Download the official [Tanzil Quran metadata XML](https://tanzil.net/res/text/metadata/quran-data.xml) from the [metadata documentation](https://tanzil.net/docs/Quran_Metadata). Metadata is Version 1.0; it supplies Surah names, revelation metadata, and Ayah counts. It is separate from the Arabic text artifact.
6. Preserve both original downloads unchanged in a restricted, read-only source-artifact location outside the Git repository. Record original filenames, retrieval timestamp (UTC), exact URLs, selected options, and SHA-256 digests.

The selected Arabic edition must be **Tanzil Quran Text (Uthmani, Version 1.1)**. The official change log identifies Version 1.1 as released on February 12, 2021: https://tanzil.net/updates/.

## Validate first (dry run)

Run from `backend/` after installing dependencies:

```bash
sha256sum /secure/source/quran-uthmani.txt
npm run quran:import:tanzil -- \
  --artifact /secure/source/quran-uthmani.txt \
  --metadata /secure/source/quran-data.xml \
  --source-id <registered-inactive-source-id> \
  --expected-sha256 <exact-text-artifact-sha256>
```

Without `--apply`, this command is dry-run only. It checks UTF-8 decoding, edition structure, exact sequential coordinates, all 114 Surahs, each canonical per-Surah Ayah count, all 6,236 Ayahs, and calculates artifact/metadata/per-Ayah SHA-256 digests. It does not write to the database.

The importer reads every verse payload without trimming, Unicode normalization, diacritic removal, punctuation changes, or text rewriting. It rejects a BOM, malformed row, empty verse, missing/duplicate/reordered coordinate, wrong count, incomplete metadata, or malformed UTF-8.

## Human approval prerequisite

A separate qualified human/source review must verify the official source identity, selected edition/options, full artifact provenance, exact required copyright notice, sample records against the official source, and the validation report. A checksum verifies artifact identity/integrity; it does not prove religious correctness.

Before `--apply`, the database must contain:

- A `content_sources` row with `content_type=quran`, edition exactly `Tanzil Quran Text (Uthmani, Version 1.1)`, source URL exactly `https://tanzil.net/download/`, license ID `CC-BY-3.0`, verbatim Tanzil/CC BY 3.0 attribution, redistribution explicitly allowed, and `checksum` equal to the downloaded text artifact's SHA-256.
- The same source row must remain `is_active=false` until import completes.
- A separate `content_source_approvals` row with decision `approved`, reviewer, date, review notes, and `artifact_sha256` equal to the exact same artifact digest. The human review notes must also include `metadata_sha256=<exact SHA-256 of quran-data.xml>` so the metadata file is bound to the review.

Do not create an approval merely to make the importer run. The approval must represent a completed independent review. If source identity, licence, or approval is uncertain, do not import.

## Import (explicit write)

Only after the human approval prerequisite and a successful dry run:

```bash
npm run quran:import:tanzil -- \
  --artifact /secure/source/quran-uthmani.txt \
  --metadata /secure/source/quran-data.xml \
  --source-id <registered-inactive-source-id> \
  --expected-sha256 <exact-text-artifact-sha256> \
  --apply
```

The database operation is transactional. It refuses to overwrite or mix an existing Quran catalogue/corpus, inserts 114 Surah metadata rows and 6,236 Ayah rows, verifies final counts, then activates the source only at the end of the successful transaction. Each Ayah row receives its own SHA-256 digest. Any failure rolls the transaction back.

## Attribution and rights

Preserve the Tanzil copyright/licence notice exactly as published with the source and display clear Tanzil attribution with a link to https://tanzil.net/. Permission is for verbatim copies; changing the Arabic text is not allowed. See the [official terms](https://tanzil.net/docs/Text_License). The original source notice must also be retained in the restricted source-artifact archive and reproduced wherever the licence requires.

The metadata hash appears in the dry-run/import report and should be copied into the source dossier with the metadata retrieval details. This importer does not claim to independently approve source content, does not fetch or substitute mirror copies, and does not publish content without an exact approved artifact checksum.
