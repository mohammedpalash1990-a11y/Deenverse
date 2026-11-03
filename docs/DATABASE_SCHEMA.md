# DEENVERSE — Database Schema Documentation

## Database Strategy

- **Current supported runtime and migrations**: SQLite for local development and CI.
- **PostgreSQL**: planned for a later production increment; connection setup, driver dependency, and migration verification are not yet complete.
- **Migration Engine**: Knex.js with explicit additive migration modules.

## Initial Phase 1 Schema

### 1. `content_sources` (Provenance Register)

Stores source metadata for imported Islamic content. Source metadata alone does not authorize publication; a separate approval record is required.

| Column | Type | Description |
|---|---|---|
| `id` | VARCHAR PRIMARY KEY | Unique source identifier |
| `code` | VARCHAR UNIQUE | Internal machine code |
| `name` | VARCHAR | Human-readable source name |
| `content_type` | VARCHAR(30) | Type (`quran`, `translation`, `tafsir`, `hadith`, `dua`, `audio`) |
| `edition` | VARCHAR | Version or edition identifier |
| `source_url` | TEXT | Official HTTPS source URL |
| `attribution` | VARCHAR | Required attribution text |
| `license_id` | VARCHAR | SPDX or custom license identifier |
| `redistribution_allowed` | BOOLEAN | Must be true for the requested public distribution mode |
| `reviewer` | VARCHAR | Source metadata reviewer |
| `reviewed_at` | TIMESTAMP | Source review timestamp |
| `checksum` | VARCHAR | Recorded SHA-256 value |
| `is_active` | BOOLEAN | Source active flag |
| `created_at` | TIMESTAMP | Record creation date |

### 2. `quran_surahs` (Catalogue Metadata Only)

Stores Surah catalogue metadata only. It does not contain Quranic Arabic text.

| Column | Type | Description |
|---|---|---|
| `surah_number` | INTEGER PRIMARY KEY | Chapter number (1–114) |
| `name_arabic` | VARCHAR | Surah name in Arabic |
| `name_simple` | VARCHAR | Transliterated name |
| `name_english` | VARCHAR | English meaning |
| `revelation_place` | VARCHAR | `makkah` or `madinah` |
| `revelation_order` | INTEGER | Revelation order |
| `verses_count` | INTEGER | Number of verses |
| `source_id` | VARCHAR FK | References `content_sources.id` |

### 3. `content_source_approvals` (Explicit Publication Gate)

Added by the additive `20261103_000002_source_approval_gate` migration so existing base-schema databases can be upgraded without recreating their tables.

| Column | Type | Description |
|---|---|---|
| `id` | VARCHAR PRIMARY KEY | Approval record identifier |
| `source_id` | VARCHAR UNIQUE FK | References `content_sources.id`; one current approval record per source |
| `decision` | VARCHAR(20) | Release decision; only `approved` is eligible |
| `reviewer_id` | VARCHAR | Reviewer identity recorded by the trusted approval process |
| `approved_at` | TIMESTAMP | Approval timestamp |
| `artifact_sha256` | VARCHAR(64) | SHA-256 recorded for the reviewed artifact |
| `review_notes` | TEXT | Human review notes and audit context |

**Important limitation:** matching `artifact_sha256` values in these two tables only compares stored values. It does not independently retrieve or hash source bytes, authenticate reviewer authority, prove scholarly authenticity, or establish licensing rights. Those checks remain separate release requirements. No production Quran text is stored in this schema.
