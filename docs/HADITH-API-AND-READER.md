# Hadith API and Reader

## Scope

This phase adds read-only Hadith collection, chapter, narration, translation, and search endpoints, plus the web reader. It adds no Hadith text, translation, grade, sample record, or fabricated book metadata. The Hadith storage schema remains the dependency supplied by the parent foundation pull request.

## API

All routes are under `/api/v1/hadith` and use the standard response envelope. Paginated responses return records in `data` and a continuation token in `meta.nextCursor`.

| Method and route | Purpose |
| --- | --- |
| `GET /books?limit=20&cursor=` | List source-approved Hadith collections |
| `GET /books/:bookId/chapters` | List chapter metadata for an approved collection |
| `GET /books/:bookId/records?chapterId=&locale=&limit=20&cursor=` | List reviewed narrations from a collection or chapter |
| `GET /records/:recordId?locale=` | Read one reviewed narration |
| `GET /search?q=&locale=&limit=20&cursor=` | Search reviewed Arabic, Bengali, or English text |

Supported locales are `ar`, `bn`, and `en`. The search term is required and limited to 120 characters. Page size is limited to 1–50. Cursors must be canonical Base64-encoded, non-negative safe-integer offsets.

## Publication gate

A Hadith collection is discoverable only when its registered source is active, has explicit redistribution permission, has an approved source decision, and the approval artifact SHA-256 matches the registered source checksum. Provenance includes the source URL, attribution, edition, license identifier, reviewer, approval decision, and checksum.

A narration is returned only when all of the following are true:

1. Its Hadith source passes the publication gate.
2. A primary review and an independent review both exist for that exact narration.
3. Both reviews have status `passed`, confirm exact text and reference matching, and bind to the source artifact checksum.
4. The two reviews have different reviewer identities.
5. The stored Arabic text matches the narration's SHA-256 digest.

If a gate is missing or fails, the narration is omitted. A digest mismatch returns an integrity error and does not return the text. Conflicting grade assessments are not collapsed into a single grade; this reader phase does not display grades.

Translations are independently source-approved, active, redistributable, tied to their declared source license, and checked against their stored SHA-256 digest. Translator, edition, source, attribution, and license remain attached to the returned translation. A translation that fails any check is not returned.

The frontend validates response structure and provenance as a second defensive layer. Client validation does not replace server-side verification or qualified human review.

## Web reader

The Hadith navigation item opens the live reader component. Users can select an approved collection, browse its chapters and first page of reviewed narrations, select Arabic/Bengali/English translation, and search the selected language. The reader renders source Arabic without rewriting it and shows available narrator/isnad metadata and source attribution.

No approved collections currently means an explicit empty/unavailable state. The reader must not populate itself with sample narrations or public content while the source and review gates remain empty.

## Verification

Backend integration tests use synthetic, clearly-labelled fixtures only. They exercise source approval, checksum mismatch, independent-review requirements, text-digest rejection, translation attribution, and language-scoped search. Frontend tests validate the API client's provenance checks and error handling.

## Release dependencies

The Hadith library foundation schema has been merged into `main`. Apply the additive migration to the deployed PostgreSQL database before deploying this backend. A successful build or deployment does not mean that any Hadith text has been approved or imported.
