# DEENVERSE

**One Universe. Infinite Islamic Knowledge.**

DEENVERSE is a premium, multilingual Islamic knowledge and worship platform for Web, Android, and iOS.

## Product scope

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

## Current status

Repository bootstrap. Product implementation, architecture decisions, source selection, and test coverage must be documented as they are completed. Do not claim a feature is complete without code and verification evidence.

## Working branches

- `jules/backend-foundation` — backend, data model, API contracts, security, tests
- `queen/frontend-foundation` — product UI, design system, reader experience, accessibility
- `integration/platform-foundation` — integration and cross-cutting documentation

All contributions should be submitted as pull requests against `main`.


## Phase 1 web foundation

A responsive Next.js UI foundation is being developed on `assistant/phase1-web-foundation`. It includes the primary navigation shell, Quran entry state, responsive layouts, PWA manifest metadata, and initial navigation tests.

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

The web shell intentionally contains no Quranic Arabic, hadith, dua, translation, tafsir, or reciter data. A provider-neutral `ContentSource` boundary and runtime provenance validator now define how an approved API may be integrated; the default source remains unavailable and fails closed. It is not connected to a backend, does not sync bookmarks, and does not claim audio playback or offline religious-content availability. See `docs/PHASE-1-MVP.md` and `docs/VERIFIED-CONTENT-DELIVERY.md` for the release gates.


## Quran catalogue integration

See [docs/QURAN-CATALOGUE.md](docs/QURAN-CATALOGUE.md) for the loading, unavailable, empty, integrity-rejected, and verified-metadata states and the remaining backend integration gates.
