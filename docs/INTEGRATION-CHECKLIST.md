# DEENVERSE Integration Checklist

Owner: integration/platform-foundation. Check an item only after verifying the relevant PR, implementation, or retained test evidence.

## Phase 1 API contract alignment
- [ ] Jules acknowledges or revises `docs/API-CONTRACT.md` and `docs/OPENAPI-DRAFT.yaml`.
- [ ] Queen acknowledges or revises the same contract based on actual screen/data requirements.
- [ ] REST/JSON vs alternative transport decision is recorded in an ADR.
- [ ] Edition, Surah, ayah, and reciter field names/types are agreed.
- [ ] Validation status convention (400 vs 422), request ID propagation, and error mapping are agreed.
- [ ] OpenAPI draft is validated with a declared tool/version in CI after the stack/toolchain is selected.
- [ ] Contract changes are versioned and communicated in both workstream PRs.

## Branch and PR readiness
- [ ] Jules branch is synchronized with current `main`; conflicts are resolved on the Jules branch.
- [ ] Queen branch is synchronized with current `main`; conflicts are resolved on the Queen branch.
- [ ] Integration branch is reviewed against current `main`; no blind merge or force-push.
- [ ] Each implementation PR lists changed files, stack/ADR, exact commands, actual test results, screenshots/API examples, and known gaps.
- [ ] No feature branch is merged solely on an agent completion claim.

## Phase 1 frontend/backend integration
- [ ] Frontend uses typed API adapters rather than scattered hard-coded URLs.
- [ ] Development mocks are separate from production adapters and visibly labeled.
- [ ] App shell navigation and Quran catalogue work with approved data or explicit empty/error states.
- [ ] Reader renders Arabic-first RTL without clipping or focus-order defects.
- [ ] Translation selector is tied to an explicit approved edition; it does not silently switch editions.
- [ ] Audio UI does not claim playback without a configured licensed stream and successful playback.
- [ ] Bookmark UI does not claim cloud sync before authenticated, user-scoped persistence exists.
- [ ] Authentication/session lifecycle is consistent before private endpoints are enabled.
- [ ] User bookmarks and progress are scoped to the authenticated user on the server.

## Content integrity and licensing
- [ ] Every enabled content edition has source publisher/provider, edition/version, language, attribution, license, retrieval date, and immutable checksum/snapshot.
- [ ] Redistribution rights are explicit for public display.
- [ ] Caching/offline rights are separately verified; public display permission does not imply caching permission.
- [ ] Audio stream, download, and CDN permissions are separately verified.
- [ ] Quran Arabic integrity checks compare imported records to the approved source snapshot.
- [ ] No fabricated Quran, translation, tafsir, Hadith, dua, or reciter data is present.
- [ ] Content approval is recorded separately from software test status.

## Verification and release gate
- [ ] Main branch builds from a clean checkout using documented lockfile-based commands.
- [ ] Lint, typecheck, unit, integration, and critical end-to-end tests pass where configured.
- [ ] OpenAPI/schema validation passes using the exact tool/version recorded in CI.
- [ ] Quran text integrity tests pass against approved source snapshots.
- [ ] Accessibility, keyboard, screen-reader, responsive, and RTL checks pass.
- [ ] No secrets, private keys, service-account files, or production data are committed.
- [ ] Release notes distinguish implemented features, unavailable content, and known limitations.

## Merge policy
Do not merge a PR solely because an agent reports completion. Review changed files, inspect test evidence, verify CI, resolve branch conflicts, and confirm content/security requirements first. A green software build is not evidence of religious-content authenticity or licensing permission.
