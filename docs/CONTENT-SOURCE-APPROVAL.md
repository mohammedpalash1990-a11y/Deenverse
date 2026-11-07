# Content Source Approval Gate

## Purpose

A source record is descriptive metadata, not a publication decision. Quran catalogue endpoints must fail closed unless a separate approval record exists and is bound to the exact source artifact digest.

## Release eligibility enforced by the API

The catalogue service requires all of the following:

- The source is active and its content type is `quran`.
- Redistribution permission is explicitly true in the source record.
- A row exists in `content_source_approvals` for that source.
- The approval decision is exactly `approved`.
- `artifact_sha256` in the approval record exactly equals the source record's `checksum`.
- Approval reviewer and timestamp pass the API provenance validation.

The same gate is applied to collection and single-Surah reads. A source record without an approval row, a non-approved decision, or a digest mismatch is not served.

## Approval record fields

| Field | Meaning |
|---|---|
| `source_id` | One approval record per registered source |
| `decision` | Explicit release decision; only `approved` is served |
| `reviewer_id` | Account/identity reference for the human reviewer |
| `approved_at` | Timestamp of the release decision |
| `artifact_sha256` | SHA-256 digest reviewed for this decision |
| `review_notes` | Audit context for the decision |

## Operational restrictions

- Do not create approval rows for sample, synthetic, placeholder, or unverified source data.
- Do not treat a self-entered reviewer name, license label, URL, or checksum as proof of authenticity or redistribution rights.
- The equality check binds the approval record to the registered digest; it does **not** independently download or hash an external artifact.
- Before any production approval, an authorized human must obtain the exact source artifact, calculate its SHA-256 independently, verify edition/completeness and source attribution, confirm the applicable license and redistribution terms, and record the review decision through a controlled administrative process.
- The current backend does not expose a public approval endpoint. Approval writes must remain restricted to a trusted administrative process; never expose direct approval writes to public clients.
- Quran text must never be generated, normalized, repaired, or seeded by AI. The single-Ayah route is registered but the integration AppShell does not mount a reader that calls it; the public Quran section remains approval-pending. The route selector now excludes approvals whose reviewer is the same as the source reviewer or is `project-owner-chat-authorization`. The importer must independently retrieve the exact official artifact, validate its edition/metadata, recompute SHA-256, and require distinct human source and artifact reviewers before import. The API itself compares stored digest values and does not re-hash the immutable upstream artifact on each read. Both QuranEnc translation routes are unregistered until their own artifact, rights, digest, and independent approval evidence exists.

## Test fixtures

Automated tests use clearly labeled synthetic fixture records only. They do not approve Tanzil, Quran Foundation, or any production source and must never be copied into production.
