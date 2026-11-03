# DEENVERSE — Implemented API Reconciliation

**Status:** evidence-backed implementation snapshot; not a claim that the full Quran reader API is complete.  
**Snapshot:** `main` at `6a1beb1c90aa7d195e8081ca1157649fae4dd305` (2026-11-03).  
**Maintained on:** `integration/platform-foundation` only.  
**Companion specification:** `docs/OPENAPI-DRAFT.yaml` (filename retained for compatibility; contents now describe implemented routes only).

## 1. Repository and workstream evidence

| Ref | Exact head | Comparison against main | Observed result |
|---|---|---:|---|
| `main` | `6a1beb1c90aa7d195e8081ca1157649fae4dd305` | — | Next.js web app, Fastify backend, adapters, migrations, tests and CI are present. |
| `jules/backend-foundation` | `f84e35c242ab37ccafca0528a1d06e0d4b244834` | 3 ahead / 14 behind | Its current diff contains `AGENT_TASK.md` and `JULES_NEXT_TASK.md` only; no backend source on this exact branch head. |
| `queen/frontend-foundation` | `9ef788c81de85e9ebfa139b35c42d606c38f2010` | 2 ahead / 14 behind | Its current diff contains `AGENT_TASK.md` only; no frontend source on this exact branch head. |
| `integration/platform-foundation` | `eac93a6616e73048ea3787dcced87bc471eb25bc` | 36 ahead / 14 behind | Eight documentation files differ from the current main ancestry. The branch is not synchronized. |

The exact Jules/Queen assignment branches are not evidence of active implementation. There is, however, merged work attributable to those workstreams:

- Backend foundation: PR #7 was closed without merging; the clean backend integration was merged through PR #18 at main commit `da49dfe07f5896f90eab46af3a85b08e8eb56aa5`. The current main tree contains the backend implementation and its tests.
- Frontend accessibility and REST adapter: PR #16 merged at `96ebb8e717134769ca07b183bb4f8d4e047877e2`; PR #17 merged at `31f4797e2e49dedf1361cc93af117b7e6d072892`. Their accessibility work and typed metadata adapter are present on main.
- Production SQLite fail-closed guard: PR #20 merged at `6a1beb1c90aa7d195e8081ca1157649fae4dd305`.
- Quran source-ingestion release gate: PR #21 merged at `4035f22d6ab502ffc2b92aa6a71ef8bba311a9d8`.

Open integration items at this snapshot:

- PR #1 remains open, based on an older main SHA, and the integration branch is 14 commits behind main. Do not merge it without resolving the duplicated documentation paths and rerunning CI.
- PR #11 remains open against `integration/platform-foundation`. Its static gap register was written against an earlier backend snapshot; several details are superseded by the current main implementation and must be refreshed before acceptance.
- PR #22 remains open for PostgreSQL runtime/migration configuration. Its exact head passed CI, but no hosted PostgreSQL integration result is recorded.

## 2. Selected implementation stack

The current main tree establishes the following stack:

- Web: Next.js 15.5.28, React 19.1.2, TypeScript 5.8.3, Vitest 5.1.0.
- Backend: Node.js/TypeScript, Fastify 5.2.1, Knex 3.1.x, Zod 3.24.x, SQLite for local/test execution, and the PostgreSQL driver dependency.
- Web scripts: `npm run typecheck`, `npm test`, `npm run build`.
- Backend scripts: `npm run typecheck`, `npm test`, `npm run build`, `npm run db:migrate`.

Important production boundary: on the inspected main commit, `backend/src/index.ts` still rejects production startup and rejects non-SQLite runtime selection. The PostgreSQL runtime/migration changes are in PR #22, not yet merged. A green CI run on PR #22 does not establish that a deployed PostgreSQL service, credentials, TLS settings, or migrations work in a real environment.

## 3. Implemented HTTP surface on main

Only the following routes were found in `backend/src/app.ts` and `backend/src/routes/quran.ts`:

