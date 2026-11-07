# Ayah reader integration and release boundaries

## Frontend flow

The reusable `QuranAyahReader` and typed client in `src/lib/quran-ayah-client.ts` remain in the repository, but the current `integration/platform-foundation` AppShell does not mount that reader. It mounts the fail-closed `QuranBetaReader` approval-pending placeholder instead. The public Quran section therefore makes no Quran API, translation API, raw-GitHub, or audio request and displays no religious text. The reusable reader must not be re-mounted until the exact source artifact, redistribution rights, independent human approval, and backend publication gate are evidenced.

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

The frontend contract client and reusable reader component exist, and the backend Ayah route/service remains registered. The active integration AppShell is deliberately fail-closed and does not mount the reader. The source selector requires distinct source and artifact reviewers and rejects the project-owner chat authorization identity. The Tanzil importer implements official-artifact retrieval, validation, digest recomputation, and independent-approval checks; however, the exact official artifact acquisition and completed independent approval are not evidenced, so no production Quran content may be imported or published. The API does not re-download and hash the upstream artifact per request. Translation routes and audio playback remain disabled pending separate source-specific rights and review.
