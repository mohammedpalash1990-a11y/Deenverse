# DEENVERSE Phase 1 — MVP Vertical Slice

Status: implementation brief for frontend/backend/integration owners. This document defines the first shippable slice; it does not claim that any feature is implemented.

## Product objective

Deliver a reliable, premium Quran-reader application shell that proves the end-to-end architecture without importing unverified religious content. The first release is a foundation for the wider DEENVERSE platform, not the complete product.

## Phase 1 scope

### P0 — required for the first integrated build
- Responsive application shell for mobile and desktop.
- Primary navigation: Quran, Hadith, Duas & Adhkar, Learn, Bookmarks, Settings.
- Quran catalogue screen with search/filter affordances and explicit empty/loading/error states.
- Reader layout supporting Arabic-first RTL rendering, Surah/Ayah navigation controls, translation-edition selector, audio-control surface, and bookmark affordance.
- Content API adapter boundary; mock adapter may be used until backend is ready and must be visibly identified as demo data.
- User-independent reading preferences may be stored locally; private bookmarks/progress must not be represented as securely synced until authentication/API exist.
- Design tokens, keyboard navigation, semantic labels, focus visibility, and reduced-motion support.
- Unit/component tests for navigation, reader states, RTL layout primitives, and API error mapping.
- Reproducible local setup and CI build/test commands.

### P1 — next increment, not a blocker for the shell
- Authentication and session lifecycle.
- Persisted bookmarks and reading progress.
- Approved Quran text/translation edition ingestion with provenance and checksum verification.
- Licensed reciter catalogue and playback integration.
- Hadith and dua catalogue ingestion after source review.

### Explicitly out of scope for Phase 1
- AI-generated Quran/Hadith/dua content.
- AI-issued fatwas or authoritative Tajweed grading.
- Unverified religious corpus imports.
- Offline storage of content whose license does not permit redistribution or caching.
- Payments, subscriptions, social feeds, and admin publishing UI.

## User journeys and acceptance criteria

### A. Open the app
1. User opens the app on a phone or desktop.
2. App shell renders without horizontal overflow.
3. Main navigation is keyboard-operable and has accessible names.
4. Current section is visibly and programmatically indicated.

Pass when: clean install/build succeeds; route navigation works; responsive checks cover narrow mobile, tablet, and desktop widths.

### B. Open Quran
1. User selects Quran.
2. Catalogue shows approved content if a verified source is configured; otherwise it shows a clear empty/demo state.
3. Search and selection controls expose loading, no-results, and error states.
4. No placeholder is styled or described as real scripture.

Pass when: tests cover success, empty, loading, network failure, and malformed response paths.

### C. Open reader
1. User selects a Surah/Ayah from available verified catalogue metadata.
2. Reader presents Arabic in RTL direction and translation in the selected edition's configured direction.
3. User can change the translation edition, move between supported navigation targets, and invoke the audio control surface.
4. If text/audio is not configured, the app explains that verified content is not yet available.

Pass when: RTL tests verify directionality, mixed Arabic/Latin layout, focus order, and no clipping at supported widths. Audio controls must not falsely indicate playback when no licensed stream is available.

### D. Bookmark affordance
1. User invokes bookmark.
2. If signed out or persistence is not implemented, the UI explains the limitation and does not claim the bookmark was synced.
3. Once backend support exists, writes are user-scoped and idempotent.

Pass when: UI states and API adapter behavior are tested; authorization is enforced server-side before synced data is enabled.

## API boundary (provisional)

Frontend should depend on typed adapters, not scattered raw fetch calls. Proposed initial read operations:
- list Surah metadata
- retrieve ayah records for a Surah and a specified approved edition
- list approved translation editions
- list licensed reciters/audio resources

The exact route and schema must be agreed by Jules and Queen and recorded in `docs/API-CONTRACT.md` before integration. Never fabricate Quranic Arabic or religious references to make a screen look populated.

## Content integrity release gate

A religious content edition cannot be enabled in production until the source register records:
- publisher/provider and canonical source identifier
- edition/version and language
- authenticity/review status appropriate to the content type
- attribution and license text
- explicit redistribution, caching, and audio-streaming permissions
- retrieval date and immutable checksum/snapshot
- reviewer and approval record

Quran Arabic must be compared byte-for-byte or by a documented normalization-safe verification process against the approved source snapshot. Any normalization must be explicit, tested, and never silently alter displayed text.

## Definition of done

A Phase 1 PR is reviewable only when it includes:
- changed-file summary and screenshots or API examples as applicable
- exact build/test commands and actual results
- known limitations and unimplemented controls
- accessibility/RTL evidence for UI changes
- no secrets, fabricated religious data, or unsupported completion claims

A green build is not evidence of religious-content authenticity. Content approval is a separate release gate.


## Absolute Quranic text integrity rule

The Quran reader must never use AI-generated, reconstructed, paraphrased, auto-corrected, OCR-repaired, transliterated, or silently normalized text as canonical ayah content. AI may not invent a verse, complete a partial verse, or guess a Surah/Ayah reference. Only exact text from a source approved in `docs/SOURCE-REGISTER.md` may be displayed, tied to an explicit edition/version and stable Surah/Ayah IDs.

The Tanzil Uthmani text is a candidate because its published CC BY 3.0 terms permit verbatim website/app use with attribution and prohibit changing the text. It is not approved for production merely by being named here: capture the exact official release, preserve its license notice, record SHA-256 and per-ayah hashes, verify all Surah/Ayah records and ordering, and obtain independent human review before enabling it. If any integrity check fails or the approved source is unavailable, show an unavailable state—never AI text or an unverified fallback.

Translations, tafsir, Hadith, duas, audio and other assets each need separate rights and provenance approval. Offline caching is allowed only when the specific source license/terms permit it.


## Implementation status against this brief — 2026-11-04

Main now contains a Next.js/React web app, typed API clients, Fastify backend, PostgreSQL-compatible migrations, and CI. The current backend route inventory and exact adapter mapping are recorded in `docs/IMPLEMENTED-API-RECONCILIATION.md` and `docs/OPENAPI-DRAFT.yaml`.

Implemented code includes the responsive app shell, Quran Surah metadata catalogue, source-gated Ayah reader/client, pinned QuranEnc Bengali translation integration, source-gated Hadith API/reader, and basic source-backed Hifz recall controls. The backend exposes 12 GET routes as listed in the OpenAPI snapshot.

Still not a completed production vertical slice:
- no explicit multi-edition Quran selector; source selection must be made deterministic before more than one edition is active;
- no completed independent source-artifact acquisition/review or per-Ayah human approval in main;
- QuranEnc redistribution/caching/offline terms need explicit review;
- no approved Hadith corpus is populated;
- audio, dua/adhkar, tafsir, authentication/session, and private cloud bookmark/progress APIs remain unavailable;
- manual responsive/RTL/keyboard/screen-reader/device QA and hosted production database/backup checks remain open.

No Quran/Hadith/dua/tafsir/audio text may be fabricated to fill these gaps. Keep unavailable states explicit.
