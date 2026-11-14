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

## Current verified status — 2026-11-14

Current main `fffb3c22df79b4ebf8fb0c9fb65d964dc6053739` passed [main CI #43584307414](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/43584307414): backend typecheck, 122 tests, PostgreSQL migration/runtime test, build and dependency audit; web typecheck, 186 tests, production build and dependency audit (0 vulnerabilities in both projects). The mainline includes mobile-navigation accessibility fixes in [PR #113](https://github.com/mohammedpalash1990-a11y/Deenverse/pull/113) and [PR #115](https://github.com/mohammedpalash1990-a11y/Deenverse/pull/115), production CORS validation in [PR #117](https://github.com/mohammedpalash1990-a11y/Deenverse/pull/117), readiness regression coverage in [PR #124](https://github.com/mohammedpalash1990-a11y/Deenverse/pull/124), and the least-privilege problem-report write path in [PR #126](https://github.com/mohammedpalash1990-a11y/Deenverse/pull/126). PR #126 exact-head CI [#43584153647](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/43584153647) and post-merge main CI both passed.

This is **not a production-ready or content-complete release**. Render service configuration, deploy history, logs, public API health/readiness, deployed CORS values, and Render-to-Neon connectivity were not verified because the Render workspace has not been confirmed for this audit. The Neon production branch is reachable, but `quran_surahs` and `quran_ayahs` contain zero rows; all six Hadith content/review tables contain zero rows; `quran_ayah_reviews` and `problem_reports` tables are absent. The readiness endpoint must remain unavailable until the additive migrations are applied and the runtime role has the required report INSERT privilege. PR #126 now grants only INSERT on `problem_reports` to the existing runtime roles, revokes their other privileges on that table, and makes PostgreSQL readiness check the current role's INSERT permission; this migration has **not** been applied to production. Quran display remains a fail-closed approval-pending placeholder; no Quran Arabic, translation, tafsir, or recitation is rendered. The Hadith reader is connected to API clients, but no production Hadith corpus exists. Authentication/authorization and an authenticated staff report inbox are not implemented. The PWA caches the app shell and immutable static assets only; it does not provide offline religious content. Manual Arabic RTL, Bengali/English localization, screen-reader, keyboard, responsive, and physical-device QA remains outstanding.

Do not describe a source, content corpus, API, or deployment as live until its exact evidence and release gates are verified.

## Branch status

- `main` is the canonical branch.
- `jules/backend-foundation`, `queen/frontend-foundation`, and `integration/platform-foundation` are historical delivery branches; no active agent work is claimed from them.
- Open legacy PRs #11 and #79 target the integration branch and are not approved for merge into main.
- Main branch protection is disabled. The Neon `main` branch is also unprotected; its IP allowlist is empty and public connections are not blocked. Continue to use pull requests and manually verify exact-head checks before merging.


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
