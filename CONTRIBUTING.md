# Contributing to DEENVERSE

## Branching
- `main` is the protected integration target.
- Backend work: `jules/backend-foundation`.
- Frontend work: `queen/frontend-foundation`.
- Cross-cutting integration: `integration/platform-foundation`.
- Do not push feature work directly to `main`; open a focused pull request.

## Before coding
1. Read `README.md` and all relevant files in `docs/`.
2. Check whether another contributor owns the same files or API surface.
3. Agree on API contracts before coupling frontend and backend implementations.
4. Record material stack and architecture decisions.

## Pull requests
Every PR must include:
- Purpose and scope
- Files/features changed
- Exact test commands and actual results
- Screenshots for UI changes
- Accessibility and RTL notes where applicable
- Security/content provenance impact
- Known limitations and follow-up work

## Content and licensing
Never fabricate Quran, Hadith, translation, tafsir, dua, grading, or recitation data. Use placeholders until a verified source and redistribution permission are documented. Never commit secrets or private user data.

## Quality bar
Prefer small reviewable changes, deterministic tests, accessible interactions, explicit error states, and reproducible setup instructions. Do not mark roadmap items complete without implementation evidence.
