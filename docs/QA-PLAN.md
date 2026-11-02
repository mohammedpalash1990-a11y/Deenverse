# DEENVERSE QA Plan

Status: initial test strategy; no test suite is claimed to exist yet.

## Release gates

### Quran text integrity
- Compare imported Arabic text against the exact approved source edition.
- Validate surah/ayah counts, identifiers, ordering, diacritics, and script rendering.
- Verify no AI-generated or hand-reconstructed Quran Arabic enters production data.
- Test right-to-left display, punctuation, line wrapping, font fallback, and copy behavior.

### Hadith, translation, tafsir, and dua provenance
- Verify every record has a traceable source and edition.
- Verify attribution and redistribution permission before publication.
- Ensure grading and scholarly attribution are not inferred by application logic.
- Distinguish translations and explanations from original Arabic source text.

### Frontend
- Test navigation, search, bookmarks, reading progress, audio controls, and all visible actions.
- Test mobile, tablet, desktop breakpoints.
- Test keyboard-only navigation, focus visibility, screen-reader labels, contrast, and reduced motion.
- Test Arabic RTL and mixed Arabic/Latin layouts.
- Test loading, empty, error, offline, and retry states.

### Backend
- Test schema validation, authentication, authorization, rate limits, pagination, and safe errors.
- Test user data isolation across accounts.
- Test replay/concurrency behavior for OTP/session-sensitive flows if implemented.
- Test migration up/down or documented recovery behavior.
- Test backup and restore before production.

### Security and privacy
- Scan repository history and working changes for secrets.
- Verify no service credentials or production user data are committed.
- Review dependency vulnerabilities and security headers.
- Verify account deletion, data export, retention, and consent behavior.

## Evidence required in every PR
- Exact commands executed
- Pass/fail counts and relevant logs
- Screenshots or recordings for visual changes
- Devices/browsers and viewport sizes
- Known gaps and untested paths

## Definition of release candidate
All critical gates pass, source licensing is reviewed, no critical/high security issues remain unresolved, and product claims match implemented behavior.
