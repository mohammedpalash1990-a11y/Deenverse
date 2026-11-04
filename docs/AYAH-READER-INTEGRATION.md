# Ayah reader integration and release boundaries

## Frontend flow

The Quran page mounts `QuranAyahReader`, which calls the typed client in `src/lib/quran-ayah-client.ts` for one requested Surah/Ayah coordinate. The client validates the request coordinates, response envelope, returned record ID, payload coordinates, Arabic text presence, approval metadata, HTTPS source URL, redistribution flag, and SHA-256 digest format before returning a record to the component.

The reader:
- starts with no scripture text rendered;
- announces loading and error states to assistive technology;
- rejects non-integer coordinates before making a request;
- renders the returned Arabic source string unchanged with `lang="ar"` and `dir="rtl"`;
- displays edition and attribution metadata with the returned text;
- does not store Ayah text in local storage, IndexedDB, or service-worker cache.

## Critical server-side requirement

Frontend validation is a response-shape and metadata preflight only. It cannot prove that the source artifact actually hashes to the supplied digest, that the publisher is authoritative, or that the license is legally sufficient.

The current backend checks the stored Ayah text against its per-record SHA-256 and checks that the approval digest equals the registered source checksum. This does not independently retrieve or hash the immutable source artifact. Do not ingest or publish a production Quran corpus until that independent artifact verification and source review are implemented. A checksum-shaped string in a JSON response is not proof of verification.

## Offline policy

The existing service worker caches only the application shell and public immutable app assets. It must continue bypassing all `/api/` requests. Quran/Ayah text must not be cached offline until a specific edition has documented offline redistribution permission, an independently verified artifact, and an approved cache lifecycle/integrity design.

## Required verification

- Run `npm test -- --run` (or the repository's equivalent Vitest command).
- Run `npm run typecheck`.
- Run `npm run build`.
- Verify the tests on the exact pull-request head commit.
- Test the reader against a backend with no approved source: it must show the safe unavailable state and no scripture text.
- Test an approved source response in a controlled test environment using synthetic fixtures explicitly marked as non-Quran.
- Confirm API responses are not written to browser caches or persistent client storage.

## Current implementation boundary

The frontend contract client and reader UI are implemented in this branch. This does not complete the backend Ayah route, source-artifact verification, independent source approval, real Quran corpus ingestion, authentication, or offline Quran content delivery. Those remain separate release gates.
