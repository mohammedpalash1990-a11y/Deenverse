# DEENVERSE Quran Source Ingestion & Release Gate

**Status:** mandatory engineering specification; no Quran dataset is approved or imported by this document. Tanzil remains a candidate until the complete evidence and independent review below are satisfied.

## 1. Non-negotiable rule

The canonical Quran Arabic displayed by DEENVERSE must be byte-for-byte/string-for-string traceable to one explicitly approved edition snapshot. Generative AI, OCR correction, translation models, normalization libraries, spell-checkers, and UI transformations are never permitted to create or alter canonical scripture.

If a source, record, checksum, permission, or review is missing or inconsistent, the release gate fails closed. The app must show an unavailable state; it must not substitute generated text, a different edition, a cached stale record, or a guessed verse.

## 2. Source acquisition record

Before downloading or importing, create a source dossier containing:

- Publisher and canonical project/source URL.
- Exact edition, script (e.g. Uthmani), release/version, publication date if supplied.
- Exact artifact filename, retrieval URL, retrieval timestamp (UTC), and retrieval method.
- Original artifact preserved read-only; SHA-256 computed over the exact downloaded bytes.
- Complete license text/notice as supplied with the release, license identifier/version, required attribution/link, and a legal-use review for the intended app distribution.
- Explicit decisions for display, redistribution, server hosting, offline storage, export/download, and backup copies. Do not infer one permission from another.
- Reviewer identity/role, review date, evidence reference, and approval decision.

A website statement or API response alone is not an acquired, verified source artifact.

## 3. Immutable manifest

Each imported edition must have a version-controlled manifest (the implementation may choose JSON/YAML, but it must preserve these fields):

| Field | Requirement |
|---|---|
| sourceId | Stable publisher/source identifier |
| editionId | Stable DEENVERSE edition identifier |
| publisher | Exact publisher/project name |
| editionName | Exact edition/script name |
| sourceVersion | Exact upstream release/version; never use "latest" |
| sourceUrl | Canonical source and artifact URL |
| retrievedAt | ISO-8601 UTC timestamp |
| artifactName | Original downloaded filename |
| artifactSha256 | SHA-256 of exact original artifact bytes |
| licenseId / licenseUrl | Exact license and official terms URL |
| licenseNoticeSha256 | Hash of preserved license notice |
| attributionText | Required verbatim attribution text |
| permissions | Explicit booleans/statuses for display, redistribution, hosting, offline cache, export, backup |
| parserVersion | Pinned importer/parser version |
| recordCount | Expected ayah count for this edition |
| recordDigestAlgorithm | SHA-256 |
| recordDigests | Per-record digest index keyed by stable Surah/Ayah ID |
| review | Independent reviewer, role, date, decision, evidence reference |
| status | candidate, blocked, approved, or retired |

Never edit an approved manifest in place. A changed upstream release creates a new edition snapshot and a new review.

## 4. Import and validation pipeline

The import must be deterministic and must retain the original artifact unchanged.

1. Verify the downloaded artifact SHA-256 against the signed-off source dossier.
2. Parse with a pinned, reviewed parser; retain parser version and import log.
3. Validate exactly 114 Surahs and 6,236 ayahs for the selected standard Uthmani edition, unless the publisher's exact documented edition defines a different structure. Any differing count requires explicit investigation and reviewer approval; do not silently force expected counts.
4. Validate Surah order, ayah order, stable identifiers, expected per-Surah counts, first/last records, and absence of duplicate, missing, extra, or reordered records.
5. Compute SHA-256 for each exact canonical UTF-8 record representation. Define the serialization format and field ordering once; do not hash ambiguous concatenations.
6. Compare every imported Arabic string exactly against the parsed approved source snapshot. Preserve code points, combining marks, diacritics, punctuation, and whitespace exactly as specified by the source format.
7. Do not apply NFC/NFD/NFKC/NFKD normalization, diacritic removal, glyph substitution, whitespace cleanup, punctuation rewriting, auto-correction, transliteration, or typography transformations to canonical text.
8. Produce a machine-readable validation report with artifact digest, parser version, record count, per-Surah counts, missing/duplicate/extra/reordered IDs, string mismatches, and overall result.
9. Require a separate human review of source identity, edition, sample records, and any anomaly. A checksum proves identity/integrity, not religious correctness.
10. Approve only after both technical validation and independent human sign-off succeed.

