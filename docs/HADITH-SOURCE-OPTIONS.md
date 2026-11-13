# Hadith source options audit — 2026-11-13

**Status: research candidates only. No source is approved for import or publication.**

No Hadith source artifact was found in the user's Library by filename or semantic search. Production Neon contains zero rows in hadith_books, hadith_chapters, hadith_records, hadith_translations, hadith_grade_assessments, and hadith_record_reviews. The options below are research leads, not approval or proof of religious authenticity.

## Candidate 1 — i-muslim translation API

Source: https://i-muslim.com/ur/downloads  
API example inspected: https://i-muslim.com/api/v1/translations/hadith/nawawi/ar

The provider describes nine collections and 37,165 translations authored by i-muslim under CC0 1.0. It says classical Arabic editions are public domain, while non-Arabic translations mirrored from upstream sources are metadata-only when redistribution rights are unclear. Its response envelope is designed to identify authored versus imported rows and preserve per-item source/license metadata. The current language coverage shown is Arabic, English, Russian, and Turkish; Bangla is not listed.

A live 42-item Nawawi Arabic response reported:
- attribution: Classical Arabic edition (public domain)
- license: Public Domain
- license_url: https://unlicense.org/
- source_id: fawazahmed0:ara-nawawi
- source_url: https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-nawawi.min.json
- redistribute: full
- notice: null

The Public Domain label paired with an Unlicense URL is a metadata inconsistency that needs clarification. The upstream source is an aggregated GitHub/CDN edition, not a primary publisher. The API is live and no immutable release artifact or official SHA-256 manifest was verified. The provider's licensing statements are not independent proof of the underlying edition's public-domain status or scholarly correctness.

**Assessment:** possible Arabic source candidate and limited CC0-authored translation candidate only. Not a Bangla source; do not import until per-item source/edition/licence evidence, a frozen artifact digest, and qualified independent review are obtained.

## Candidate 2 — Jaguar16/open-hadith-data

Repository: https://github.com/Jaguar16/open-hadith-data  
Data licence statement: https://github.com/Jaguar16/open-hadith-data/blob/main/DATA_LICENSE.md

The repository advertises 46,891 Hadith entries in SQLite/JSON/CSV and extraction from sunnah.com. Its DATA_LICENSE.md dedicates the structured schema/organization to CC0 1.0 and claims the original Arabic Hadith text is public domain. It separately warns that English translations are sourced from sunnah.com and may be copyrighted by their translators/publishers; users must consult sunnah.com's terms. The README does not guarantee completeness or correctness and asks users to verify with authenticated printed editions and qualified scholars. The README headline says 17 collections while its feature list says 18, a count discrepancy. The published language coverage is Arabic and English, not Bangla.

**Assessment:** possible structured-data/Arabic candidate only after verifying exact source editions and independently hashing a frozen release. Do not use English translations without explicit rights; no Bangla translation source is provided.

## Candidate 3 — JamilRayhan/open-hadith-json

Repository: https://github.com/JamilRayhan/open-hadith-json  
Licence: https://github.com/JamilRayhan/open-hadith-json/blob/main/LICENSE

The README advertises Arabic, English, and Bangla and a community-maintained dataset. Its LICENSE declares CC BY-SA 4.0 for the dataset and MIT for scripts. The README metadata example names sunnah.com as a text reference, but the inspected schema/examples do not establish per-Hadith translator identity, exact edition, source URL, or independent scholarly review. The repository disclaims authority and completeness/accuracy warranties. A repository-level CC BY-SA declaration does not by itself prove that contributors own or may relicense every upstream translation or edition.

**Assessment:** the only inspected candidate that advertises Bangla, but upstream ownership/redistribution authority and per-item provenance are unresolved. Do not import until rights and content provenance are independently established, and account for CC BY-SA attribution/share-alike obligations.

## Candidate 4 — Dorar al-Sunniyah Hadith Encyclopedia API

Service: https://dorar.net/index.php/api-services

The public page describes Hadith search returning text, narrator, scholar, source, and grading, and exposes terms-of-use and access-request steps. No open bulk-download licence or general redistribution grant was verified from the public page.

**Assessment:** potential licensed API route after access approval and written redistribution terms; not an open-source corpus and not approved for bulk import.

## Sources not approved

- Sunnah.com is an upstream source for multiple candidate datasets, but no explicit redistribution grant for the required translations was verified in this audit.
- The user's Al-Hadith app reference is a UI/content inspiration only; no source licence or reusable dataset evidence was established.
- Community GitHub mirrors must not be treated as owning third-party translations merely because their code or repository has an open-source licence.

## Release gate

Before any Hadith import:
1. Select each collection, edition, language, translator, and numbering scheme explicitly.
2. Obtain the primary-source acquisition URL and source-specific redistribution permission for each text/translation; retain attribution and licence notices.
3. Download a frozen artifact, record retrieval timestamp and SHA-256, and preserve the original bytes.
4. Validate collection/book/chapter/Hadith counts and numbering against the named edition; independently check duplicates, missing records, and representative text.
5. Obtain qualified independent human review for Arabic text, translation, and grading; keep disagreements and grading authorities distinct.
6. Import only rows with complete provenance/licence/approval metadata. Keep unapproved or rights-unclear rows absent, not merely hidden in the UI.

No candidate was downloaded into the repository or production, and no Hadith content or production data was changed during this audit.