| Method and route | Implemented behavior | Success shape | Important failures |
|---|---|---|---|
| `GET /api/v1/health` | Liveness probe | Health-specific object: `status`, `probe`, `timestamp`, `requestId` | Global rate limit / CORS / internal error handling |
| `GET /api/v1/ready` | Database and required-schema readiness probe | Readiness-specific object: `status`, `probe`, `database`, `migrations`, `timestamp`, `requestId` | `503 UNAVAILABLE` when DB or required tables are unavailable |
| `GET /api/v1/quran/surahs` | Approved-source-gated Surah metadata catalogue | `{ meta: { requestId, nextCursor }, data: ContentRecord[] }` | `400 VALIDATION_ERROR`, `503 CONTENT_UNAVAILABLE`; global `403`/`429` handling |
| `GET /api/v1/quran/surahs/{surahNumber}` | One Surah metadata record, not ayah text | `{ meta: { requestId }, data: ContentRecord }` | `400 VALIDATION_ERROR`, `404 NOT_FOUND`, `503 CONTENT_UNAVAILABLE`; global `403`/`429` handling |

### Catalogue query semantics

- `limit` defaults to 20 and is constrained to 1–50 by the backend.
- `cursor` is currently a canonical base64-encoded non-negative numeric offset. Clients must treat it as opaque and only send back the server-provided value; it is not currently bound to an edition or query fingerprint.
- The list endpoint returns `503 CONTENT_UNAVAILABLE` when no active, distributable, approved Quran source passes the current database metadata checks. If a qualifying source exists but has zero Surah rows, the list response can be `200` with an empty `data` array.
- Surah detail path values are restricted to integers 1–114.

### Implemented Surah record shape

The route returns a `ContentRecord<SurahPayload>`:

- Record: `id`, `type`, `title`, `locale`, `provenance`, `payload`.
- Payload: `surahNumber`, `nameArabic`, `nameSimple`, `nameEnglish`, `revelationPlace` (`makkah` or `madinah`), `revelationOrder`, `versesCount`.
- Provenance includes `contentType`, `sourceId`, `edition`, `sourceUrl`, `attribution`, `licenseId`, `redistributionAllowed`, `reviewer`, `reviewedAt`, `approvalStatus`, `reviewDecisionId`, `approvedByAuthority`, `approvedAt`, and `checksum`.

The backend's error envelope is `{ error: { code, message, requestId, details, retryable } }`. The `retryable` field is required by the current implementation and must not be omitted from a generated client schema.

## 4. Frontend adapter reconciliation

The main-branch `src/lib/content-api-client.ts` is a read-only adapter for Arabic Quran Surah metadata:

- `list()` accepts only `type: "quran"` and `locale: "ar"`.
- It calls `GET /api/v1/quran/surahs`, limits each backend request to 50 rows, follows server-returned cursors, and can collect up to 114 Surah metadata records for the UI.
- It rejects duplicate record IDs and repeated cursors rather than silently returning a partial catalogue.
- `getById()` accepts `quran:surah:1` through `quran:surah:114` and calls the metadata detail route.
- `content-api-response.ts` validates paginated success envelopes; `content-api-errors.ts` maps server errors to safe client-facing messages.
- The adapter deliberately does not implement Ayah text, editions, reciter/audio data, authentication, or user data.

The frontend's provenance type is narrower than the backend's expanded approval metadata. The adapter's structural checks are useful transport validation, not a scholarly authenticity check, cryptographic artifact verification, reviewer-authority check, or license decision.

## 5. Differences from the earlier integration proposal

The previous integration OpenAPI proposal described a larger future read surface. It must not be mistaken for deployed functionality.

| Earlier proposal | Current implementation | Reconciliation |
|---|---|---|
| `GET /api/v1/quran/editions` | No route registered | Deferred; do not call it from the client. |
| `GET /api/v1/quran/surahs/{n}/ayahs?editionId=...` | No Ayah route registered | Deferred until edition identity, artifact verification and content release gates exist. |
| `GET /api/v1/audio/reciters` | No route registered | Deferred; no reciter or audio catalogue is available. |
| Limit default 50 / maximum 100 | Default 20 / maximum 50 | Updated in the implementation-aligned OpenAPI snapshot. |
| Surah fields `number`, `nameTransliteration`, `ayahCount` | `surahNumber`, `nameSimple`, `versesCount`, plus English name and revelation metadata | Use the backend field names until a reviewed versioned migration is made. |
| Detail response ambiguously described | One object in `data`, not a one-element array | Frontend adapter already validates a single record. |
| Error envelope without a required retry flag | `retryable` is present and required | Included in the implementation-aligned schema. |
| Query-bound opaque cursor | Base64 offset cursor | Treat as opaque client-side; replace server-side semantics before claiming query binding. |