Any failure aborts the import and blocks publication. No partial publication.

## 5. Runtime and deployment checks

- Every Quran read request is bound to one explicit approved edition ID and stable Surah/Ayah IDs.
- The deployed dataset's manifest and artifact digest must match the approved release record.
- Deployment verification checks the approved manifest and record digests before serving content.
- A record-level mismatch, unknown edition, retired source, missing record, or failed permission check returns CONTENT_UNAVAILABLE (or an equivalent non-success response).
- Never silently fall back to another edition, a previous snapshot, AI-generated text, or an unverified cache.
- Keep the last approved release immutable for audit/rollback, but rollback is allowed only while its rights remain valid and the source has not been withdrawn.
- Record publication, retirement, rollback, and reviewer decisions in an append-only audit trail.

## 6. Licensing and distribution matrix

Approval is use-specific. Record each separately:

| Use | Required evidence |
|---|---|
| In-app display | License/terms explicitly permit display |
| Backend hosting | Hosting/storage permission |
| Redistribution in app bundle | Explicit redistribution permission and attribution |
| Offline cache | Explicit offline/cache permission and any expiry/sync obligations |
| User export/download | Explicit export/redistribution permission |
| Backup/archive | Permission and retention conditions |
| Modified/derived text | Must remain disabled unless publisher explicitly permits it; DEENVERSE policy still forbids altering canonical Arabic |

For Tanzil, the published CC BY 3.0 terms describe verbatim use with attribution, a link to tanzil.net, and the required copyright/license notice, and prohibit changing the text. Tanzil is still **CANDIDATE — NOT YET APPROVED/IMPORTED** until the exact release artifact, license notice, checksum, full coverage checks, and independent review are recorded.

Quran Foundation API content is governed by its Developer Terms and must not be treated as unrestricted open data. Follow its display, attribution, no-modification, redistribution, cache-duration, and Content Sync requirements. Do not bundle or separately redistribute its raw content unless the applicable terms or a signed license explicitly permit that use.

This gate applies independently to translations, tafsir, Hadith, duas, recitations/audio, fonts, and images. Approval of Quran Arabic does not approve any other asset.

## 7. Release-blocking acceptance criteria

- [ ] Source dossier complete and official artifact preserved.
- [ ] Exact release and license notice captured.
- [ ] Legal permissions documented for every intended distribution mode.
- [ ] Original artifact SHA-256 verified.
- [ ] Parser/version pinned and deterministic.
- [ ] Surah/Ayah coverage, ordering, duplicates, and per-Surah counts validated.
- [ ] Every record digest generated and reproducible.
- [ ] Exact source-to-import string comparison passes with zero mismatch.
- [ ] No text normalization or transformation path exists in ingestion/display.
- [ ] Independent human/source review signed off.
- [ ] Runtime and deployment fail-closed tests pass.
- [ ] Attribution and license notice visible as required.
- [ ] Offline/export/backup behavior matches the specific license.
- [ ] Audit trail and rollback evidence retained.

Until every applicable item is complete, status remains blocked and canonical Quran content must not be published.

## 8. Required automated test cases

The eventual implementation must include tests proving that:

- One changed Arabic code point or diacritic causes rejection.
- Missing, duplicate, extra, or reordered ayah IDs cause rejection.
- Artifact checksum mismatch causes rejection before parsing/publication.
- A changed per-record digest causes rejection.
- Unknown, unapproved, or retired editions cannot be served.
- A license that permits display but not offline caching cannot be cached offline.
- A source outage or missing record produces an unavailable state, never generated fallback.
- UI rendering preserves the exact stored string (no normalization or text cleanup).
- A valid approved snapshot can be loaded reproducibly from its immutable manifest.

## 9. Source references

- Tanzil text license: https://tanzil.net/docs/text_license
- Tanzil updates/releases: https://tanzil.net/updates/
- Quran Foundation Developer Terms: https://api-docs.quran.com/legal/developer-terms/
- Quran Foundation FAQ / Content Sync guidance: https://api-docs.quran.foundation/docs/tutorials/faq/

These references are policy inputs, not evidence that any DEENVERSE dataset has been downloaded, validated, or approved.
