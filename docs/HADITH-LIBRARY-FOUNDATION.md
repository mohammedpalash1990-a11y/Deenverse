# Deenverse Hadith Library — Product and Data Foundation

## Product reference

The feature benchmark is the public feature set described for Al Hadith by IRD Foundation: collection/book navigation, chapter browsing, Arabic and translations, attributed grading, search, offline reading, bookmarks, notes, reading history/statistics, sharing, and issue reports.

This is a product-capability reference only. Deenverse must not copy Al Hadith's source code, visual assets, database, translations, or Hadith text. Hadith content must come from independently identified sources with redistribution rights.

## Initial scope

1. Browse Hadith collections, books, chapters, and stable Hadith numbers.
2. Read Arabic text alongside separately sourced translations.
3. Display multiple grading assessments with the grading scholar/authority, work, and exact reference. Do not collapse conflicting assessments into one universal grade.
4. Search Arabic and translations with exact/partial matching, book filters, grade filters, and stable references.
5. Save bookmarks and personal notes; restore last-read position.
6. Support downloadable, version-pinned offline book packages.
7. Track reading activity locally; sync user data only after account/authentication work is ready.
8. Share a Hadith with its exact collection, book/chapter, number, translator, and grading references.
9. Allow users to report suspected text, translation, reference, or grading issues.

## Data and scholarly integrity

- Every collection, chapter, Hadith text, translation, and grading assessment is tied to an explicit source record.
- A Hadith's Arabic text is immutable after ingestion. Corrections require a new source edition and new provenance record, not an in-place edit.
- Translation records are independent of Arabic records and identify translator, edition, license, and digest.
- Grading is an attributed scholarly assessment, not an intrinsic boolean authentic flag. Store distinct assessments and preserve disagreement.
- A grade shown to the user must name its grading authority and bibliographic work/reference. Never infer a grade from a book title alone.
- A book being widely accepted does not imply that every narration in it has the same grade under every scholar or methodology.
- Hadith text, narrator text, isnad, translation, and grading notes must not be merged into one field.
- No content may be published until source rights, edition, attribution, exact artifact checksum, and review state are approved.
- Primary and independent human review records are required for each Hadith before publication. Automated tests can validate structure and hashes but cannot authenticate a narration.
- Never generate, paraphrase, or fill missing Hadith text from a language model.

## Initial database foundation

Migration 20261104_000005_hadith_library.ts creates empty tables for:

- hadith_books: collection metadata and source edition.
- hadith_chapters: book chapter/section hierarchy.
- hadith_records: Arabic text, narrator/isnad fields, source reference, numbering scheme, and SHA-256.
- hadith_translations: separately sourced translation per locale and translator.
- hadith_grade_assessments: multiple attributed grades per narration.
- hadith_record_reviews: primary and independent review state bound to the exact source artifact.

The migration imports no religious text and creates no sample narration.

## Publication gate

A future read API must return a narration only when:
1. Its source is active, redistribution is explicitly permitted, and an approval decision is bound to the exact artifact checksum.
2. The stored Arabic text digest matches the exact stored bytes.
3. A primary review and an independent review both pass against the same source artifact.
4. Both reviewers confirm text and bibliographic reference matching.
5. Every displayed translation has its own approved source, translator, license, and digest.
6. Every displayed grade has a traceable authority, work, reference, and assessment source.

Missing or inconsistent evidence means fail closed. Do not expose administrative review write endpoints until authenticated reviewer roles and audit logging exist.

## API/UI sequence

- GET /api/v1/hadith/books: approved collection catalogue, paginated.
- GET /api/v1/hadith/books/:bookId/chapters: chapter list.
- GET /api/v1/hadith/:hadithId: one fully sourced narration and its approved translations/grade assessments.
- GET /api/v1/hadith/search?q=...: server-side indexed search with book, locale, and grade filters.
- Reader UI: collection list → book → chapter → narration; Arabic/translation controls; source and grade details; bookmark/note actions; share/report actions.
- Offline packages must be signed/versioned, source-pinned, and invalidated when their source edition or permission is withdrawn.

These routes are a target contract, not implemented by the schema migration.

## Not included yet

No Hadith dataset has been acquired, licensed, imported, graded, or human-reviewed. No count such as 49,000+ is claimed for Deenverse. No user-facing Hadith content should be displayed until the source acquisition and review pipeline is complete.
