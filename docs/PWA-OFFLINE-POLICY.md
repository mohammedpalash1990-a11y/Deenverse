# PWA and offline boundary

## Included

- A production-only service-worker registration.
- A standalone web-app manifest and DEENVERSE SVG icon.
- A cached root application shell for offline launch after a successful first visit.
- Cache-first handling for same-origin Next.js immutable build assets and the public manifest/icon.
- Network-first handling for the root navigation, with the cached shell as an offline fallback.

## Strict exclusions

The service worker does not cache API routes, cross-origin requests, POST requests, authenticated responses, Quran/Hadith/dua text, translations, tafsir, recitation audio, user bookmarks, reading progress, or other user data. Requests under `/api/` bypass service-worker caching entirely.

The offline root is only the app shell. A source-backed reader must separately enforce its own source, edition, licensing, and review gates before displaying religious content. A cached shell is not permission to cache a religious corpus.

## Release checks

- Verify installation and offline root launch on supported mobile browsers.
- Confirm `/api/*` responses are never written to Cache Storage.
- Confirm a new deployment removes the previous named shell cache.
- Recheck that no future route or asset caching rule captures protected content.
