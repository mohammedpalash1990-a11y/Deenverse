# Release-safety reconciliation — 2026-11-06

## Decision

**Do not merge or deploy yet.** The integration branch now has a fail-closed Quran UI, disabled public QuranEnc translation routes, an OpenAPI snapshot aligned to the registered routes, and passing exact-head CI. These changes are still isolated to `integration/platform-foundation`; main has not received them. Religious-content approval and production operations remain release blockers.

## Exact repository state

- Main: `f098d650a9cbc5aaaaadee6a925e68dfa9dbdb9a`.
- Integration implementation head at evidence capture: `dc251bcc38dff3b7d0d975e31959a255e606960f`.
- Compare at that checkpoint: 107 commits ahead / 0 behind main.
- PR #1: open, unmerged, mergeable; no submitted reviews or inline review threads were present at inspection. Do not merge automatically.
- No files were written to main, `jules/backend-foundation`, or `queen/frontend-foundation`.

## Integration changes and contract

1. The backend registers 10 GET operations: health, readiness, two Quran catalogue reads, one source-gated Ayah read, and five Hadith reads.
2. Both public QuranEnc Bengali translation routes are unregistered. The expected response for both paths is HTTP 404 with the canonical `NOT_FOUND` envelope.
3. QuranEnc-specific OpenAPI response schemas and the inactive Quran translation tag were removed. The OpenAPI snapshot now describes the 10 registered GET operations only.
4. The mounted Quran section is an approval-pending placeholder. Regression tests assert that it makes no fetch request and renders no audio element.
5. The unverified `data/quran/tanzil/quran-uthmani.txt` file is absent from the integration tree. Browser CSP does not allow `raw.githubusercontent.com`.
6. Quran source selection fails closed unless exactly one active, redistribution-permitted source has a matching approval digest, a distinct source/artifact reviewer, and no `project-owner-chat-authorization` reviewer identity.
7. The API contract now explicitly states that the read path compares stored digest strings; it does not download and independently re-hash the upstream artifact. Pagination cursors remain unsigned offsets and are not bound to edition/filter/search context.

The single-Ayah API route remains registered for future use, but the production source/artifact and independent per-Ayah review evidence are not complete. The route must remain unavailable when the source gate has no uniquely eligible source. No corpus was imported or activated.

## Exact CI evidence

The latest verified integration head `dc251bcc38dff3b7d0d975e31959a255e606960f` was checked through PR #1's merge ref with main `f098d650a9cbc5aaaaadee6a925e68dfa9dbdb9a`:

| Workflow | Run | Result |
|---|---:|---|
| DEENVERSE CI | [#42224958000](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/42224958000) | PASS |
| Web foundation | [#42224958140](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/42224958140) | PASS |
| OpenAPI contract validation | [#42224958031](https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/42224958031) | PASS |

Backend evidence: typecheck, 86/86 tests, PostgreSQL 16 migrations/runtime, production SQLite startup guard, production build, and `npm audit --audit-level=high` with 0 vulnerabilities.

Web evidence: typecheck, 18 test files / 174 tests, production build, and high-severity dependency audit with 0 vulnerabilities.

OpenAPI evidence: OpenAPI 3.1 YAML parsing, unique mapping keys, local-reference resolution, and backend route parity; 10 paths / 10 operations.

### Failures found and corrected in this run

- At earlier head `9146c6925e94b2dcda89f0182ab6994a1af9190a`, one source-approval test fixture used the same synthetic reviewer for source review and artifact approval. The runtime correctly rejected it with 503; the test incorrectly expected 200. Commit `073fb540a5dbf3583249f828383b1f9c9ab4d142` changed only the synthetic approval reviewer to a distinct test identity. The later backend run passed 86/86.
- The first OpenAPI checksum-description edit produced invalid YAML at line 489. Commit `dc251bcc38dff3b7d0d975e31959a255e606960f` restored the quoted SHA-256 pattern and placed the integrity limitation in the correct schema property. OpenAPI validation #42224958031 then passed.

## Mainline candidate and conflicting PR review

### PR #75 — fail-closed release candidate

- Branch: `qa/release-safety-2026-11-05`.
- Current head: `33ad1020bde7c91c0a42239ebf915198c830362c`.
- State: open, draft, unmerged.
- Its functional safety changes were tested on predecessor `773378d82e0396358aecd6cb6a148b48ae2cfbfa`: DEENVERSE CI #42075029048 and Web foundation #42075029010 passed; backend 80/80, web 171/171, both audits 0 vulnerabilities.
- The current head is a documentation-only commit and has no separate workflow run. Keep it draft; no merge or deployment was performed.

### PR #69 — public-beta raw-file fallback

- Branch: `codex/quran-public-beta-reader`.
- State: open, mergeable=false.
- It reintroduces a browser fetch from `raw.githubusercontent.com` when the approved API returns `CONTENT_UNAVAILABLE`, re-allows that host in CSP, and displays the fetched text as public beta.
- A hard-coded SHA-256 comparison proves byte equality only; it does not prove publisher acquisition, independent review, or redistribution rights.
- Blocking review findings and the integration review were recorded in PR conversation comment #6685706745. Do not merge or deploy this branch.

## Jules / Queen branch review

- `jules/backend-foundation`: head `f84e35c242ab37ccafca0528a1d06e0d4b244834`; 3 commits ahead / 69 behind main. Its branch-specific diff contains only `AGENT_TASK.md` and `JULES_NEXT_TASK.md`; no completed backend implementation is present.
- `queen/frontend-foundation`: head `9ef788c81de85e9ebfa139b35c42d606c38f2010`; 2 commits ahead / 69 behind main. Its branch-specific diff contains only `AGENT_TASK.md`; no completed frontend implementation is present.
- No implementation work is attributed to either agent. Neither branch was modified.

## Release blockers

1. Independently acquire the exact immutable Quran publisher artifact, recompute SHA-256, and record the exact edition, retrieval date, publisher URL, and preserved license notice.
2. Obtain qualified independent source approval and enforce the per-Ayah human-review gate before any Arabic text is served. PR #43 is still unmerged and non-mergeable; PR #45 remains stacked on it and is not integrated.
3. Review QuranEnc's terms for the exact intended web/mobile/hosting/caching/offline/export uses before enabling Bengali translation.
4. Approve Hadith collection/edition, grading provenance, translation rights, tafsir and dua sources, and audio recording ownership/streaming/offline rights separately.
5. Implement and review authentication, authorization, session lifecycle, and cross-user isolation before protected personal data or admin writes.
6. Verify hosted PostgreSQL connection, least privilege, migrations, readiness, backup/restore, rollback, and production secret configuration.
7. Complete deployed CORS/CSP network smoke tests and manual RTL, keyboard, screen-reader, responsive, and device QA.

No Quran Arabic, Hadith, translation, tafsir, dua, or audio content was fabricated, rewritten, imported, or activated in this work. No secrets or production data were committed.

## Files changed in this integration run

- `backend/test/source-approval-integrity.test.ts`
- `docs/OPENAPI-DRAFT.yaml`
- `docs/API-CONTRACT.md`
- `docs/RELEASE-SAFETY-RECONCILIATION.md`