The current Quran catalogue query checks an active source, redistribution flag, approved decision, and equality between the stored approval artifact digest and source checksum. It does **not** retrieve and hash the immutable source artifact at request time. Equality of two stored digest fields is not proof that the source artifact is authentic or unchanged. Do not describe this check as cryptographic artifact verification.

## 6. CI and verification evidence

Remote GitHub Actions evidence inspected for this snapshot:

| Commit / PR head | Workflow run | Result | Verified steps |
|---|---|---|---|
| Main `6a1beb1c90aa7d195e8081ca1157649fae4dd305` | `41626698190` — DEENVERSE CI | Success | Web typecheck, tests, production build; backend typecheck, tests, build |
| PR #22 head `51b8735f6b3f39a659e4eb15a9e95d31076006c4` | `41627796874` — DEENVERSE CI | Success | Web typecheck, tests, production build; backend typecheck, tests, build |
| PR #22 head `51b8735f6b3f39a659e4eb15a9e95d31076006c4` | `41627796745` — Web foundation checks | Success | Web dependency install, audit summary, typecheck, tests, production build |

No local shell, browser, screen-reader, deployed API, or hosted PostgreSQL command was run in this review. CI results are remote workflow evidence only. Manual responsive/RTL/accessibility checks and real PostgreSQL deployment verification remain outstanding.

## 7. Religious-content release boundary

- No Quran Ayah corpus, translation, tafsir, Hadith, dua, or audio dataset was imported or approved in this work.
- The implemented endpoint is a Surah metadata catalogue only.
- A metadata approval row and matching stored checksum fields do not establish immutable-artifact hash verification or scholarly authority.
- Before importing or publishing any religious content, verify exact source identity and edition, immutable artifact SHA-256, record coverage/order and exact-string preservation, attribution, redistribution and caching/offline permissions, independent human review, and an auditable approval decision.
- If any required check is absent or fails, keep the content unavailable. Never generate, reconstruct, normalize, repair, or substitute canonical religious text.

## 8. Integration exit criteria

1. Keep the implementation-aligned OpenAPI snapshot restricted to the routes actually registered on main.
2. Add OpenAPI parsing/validation and backend/frontend contract tests to CI once the spec path is wired into the workflow.
3. Keep editions, Ayahs, reciters, audio, authentication and user-library routes deferred until their schemas, authorization, source rights and tests exist.
4. Run PR #22 against a real disposable PostgreSQL service, including migration up/repeat-safety, readiness, and backend integration tests, before calling PostgreSQL production-ready.
5. Synchronize `integration/platform-foundation` with current main through a reviewed merge/update that resolves the duplicate documentation paths. Do not merge PR #1 in its current unsynchronized state.

## 9. Files inspected

Main-branch implementation and verification files:

- `package.json`, `backend/package.json`
- `backend/src/app.ts`, `backend/src/index.ts`
- `backend/src/routes/quran.ts`, `backend/src/services/quran-catalogue.ts`, `backend/src/services/validation.ts`, `backend/src/types/content.ts`
- `backend/src/db/connection.ts`, `backend/src/db/migrate.ts`
- `src/lib/content-api-client.ts`, `src/lib/content-api-response.ts`, `src/lib/content-api-errors.ts`, `src/lib/content-source.ts`, `src/lib/content-safety.ts`
- `.github/workflows/ci.yml`, `.github/workflows/web-foundation.yml`
- `backend/test/quran-api.test.ts`, `backend/test/production-startup.test.ts`, `src/lib/content-api-client.test.ts`

This document records remote repository evidence only. It does not claim that the documentation branch itself has been merged or that a production deployment is available.
