# DEENVERSE delivery audit — 2026-11-04

## Scope and evidence boundary

Audit baseline: `26b0ec1` (PR #57), branch `arena/8a8af2b3-deenverse`.
No Marketplace code, databases, or deployment was touched. No deployment or
unreviewed content approval was performed. No Quran text was replaced.

Inspected remote branch inventory, recent merged/open PRs, and open coordination
issues. PR #23 is merged (PostgreSQL CI/runtime tests), #27 is closed (superseded
Ayah client integration), and #28 is merged (API origin configuration). Existing
mainline contains later reader/API integration; do not reapply #27 wholesale.
PR #58 became merged during this audit; its Tanzil footer fix is not part of this
branch's baseline. Open review/content/reporting PRs are not blindly merged.

## This delivery (Arena)

- Exempt liveness/readiness from public request quotas, while preserving limits
  on content routes. Regression verifies probes after a client's quota is spent.
- Gracefully close HTTP and database resources on SIGTERM/SIGINT, with a ten-second
  shutdown deadline and subprocess tests for both signals.
- Commit the frontend dependency lockfile; use `npm ci` in both frontend CI
  workflows. Existing backend lockfile/dependency versions remain unchanged.
- Document lifecycle behavior and ignore generated TypeScript compiler caches.

## Verification performed locally

- Backend: typecheck and production build pass; **78 tests pass, 1 skipped**.
- Skipped test: live PostgreSQL migration/production runtime test; no PostgreSQL
  service or `TEST_DATABASE_URL` was available here. It remains configured in CI.
- Frontend: typecheck and Next.js production build pass; **124 tests pass** across
  15 files. This is not a manual mobile, browser-audio, or screen-reader audit.
- `npm audit --json`: zero reported vulnerabilities in each dependency graph
  (including critical/high). This does not establish absence of application-level
  vulnerabilities or future advisories. No new dependency upgrades were needed.
- Backend installation initially hit a blocked Node header download. Installation
  succeeded using existing local headers: `npm ci --nodedir=/usr/local`.

## Existing features and remaining release gates

| Area | Inspected implementation | Still unverified or remaining |
| --- | --- | --- |
| Quran Arabic | Source-gated Ayah API, Tanzil importer, exact-text/digest checks, RTL reader | Live corpus import, approved source record, complete corpus/source and human review evidence; #58 integration |
| Translation | Pinned QuranEnc Bengali edition; Ayah/full-Surah APIs and reader | Live provider availability, content/legal review, wider translations |
| Navigation | Quran catalogue and Surah/Ayah reader controls | End-to-end tests with approved production corpus |
| Hadith | Source-gated schema, APIs, search, references, reader | Verified/licensed populated collections and translations; editorial review |
| Audio | Playback intentionally disabled | Approved recording/source/license, playback implementation, navigation and device tests |
| Dua/Adhkar | Product/navigation foundation | Approved sourced library and functional reader |
| Learning/Hifz | Product foundation only | Learning content, practice tools, and acceptance tests |
| Responsive UI | Existing app shell, RTL and accessibility component tests | Manual device, keyboard and assistive-technology QA |
| Authentication | Environment placeholders | No completed auth/session/database integration established by this audit; protect future write/admin routes without restricting public readers |
| PostgreSQL | pg driver, DATABASE_URL/DB_CLIENT resolver, additive migrations, production SQLite rejection, readiness, CI service test | This PR's exact-head CI and hosted production connection/migrations, backup/restore validation |
| Deployment | Frontend and backend builds succeed | Hosted credentials, release migration, readiness smoke test, security review, content approvals, rollback/backup rehearsal |

Source gates and provenance metadata are safeguards, not independent proof of
upstream authenticity or redistribution permission. Do not publish unreviewed
scripture, translation, Hadith, or audio to make an empty reader appear complete.

## Contributor attribution and coordination

- **Queen:** merged PR #16 explicitly credits six focused frontend accessibility
  contributions: skip link, focusable landmark, navigation announcements, mobile
  dismissal/focus restoration, catalogue announcements and component tests.
  Issues #4/#25 remain open; do not claim completion of all frontend work.
- **Jules:** backend implementation branches and issues #3/#26 exist. Mainline
  PR #18 integrates the reviewed backend foundation, followed by PostgreSQL and
  security integration PRs. Individual authorship of every backend change has
  not been independently established here; do not label all backend work as
  Jules' completed delivery solely from branch names or assignment.
- **Arena:** only changes listed under “This delivery” are claimed as new work.
- **ChatGPT:** independent technical review still needed; no external reviewer
  approval is asserted.

Coordination follow-ups: Jules/backend owner should validate hosted PostgreSQL,
auth design and content ingestion. Queen/frontend owner should validate approved
corpus UX, mobile/RTL/accessibility and future licensed audio behavior. Existing
contributions and content remain intact.

## Completion percentage

**No defensible overall verified percentage yet.** The twelve product requirements
have neither weighted acceptance criteria nor complete live-content/end-to-end
verification. Passing tests and existing scaffolding are not feature completion.
Local executed tests: **202/202 pass (100%); one PostgreSQL test skipped**. That
percentage measures only executed tests, not product readiness. Deployment remains
blocked by the gates above; no production-ready claim is made.


## Continued implementation after initial delivery

- Initial PR #59 head passed all three CI checks, including PostgreSQL-backed
  migrations/runtime. The updated head must pass again before merge.
- Migration CLI now wraps additive DDL in one transaction and serializes
  PostgreSQL release jobs with a transaction-scoped advisory lock. Synthetic
  failure tests verify rollback without deleting pre-existing tables or rows.
- Partial Hadith schemas are explicitly rejected even if hadith_books exists.
- Readiness and migration completion share required-table/column validation;
  merely creating tables with missing runtime columns cannot report ready.
  This is not a full type/constraint/schema-drift audit.
- The browser translation client now requires the backend-pinned V1.1.1 edition,
  nonempty request identity/text and retained footnotes. 28 direct client tests
  cover provenance tampering, coordinate mismatches, origin configuration,
  malformed responses and exact-string preservation using synthetic content.
- PostgreSQL CI runtime coverage now also exercises concurrent migrations and
  rollback/lock release after a late migration failure.

- Commit `8b6d9f3` passed all three PR checks, including the PostgreSQL 16
  service job with concurrent-migration and rollback coverage. Evidence:
  https://github.com/mohammedpalash1990-a11y/Deenverse/actions/runs/41776821674
  This verifies CI PostgreSQL, not the hosted production database. Raw Actions
  log download was blocked by this workspace network; check status was obtained
  through GitHub CLI.
- Added three reader-level translation tests: exact text/footnotes and publisher
  links, translation failure without hiding verified Arabic, and no translation
  fetch after Arabic integrity rejection. Translation dependency injection makes
  these component tests deterministic without fetching an external publisher.
- Removed a visible literal backslash-n between translation attribution links.
