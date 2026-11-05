# Release-safety reconciliation — 2026-11-05

## Decision

**Do not merge or deploy from this integration branch yet.** PR #75 is the current mainline release-safety candidate. It is open as a draft and its recorded exact-head CI passed. The integration branch's earlier API and UI work must be reconciled with that candidate before either PR can be treated as releasable.

## Repository evidence

- Main at inspection: `f098d650a9cbc5aaaaadee6a925e68dfa9dbdb9a`.
- `integration/platform-foundation` compares 82 commits ahead / 0 behind main.
- PR #1 remains open and unmerged. Its API contract and OpenAPI snapshot predate PR #75 and still describe the QuranEnc translation routes as registered.
- PR #75 changes 11 files and disables those public translation routes, removes the unverified Quran text copy, removes the raw-GitHub Quran reader/audio references from the mounted public UI, and removes `raw.githubusercontent.com` from `connect-src`.
- PR #75's latest reported head in the release-readiness record is `7c19026d8c15d6bb7b4654fa6a4ae70a5f50b61d`; its exact-head CI run 42071843318 and Web foundation run 42071843376 passed.
- PR #75 has no submitted review and no inline review threads at inspection. It remains a draft; no merge or deployment was performed.

## Integration compatibility findings

1. The integration app shell's API-gated single-Ayah reader is safer than the old raw-file reader, but it is not sufficient evidence of source approval. The current production database has no Quran Ayah/Surah rows.
2. The current source approval row is not valid independent approval: both reviewer identities are `project-owner-chat-authorization`. The guarded importer rejects this identity.
3. The production database contains zero Quran corpus rows and zero Hadith rows. No approved tafsir, dua, or audio corpus is recorded.
4. QuranEnc translation routes must be considered unavailable until exact edition bytes, publisher terms for the intended web/mobile/caching/offline/export uses, and independent review are recorded. PR #75 expects 404/NOT_FOUND for both public translation paths.
5. EveryAyah and Audiomack references in the legacy component do not establish recording ownership or redistribution/streaming rights. Audio remains disabled.
6. The existing OpenAPI contract must be regenerated/reconciled against the route registry after PR #75's route removal. Do not leave the disabled translation endpoints represented as active operations.
7. The source-selector's stored digest-string equality is not equivalent to downloading and hashing an immutable official artifact. Do not describe it as cryptographic verification.

## Agent branch status

The repository branch search confirms that `jules/backend-foundation` and `queen/frontend-foundation` exist. The previously recorded comparisons show Jules' branch contains assignment/handoff documents rather than a completed backend feature, and Queen's branch contains its assignment document rather than a completed frontend feature. Do not attribute PR #75 or the integration work to either agent without matching author/commit evidence. Do not write to either branch.

## Required next steps

1. Review PR #75 as the security baseline; retain draft status until human review is complete.
2. Reconcile PR #1's OpenAPI snapshot and route-parity workflow with the disabled translation routes in PR #75.
3. Add regression tests proving both QuranEnc routes return 404 and the public Quran reader emits no raw-GitHub request or unlicensed audio element.
4. Re-run backend, web, production build, dependency audit, PostgreSQL runtime/migration, and OpenAPI route parity on the exact reconciled integration head.
5. Resolve PR #1 and PR #75's changed-file overlap before combining them. Never force-push or overwrite either branch.
6. Keep religious corpora unavailable until exact immutable artifacts, independently recomputed digests, source-specific redistribution terms, and independent qualified human approval are recorded.
7. Treat hosted PostgreSQL least-privilege/network protection, branch protection, deployed CORS/CSP verification, and manual browser/RTL/accessibility QA as release blockers.

## Exact changed files in this documentation-only reconciliation

- `docs/API-CONTRACT.md`
- `docs/RELEASE-SAFETY-RECONCILIATION.md`

No application code, religious content, database data, or secrets were changed.
