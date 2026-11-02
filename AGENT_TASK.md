# Jules Assignment — Backend Foundation

Repository: https://github.com/mohammedpalash1990-a11y/Deenverse
Work branch: jules/backend-foundation
Target base: main
Submit a PR; do not merge it yourself.

## Mission
Own backend architecture discovery and the first secure, testable backend foundation for DEENVERSE. This is a fresh repository: first propose the stack and justify it before adding substantial framework code. Coordinate API contracts with Queen through documented interfaces.

## Required work
1. Inspect the current repository docs before coding.
2. Propose a maintainable stack for Web, Android, and iOS clients; explain trade-offs. Do not assume a stack is already selected.
3. Define initial domain model and migrations for users, Quran catalogue metadata, content editions/provenance, bookmarks, reading progress, audio metadata, hadith/dua catalogue metadata, and admin audit records. Do not invent Quran/hadith corpus content.
4. Define versioned API contracts, validation, error format, pagination, auth/session strategy, role/permission model, and rate limits.
5. Implement a minimal runnable backend skeleton only after documenting the stack decision.
6. Add automated tests for core validation, authorization, and data integrity; provide exact commands and results.
7. Add .env.example containing placeholders only. Never add real secrets, credentials, private keys, or production data.
8. Document local setup, migrations, tests, architecture decisions, and API contracts.

## Content integrity
- Never generate, paraphrase, repair, or modify Quranic Arabic.
- Do not import religious corpora until source authenticity, edition, attribution, and licensing/redistribution rights are verified.
- Preserve source provenance and version/checksum metadata.
- AI Hifz/Tajweed is practice assistance, never authoritative correction or fatwa.

## Collaboration
- Coordinate API shapes with queen/frontend-foundation.
- Do not modify Queen's frontend scope or commit to main.
- Keep commits small and descriptive.
- Open a PR against main with changed-file summary, tests run, known gaps, and evidence.

## Acceptance criteria
- Reproducible local setup
- Documented architecture and API contracts
- Secure baseline and no committed secrets
- Migrations/schema and meaningful automated tests
- No fabricated source data or unsupported completion claims
- PR ready for review with evidence
