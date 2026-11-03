# DEENVERSE — API Contract v1 (Backend & Frontend Boundary)

> **IMPORTANT DISCLAIMER**: All sample JSON bodies, URLs, names, and checksums in this documentation are **Synthetic / Illustrative Examples Only — Non-authoritative**. No religious texts, Hadith, or Quranic Arabic are generated or certified here. In production, only independently reviewed, verified, and checksum-validated corpora from approved authorities are published.

---

## 1. Universal Response Envelopes

Every DEENVERSE API endpoint returns either a structured Success Envelope or a structured Error Envelope.

### 1.1 Paginated Success Envelope
```json
{
  "meta": {
    "requestId": "req_01h7abc1234567890abcdef123456789",
    "nextCursor": "NDU="
  },
  "data": [
    {
      "id": "quran:surah:1",
      "type": "quran",
      "title": "Al-Fatihah",
      "locale": "ar",
      "provenance": {
        "contentType": "quran",
        "sourceId": "src-tanzil-uthmani",
        "edition": "1.0.2",
        "sourceUrl": "https://example.com/verified/corpus.txt",
        "attribution": "Sample Verified Provenance Attribution",
        "licenseId": "CC-BY-3.0",
        "redistributionAllowed": true,
        "approvalStatus": "approved",
        "reviewDecisionId": "rev-decision-202611-001",
        "approvedByAuthority": "Islamic Content Review Committee",
        "approvedAt": "2026-11-01T00:00:00.000Z",
        "checksum": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      },
      "payload": {
        "surahNumber": 1,
        "nameArabic": "الفاتحة",
        "nameSimple": "Al-Fatihah",
        "nameEnglish": "The Opener",
        "revelationPlace": "makkah",
        "revelationOrder": 5,
        "versesCount": 7
      }
    }
  ]
}
```

### 1.2 Error Envelope
```json
{
  "error": {
    "code": "INVALID_QUERY",
    "message": "Surah number must be a positive integer without leading zeroes or alphabetic characters.",
    "retryable": false
  }
}
```

---

## 2. Standard Error Codes

Aligned directly with the frontend error mapper (`src/lib/content-api-errors.ts`):
- `UNAVAILABLE`: Service or verified source not configured or not approved (HTTP 503).
- `INVALID_QUERY`: Query parameters, invalid cursor, or route params failed validation (HTTP 400).
- `FORBIDDEN`: Cross-origin request or permission denied (HTTP 403).
- `NOT_FOUND`: Requested entity does not exist (HTTP 404).
- `RATE_LIMITED`: Too many requests; client should back off and retry (HTTP 429, retryable: true).
- `INTEGRITY_REJECTED`: Content failed provenance or verification review (HTTP 422).
- `INTERNAL_ERROR`: Internal server failure (HTTP 500, retryable: true).

---

## 3. Endpoints in Initial Slice

### `GET /api/v1/health`
Returns system health, server timestamp, and unique `requestId`.

### `GET /api/v1/quran/surahs`
- Query params:
  - `limit` (integer, min 1, max 50, default 20)
  - `cursor` (opaque base64 string, offset-based)
- Fail-closed behavior: Returns HTTP 503 `UNAVAILABLE` if no approved source exists in the database.

### `GET /api/v1/quran/surahs/:surahNumber`
- Path param: `surahNumber` (strict positive integer between 1 and 114).
- Rejects non-integers, suffixes (e.g. `1abc`), decimals, and leading zeros with HTTP 400 `INVALID_QUERY`.
