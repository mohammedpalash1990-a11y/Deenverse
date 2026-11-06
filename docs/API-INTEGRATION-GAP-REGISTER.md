# DEENVERSE API Integration Gap Register

**Status:** engineering audit; proposed decisions, not an accepted cross-team contract.
**Scope:** compare `docs/API-CONTRACT.md` on `integration/platform-foundation` with the backend implementation visible on `assistant/source-approval-gate` (stacked PR #7 → #8 → #9 → #10).
**Purpose:** prevent frontend/backend integration from silently binding to incompatible routes or response shapes.

## Executive result

The backend has a working *catalogue metadata* route shape in source, but it does not yet implement the full Quran read surface described by the draft API contract. Frontend integration should remain behind an adapter boundary until the contract is explicitly accepted by both workstreams.

No Quran text, ayah payload, translation, Hadith, tafsir, dua, or audio content is introduced by this audit.

## 1. Route-level comparison

| Capability | Draft contract | Backend source observed | Status |
|---|---|---|---|
| Health | Not listed in canonical Quran read surface | `GET /api/v1/health` | Implemented, response is a health-specific object |
| Surah catalogue | `GET /api/v1/quran/surahs` | Same route; limit/cursor pagination | Partial match |
| One Surah's ayahs | `GET /api/v1/quran/surahs/{surahNumber}/ayahs?editionId=...` | No ayah route observed | Not implemented |
| Surah metadata detail | Not separately specified | `GET /api/v1/quran/surahs/{surahNumber}` | Extra route; returns one metadata record wrapped in a one-element array |
| Edition catalogue | `GET /api/v1/quran/editions` | No route observed | Not implemented |
| Reciter catalogue | `GET /api/v1/audio/reciters` | No route observed | Not implemented |

**Integration rule:** do not point an ayah reader at the Surah metadata detail route. They are different resources and must not be treated as interchangeable.

## 2. Response and error-contract mismatches

| Concern | Draft contract | Backend source observed | Required resolution |
|---|---|---|---|
| Success envelope | `{ data, meta: { requestId } }` | Catalogue routes use `{ data, meta: { requestId, nextCursor? } }` | Compatible for list; confirm detail semantics |
| Error envelope | `{ error: { code, message, details, requestId } }` | `{ error: { code, message, retryable } }` | Standardize fields and preserve request ID |
| Invalid input code | `VALIDATION_ERROR` | `INVALID_QUERY` | Select one canonical code |
| Approved content unavailable | `CONTENT_UNAVAILABLE` | `UNAVAILABLE` with HTTP 503 | Select one canonical code |
| Missing Surah | `NOT_FOUND` | `NOT_FOUND` with HTTP 404 | Code aligns; envelope still differs |
| Rate limit | `RATE_LIMITED` | `RATE_LIMITED` | Code aligns; envelope still differs |
| Health | Not defined in draft envelope | `{ status, timestamp, requestId }` | Document as an explicit health exception or wrap consistently |

Do not make the client infer an error category from message text. Use stable codes and HTTP status.

## 3. Edition identity is a release-critical gap

The draft ayah route requires an explicit `editionId`. The observed backend Surah catalogue service selects an approved Quran source internally and returns Surah metadata; it does not expose an edition selector and does not return ayah text.

Before an ayah endpoint is implemented, agree on:
- stable, immutable edition ID in every request and response;
- explicit Arabic script/edition identity (for example, Uthmani versus IndoPak) without silent substitution;
- source/version/checksum provenance returned with the content;
- exact source-string preservation and fail-closed behavior on missing or mismatched content;
- pagination/order guarantees at ayah level;
- whether a source may be displayed, cached, downloaded, or redistributed under its specific license.

A source approval row or matching stored checksum fields alone is not proof that the underlying artifact was independently hashed, that the reviewer is authorized, or that the requested distribution mode is licensed.

## 4. Proposed integration decisions

These are recommendations for Jules + Queen review; they are not silently applied to either implementation.

1. Keep `GET /api/v1/quran/surahs` as the public Surah metadata catalogue.
2. Keep `GET /api/v1/quran/surahs/{surahNumber}` as a metadata detail resource, but change its payload to a single object (not a one-element array) or document the array convention consistently.
3. Add the ayah route only after edition identity and content-release checks are implemented:
   `GET /api/v1/quran/editions/{editionId}/surahs/{surahNumber}/ayahs`
   This path makes edition selection explicit and avoids ambiguous implicit edition selection. If the team prefers the existing draft query form, record that decision and apply it consistently.
4. Define a shared error schema with `code`, safe `message`, `requestId`, and optional structured `details`. Keep retryability either as a documented optional field or derive it from status; do not let it vary by route.
5. Use a typed frontend API adapter. UI components must not construct URLs, parse backend-specific errors, or consume demo fixtures directly.
6. Keep demo/mock adapters separate and visibly labelled. Empty/unavailable catalogue states must not synthesize scripture or imply that an edition is approved.
7. Do not expose editions, ayahs, audio, bookmarks, or synced progress as available until their corresponding backend capability and authorization/content gates exist.

## 5. Minimum contract-test matrix before wiring the reader

| ID | Request / condition | Expected client behavior |
|---|---|---|
| API-001 | Surah catalogue returns empty `data` | Render a truthful empty state; no fixture scripture |
| API-002 | Catalogue returns a next cursor | Request next page through the adapter; preserve query context |
| API-003 | Invalid cursor / malformed Surah number | Map stable validation code to a safe validation state |
| API-004 | 503 content unavailable | Show unavailable state; never generated or alternate text |
| API-005 | Source approval/checksum mismatch | No Quran record is rendered |
| API-006 | Unknown edition ID | Explicit not-found/validation response; never silently choose another edition |
| API-007 | Ayah route not implemented | Feature remains unavailable; do not call metadata detail route as fallback |
| API-008 | 429 rate limit | Show retry guidance without losing selected Surah/edition |
| API-009 | 5xx with internal details in server exception | Client sees only safe public message and request ID |
| API-010 | Response has missing or unexpected fields | Adapter rejects/contains malformed response; no partial scripture rendering |

## 6. Ownership and acceptance checklist

- [ ] Jules confirms route inventory, response/error schema, edition identity, and implementation sequence.
- [ ] Queen confirms frontend adapter needs and UI state mapping (loading, empty, unavailable, validation, rate-limited, server error).
- [ ] Both workstreams agree on the canonical contract revision.
- [ ] OpenAPI document is updated to match the accepted routes and schemas.
- [ ] Backend contract tests cover success and negative cases.
- [ ] Frontend adapter tests cover the same fixtures and error codes.
- [ ] CI validates OpenAPI and runs both contract suites.
- [ ] No Quran corpus is enabled until independent source, artifact, and rights approval is complete.

## Evidence and limitations

This is a static source comparison of the draft contract and the backend files on the stated branches. It is not a live API test, browser test, build, or CI result. The audit did not inspect a deployed backend or claim that any unobserved route is impossible; “not observed” means it was absent from the inspected route registration and service files.

Relevant source files:
- `docs/API-CONTRACT.md` on `integration/platform-foundation`
- `backend/src/routes/quran.ts`
- `backend/src/services/quran-catalogue.ts`
- `backend/src/app.ts`
