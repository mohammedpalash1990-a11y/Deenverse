# DEENVERSE — API Contract v1 (Backend & Frontend Boundary)

## Overview

All responses adhere to the standard REST envelope specified in `docs/CONTENT-API-RESPONSE-PARSING.md` and `docs/CONTENT-API-ERROR-MAPPING.md`.

## Response Envelopes

### Success Envelope (Paginated)
```json
{
  "meta": {
    "requestId": "req_01h7abc...",
    "nextCursor": "eyJwYWdlIjoyfQ=="
  },
  "data": [
    {
      "id": "quran:surah:1",
      "type": "quran",
      "title": "Al-Fatihah",
      "locale": "ar",
      "provenance": {
        "contentType": "quran",
        "sourceId": "src-quran-tanzil-uthmani",
        "edition": "1.0.2",
        "sourceUrl": "https://tanzil.net/pub/download/quran-uthmani.txt",
        "attribution": "Tanzil Project Verified Quran Metadata",
        "licenseId": "CC-BY-3.0",
        "redistributionAllowed": true,
        "reviewer": "Islamic Editorial Board",
        "reviewedAt": "2026-11-01T00:00:00.000Z",
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

### Error Envelope
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found",
    "retryable": false
  }
}
```

Standard Error Codes:
- `UNAVAILABLE`: Service or verified source not configured/available.
- `INVALID_QUERY`: Query parameters or payload failed validation.
- `INTEGRITY_REJECTED`: Content failed provenance or verification review.
- `NOT_FOUND`: Requested entity does not exist.
- `RATE_LIMITED`: Too many requests (retryable: true).
- `INTERNAL_ERROR`: Internal server failure.
