# Verified content delivery boundary

## Purpose

The web application consumes religious material only through the provider-neutral
`ContentSource` interface in `src/lib/content-source.ts`. UI components must not
fetch an unreviewed corpus directly or synthesize missing text.

## Record requirements

Every delivered record carries:

- Stable record ID and content type
- Display title and locale
- Complete provenance: source ID, edition, HTTPS source URL, attribution,
  license identifier, explicit redistribution permission, reviewer, review
  timestamp, and checksum
- Provider payload kept opaque until a content-type-specific renderer validates it

The publication gate in `src/lib/content-safety.ts` checks required metadata and
permission flags. It is a metadata check, **not proof of authenticity**, scholarly
grading, or a substitute for human review.

## Client contract

- `list(query)` returns a page and an optional opaque pagination cursor.
- `getById(id)` returns a record or an explicit not-found value.
- Failures use a stable error code and a retryability flag.
- The default source returns `UNAVAILABLE`; it never falls back to generated
  Quran, Hadith, dua, translation, tafsir, or audio content.
- Authentication and authorization belong to the eventual API adapter; do not
  place service credentials in browser code.

## Provider integration checklist

Before connecting a real provider:

1. Agree the API schema and version with the backend owner.
2. Map provider fields without dropping or rewriting provenance.
3. Verify source authenticity, edition, attribution, license, and redistribution
   and caching/offline rights for each corpus.
4. Verify checksum and review state server-side; reject incomplete records.
5. Add contract tests with synthetic fixtures only (never invented scripture).
6. Define locale, pagination, rate-limit, timeout, and authorization behavior.
7. Keep audio delivery separate from text records and verify streaming rights.
8. Obtain independent content-owner and security review before enabling publication.

## Explicitly out of scope

This boundary does not select a content vendor, define a production database,
authenticate users, sync bookmarks, provide recitation audio, or authorize any
religious corpus. Those decisions remain subject to backend/API owner review.
