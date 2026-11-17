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

## Verified status snapshot — 2026-11-17

Current main is `0b25fe0ef8baebca50b17990d570dfda61e0f70d`. Exact-main [CI run #43708255723](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/43708255723) passed both jobs: backend typecheck, 123/123 tests, PostgreSQL 16 runtime/migration test, build and dependency audit (0 vulnerabilities); web typecheck, 186/186 tests across 21 files, production build and dependency audit (0 vulnerabilities). The latest code change [PR #134](https://github.com/mohammedpalash1990-a11y/Deenverse/pull/134) normalizes reviewer identities across PostgreSQL and SQLite and is merged. [PR #91](https://github.com/mohammedpalash1990-a11y/Deenverse/pull/91) and [PR #92](https://github.com/mohammedpalash1990-a11y/Deenverse/pull/92) remain merged. The overlapping PRs #85, #86, #87 and #89 are closed unmerged; their accepted fixes are represented by later mainline PRs. PR #90, #93, #105, #126, #128 and #130–#134 are merged. The only open PRs are [#79](https://github.com/mohammedpalash1990-a11y/Deenverse/pull/79) and [#11](https://github.com/mohammedpalash1990-a11y/Deenverse/pull/11); both target the historical `integration/platform-foundation` branch and are dirty/non-mergeable. Do not merge them as-is.

The Quran source selector now fails closed unless exactly one eligible active source exists; zero or multiple eligible sources are unavailable. The per-Ayah review gate is implemented in main through [PR #105](https://github.com/mohammedpalash1990-a11y/Deenverse/pull/105). These code gates do not establish reviewer qualifications or authenticate reviewer identities. Quran Arabic and all Hadith corpus data remain absent from production.

This is **not a production-ready or content-complete release**. The Neon `deenverse-db` PostgreSQL 17 default branch is Ready but unprotected. Its IP allowlist is empty, `protected_branches_only=false`, and public connections are not blocked. The production schema currently has ten tables; `quran_ayah_reviews` and `problem_reports` are missing. Read-only counts are `content_sources=1`, `content_source_approvals=1`, `quran_surahs=0`, `quran_ayahs=0`, and zero rows in all six Hadith tables. The sole Tanzil source is inactive; source and approval reviewer IDs both equal `project-owner-chat-authorization`. Its stored digest `ac0724796cbbda0f4801470fbbd11d0f3c5802067bae0493466d0128b0c667af` does not match the Library candidate bytes independently re-hashed on 2026-11-17 (`6933e133dd56db778c801bf738848454e43648105a151e8d84d86a7cae39ec5f`). No official Tanzil acquisition record or qualified independent approval is established. The missing additive tables keep the current readiness schema check closed; no production migration was run.

Render service configuration, deploy history, logs, API health/readiness, deployed CORS values, and Render-to-Neon connectivity were not accessed because no Render workspace is confirmed for this audit. No current production deploy SHA is claimed. GitHub reports `main.protected=false` and the repository rulesets collection is empty; the branch-protection detail endpoint is unavailable to this connection. Authentication/session/authorization is not implemented; `backend/.env.example` contains only a blank `JWT_SECRET` placeholder. The PWA caches the app shell and immutable same-origin assets only. Manual Arabic RTL, Bengali/English localization, keyboard, screen-reader, responsive, offline-recovery, and physical Android/iOS QA remains outstanding.

Keep Quran Arabic, Bengali translation, Hadith, tafsir, dua, and recitation audio unavailable until exact immutable source artifacts, independently recomputed matching digests, source-specific redistribution evidence/attribution, and qualified independent human approval are established. Do not treat stored database metadata or a matching digest string as proof of provenance.

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
