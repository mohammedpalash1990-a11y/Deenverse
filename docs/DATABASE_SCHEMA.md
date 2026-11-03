# DEENVERSE — Database Schema Documentation

## Database Strategy

- **Local Development & CI Testing**: SQLite (`:memory:` or local file).
- **Staging & Production**: PostgreSQL (managed cluster, configured via `DATABASE_URL`).
- **Migration Engine**: Knex.js (`npm run migrate`).

## Phase 1 Catalogue Schema

### 1. `content_sources` (Provenance & Approval Gate)
Stores verified provenance for every imported Islamic content corpus. Content cannot be served without an active, approved record in this table (`approval_status = 'approved'`, `redistribution_allowed = true`).

| Column | Type | Description |
|---|---|---|
| `id` | VARCHAR PRIMARY KEY | Unique source slug (e.g. `src-tanzil-uthmani`) |
| `code` | VARCHAR UNIQUE | Internal machine code |
| `name` | VARCHAR | Full human-readable name of the source |
| `content_type` | VARCHAR(30) | Type (`quran`, `translation`, `tafsir`, `hadith`, `dua`, `audio`) |
| `edition` | VARCHAR | Version or edition identifier |
| `source_url` | TEXT | Official HTTPS URL for provenance tracking |
| `attribution` | VARCHAR | Required attribution text |
| `license_id` | VARCHAR | SPDX or custom license identifier |
| `redistribution_allowed`| BOOLEAN | Must be `true` for content to be served |
| `approval_status` | VARCHAR(20) | Multi-stage status: `'pending'`, `'rejected'`, `'approved'` |
| `review_decision_id` | VARCHAR | Audit log decision reference |
| `approved_by_authority` | VARCHAR | Formal approving scholarly/editorial authority |
| `approved_at` | TIMESTAMP | ISO timestamp of the review approval |
| `artifact_sha256` | VARCHAR(64) | 64-character lowercase hexadecimal SHA-256 digest |
| `is_active` | BOOLEAN | Soft disable toggle |
| `created_at` | TIMESTAMP | Record creation date |

### 2. `quran_surahs` (Catalogue Metadata Only)
Non-fabricated catalogue metadata for the 114 Surahs. Does not contain Quranic Arabic text (which will be ingested via the approved verified ingestion pipeline in Phase 1 MVP).

| Column | Type | Description |
|---|---|---|
| `source_id` | VARCHAR FK | References `content_sources.id` (part of composite PK) |
| `surah_number` | INTEGER | Chapter number (1-114, part of composite PK) |
| `name_arabic` | VARCHAR | Chapter name in Arabic |
| `name_simple` | VARCHAR | Transliterated name (e.g. `Al-Fatihah`) |
| `name_english` | VARCHAR | English meaning (e.g. `The Opener`) |
| `revelation_place` | VARCHAR(10) | `makkah` or `madinah` |
| `revelation_order` | INTEGER | Chronological order |
| `verses_count` | INTEGER | Number of verses |

**Primary Key**: `PRIMARY KEY (source_id, surah_number)` to support multiple editions without conflicts.
