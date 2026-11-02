# DEENVERSE API Contract — Draft 0.1

Status: proposal for Jules/Queen review. This is not an implemented API.

## Contract principles
- Version public APIs from the beginning (suggested prefix: `/api/v1`).
- Use JSON over HTTPS; validate request and response schemas.
- Return stable machine-readable error codes and safe human-readable messages.
- Use cursor pagination for potentially large collections.
- Enforce authorization on the server for every private resource.
- Never expose secrets or private provider credentials to clients.
- Treat religious content as versioned, sourced records, not free-form generated text.

## Proposed response envelope

Success:
```json
{
  "data": {},
  "meta": {
    "requestId": "opaque-request-id"
  }
}
```

Error:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request is invalid.",
    "details": [],
    "requestId": "opaque-request-id"
  }
}
```

Do not expose stack traces, SQL, tokens, or internal provider errors.

## Initial resource families

| Resource | Purpose | Access |
|---|---|---|
| `/quran/surahs` | Surah catalogue and metadata | Public |
| `/quran/ayahs` | Verified ayah records by edition and surah | Public |
| `/translations` | Approved translation editions | Public |
| `/tafsirs` | Approved tafsir editions | Public |
| `/audio/reciters` | Licensed reciter catalogue | Public |
| `/audio/streams` | Playback URLs where permitted | Public/auth as required |
| `/hadith/collections` | Collection metadata | Public |
| `/hadith/narrations` | Sourced narration records | Public |
| `/duas` | Dua and adhkar records with references | Public |
| `/me/bookmarks` | User bookmarks | Authenticated |
| `/me/progress` | Reading progress | Authenticated |
| `/admin/content` | Controlled content review | Admin role |

## Content record provenance

Every religious content record should carry, as applicable:
- stable internal ID
- content type and language
- source publisher/provider and source URL or identifier
- edition/version and retrieval date
- attribution/copyright notice
- license identifier and redistribution permission status
- review status and reviewer/audit reference
- source checksum or immutable snapshot reference

Quran Arabic text must retain exact source text and edition metadata. Never silently normalize, rewrite, or reconstruct it.

## User library
Bookmarks and reading progress must be scoped to the authenticated user. Use idempotent writes where retries are possible. Do not trust a client-supplied user ID as authorization.

## Open decisions for Jules + Queen
1. REST vs typed RPC.
2. Authentication provider and session model.
3. Database choice and migration tooling.
4. Audio URL expiry and offline entitlement behavior.
5. Search indexing strategy and supported languages.
6. Admin roles and approval workflow.

Resolve these in a short ADR before coupling implementations.
