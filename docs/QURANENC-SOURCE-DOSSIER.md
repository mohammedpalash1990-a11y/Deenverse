# QuranEnc Bengali Abu Bakr Zakaria candidate archive audit

**Status: candidate only. Not approved for import, activation, or publication.**

Audit date: 2026-11-13. The files below were present in the user's Library, not in the Deenverse GitHub tree or production database.

## Candidate files and independent digests

| Library file | ZIP bytes | ZIP SHA-256 | Extracted member | Member bytes | Member SHA-256 |
|---|---:|---|---|---:|---|
| dr-abu-bakr-muhammad-zakaria-simple.db.zip | 513,989 | ddd05bf3c6780e8231b39f4fc5e63fbee5d0affd46879678bc9f7fdfd63026e0 | dr-abu-bakr-muhammad-zakaria-simple.db | 2,449,408 | bfdc89c228fc2d8edc78ab3cd3db74b5c55f02c346e815c220c3727275190358 |
| dr-abu-bakr-muhammad-zakaria-simple.json.zip | 414,183 | a4939eff1291b0527fad109895fb8e556b12d7fa8866989242ce4ed32aac1b82 | dr-abu-bakr-muhammad-zakaria-simple.json | 2,254,464 | e053a63f7e59d65b197041878b009e39ca4f53e1f72351c8e465fd1f4815bb59 |

The Library records both ZIPs as created on 2026-11-05 01:00:40 UTC. Each ZIP member has an internal archive timestamp of 2025-05-27 07:12. Neither timestamp proves when or from which official endpoint the data was retrieved.

## Structural and cross-format checks

- The SQLite archive contains exactly one table, translation, with columns sura, ayah, ayah_key, and text; it contains 6,236 rows.
- The JSON archive contains 6,236 sura:ayah keys. Each value contains only a t field.
- Both formats contain 6,236 unique coordinates, from 1:1 through 114:6. All 114 Surahs are present; every per-Surah row count matches the repository's canonical EXPECTED_AYAH_COUNTS.
- No duplicate coordinates or empty translation strings were found.
- All 6,236 coordinates and translation strings match exactly between the SQLite and JSON archives.
- These checks establish archive integrity, completeness, and internal parity only. They do not prove publisher provenance, the selected edition/version, translator authorization, or scholarly correctness.

## Official QuranEnc evidence and remaining gaps

The official QuranEnc API and republishing terms page documents a translation-list endpoint that returns a translation key, language, version, last-update timestamp, title, and description. The Sura API response contains translation and footnotes. The official Bengali listing identifies the Abu Bakr Zakaria translation as key bengali_zakaria, version V1.1.1, last updated 2021-05-22: https://quranenc.com/bn/browse/bengali_zakaria/1

QuranEnc states that translations may be downloaded and republished only with these conditions: no modification/addition/deletion; clear publisher and source attribution; version number; transcript information retained inside the document; notification of translation notes; updating to the latest source version; and no inappropriate advertisements.

The two Library archives contain no README, source URL, publisher/translator metadata table, version field, last-update field, transcript metadata, or footnotes. The current official index entry for Abu Bakr Zakaria shows a Browse Translation link but no XML/CSV/SQLite download link, while the official API specification documents a Sura response containing both translation and footnotes. The filename says simple, but that name alone does not prove which official variant or version it represents. A spot-check of the official Surah 1 page shows footnote markers/explanatory notes that are absent from the simple archive row; without an official release manifest, it is not possible to determine whether this is an authorized simple export or a derivative with omitted content.

No official download receipt, exact download URL/options, acquisition timestamp, matching official archive digest, or independent human review was found. The candidate digest therefore must not be represented as an official QuranEnc digest or assigned V1.1.1 without further evidence.

## Release decision

Keep the Bengali translation disabled. Do not import or publish these archives until the exact official release/variant and version are confirmed, the archive is reconciled with the official source and required transcript metadata, all source/attribution/version terms are satisfied, and qualified independent review is recorded. No Quran/Hadith content or production data was changed during this audit.
