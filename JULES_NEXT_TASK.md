# Jules — Immediate execution checkpoint (do not treat assignment-only as progress)

Repository: https://github.com/mohammedpalash1990-a11y/Deenverse
Branch: `jules/backend-foundation`
Target: PR against `main`

## Verified status

The branch currently contains only the assignment file relative to its merge base. There is no reviewed backend implementation, schema, migration, API endpoint, or backend test suite yet. The branch is also behind `main`; synchronize it with the latest `main` before implementation. Do not overwrite or revert other contributors' work.

## Your next deliverable: first 10% backend milestone

Do not send another plan-only update. Implement and submit a small, reviewable vertical slice:

1. Read `docs/PHASE-1-MVP.md`, `docs/API-CONTRACT.md`, `docs/ARCHITECTURE.md`, `docs/CONTENT-INTEGRITY.md`, and the current frontend content boundary in `src/lib/content-source.ts` / `src/lib/content-api-response.ts`.
2. Add an ADR selecting and justifying the backend runtime/framework, database, migration tool, and test strategy. Explain how it supports web, Android, and iOS clients.
3. Add the initial database migration for Quran catalogue metadata and source provenance only (stable Surah identifier/order/name metadata references, source edition, source URL, attribution, license/redistribution permission, checksum, review state). Do not seed Quranic Arabic, translations, tafsir, Hadith, or dua text.
4. Implement a minimal versioned read-only endpoint for Surah catalogue metadata with typed pagination and the agreed stable error envelope. If no approved source exists, return an explicit empty/unavailable response; never invent records.
5. Add automated tests for pagination validation, invalid provenance rejection, empty/unavailable source behavior, and safe error mapping.
6. Add local setup and migration/test commands. Keep `.env.example` placeholders only.
7. Open/update a PR against `main` with changed-file summary, exact test commands/results, and known gaps.

## Contract and safety rules

- Preserve compatibility with the frontend ContentSource boundary. If you propose a contract change, document it and explain the migration; do not silently diverge from the existing contract.
- No authentication shortcuts, hardcoded secrets, fake religious content, or production credentials.
- Do not merge your PR.
- Do not report the milestone complete until code, migration, tests, and PR are visible in GitHub.
- If blocked, report the exact blocker, failing command, and relevant file/line—not a generic progress message.

## Definition of done for this milestone

A reviewer can clone the branch, follow the documented commands, run the backend tests, inspect the migration, and see a versioned Surah metadata endpoint that fails closed when no approved source is configured.
