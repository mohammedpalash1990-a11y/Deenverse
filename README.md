# DEENVERSE

**One Universe. Infinite Islamic Knowledge.**

DEENVERSE is a premium, multilingual Islamic knowledge and worship platform for Web, Android, and iOS.

## Planned product scope

- Verified Quran text, translations, and tafsir with source attribution
- Quran reading, search, bookmarks, reading progress, and audio recitation
- Hadith library with collection, grading, source references, and explanations
- Duas, adhkar, and practical Islamic learning resources
- Hifz and Tajweed practice assistance with clear non-authoritative disclaimers
- Accessible Arabic-first RTL experience alongside localized interfaces
- Admin/content management tools and a scalable backend

## Non-negotiable content integrity

1. Never generate, paraphrase, reconstruct, or silently modify Quranic Arabic.
2. Quran, translation, tafsir, hadith, and recitation content must use traceable, verified sources.
3. Record source, edition/version, attribution, and licensing/usage permissions for every imported corpus.
4. Preserve Arabic text exactly as supplied by the verified source; test normalization and rendering carefully.
5. AI learning feedback is assistance only, not an authoritative religious ruling or certified Tajweed assessment.

## Engineering principles

- Type-safe contracts and documented APIs
- Secure authentication, authorization, rate limits, and secret management
- Automated tests for critical flows and data integrity
- Responsive Web/PWA foundation with mobile-ready architecture
- Accessibility, RTL correctness, localization, and offline behavior
- Feature branches and pull requests; do not commit directly to `main` for feature work

## Current verified status — 2026-11-13

The repository now contains a Next.js web/PWA shell, a Fastify backend, PostgreSQL-compatible schema/migrations, documented API routes, and automated integration tests. The code baseline on main (commit 9042d5f) passed the main CI run: 121 backend tests, 186 frontend tests, typechecks, production builds, and dependency audit. Later commits in main are documentation-only.

This is **not a production-ready or content-complete release**. No current Render service deployment, public API health/readiness, CORS configuration, or Render-to-Neon connection was verified. The production Neon database has no Quran or Hadith corpus rows. Quran display remains a fail-closed approval-pending placeholder; no Quran Arabic, translation, tafsir, or recitation is rendered. The Hadith reader is connected to API clients, but the production Hadith tables are empty. The problem-report API exists, but its production table is not yet present. Authentication/authorization and an authenticated staff report inbox are not implemented. The PWA caches the app shell and immutable static assets only; it does not provide offline religious content. Manual RTL, screen-reader, and physical-device QA remains outstanding.

Do not describe a source, content corpus, API, or deployment as live until its exact evidence and release gates are verified.

## Branch status

- `main` is the canonical branch.
- `jules/backend-foundation`, `queen/frontend-foundation`, and `integration/platform-foundation` are historical delivery branches; no active agent work is claimed from them.
- Open legacy PRs #11 and #79 target the integration branch and are not approved for merge into main.
- At the latest repository audit, main branch protection was disabled. Continue to use pull requests and manually verify exact-head checks before merging.


## Current web and API foundation

The responsive Next.js application shell, navigation, Quran approval-pending state, Hadith API reader, report form, PWA manifest, and service-worker shell caching are in the main branch. The Fastify API includes Quran catalogue/Ayah, Hadith, health/readiness, and problem-report routes. Production service configuration and live frontend-to-API connectivity remain unverified.

### Local web setup

```bash
cd .
npm install
npm run dev
```

### Checks

```bash
npm run typecheck
npm test
npm run build
```

The Quran reader remains fail-closed and does not fetch or render Quran text/audio. The Hadith reader uses the backend API, but no production Hadith corpus is available. A provider-neutral `ContentSource` boundary and runtime provenance validator keep unapproved religious content unavailable. Bookmark synchronization, authenticated user flows, audio playback, and offline religious-content availability are not verified or released. See `docs/PHASE-1-MVP.md`, `docs/VERIFIED-CONTENT-DELIVERY.md`, `docs/TANZIL-SOURCE-DOSSIER.md`, `docs/QURANENC-SOURCE-DOSSIER.md`, and `docs/HADITH-SOURCE-OPTIONS.md` for current source and release gates.


## Quran catalogue integration

See [docs/QURAN-CATALOGUE.md](docs/QURAN-CATALOGUE.md) for the loading, unavailable, empty, integrity-rejected, and verified-metadata states and the remaining backend integration gates.
