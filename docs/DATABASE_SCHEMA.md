# DEENVERSE — Database Schema Documentation

## Database Strategy

- **Local Development & CI Testing**: SQLite (`:memory:` or local file).
- **Staging & Production**: PostgreSQL (managed cluster).
- **Migration Engine**: Knex.js.

## Initial Phase 1 Schema

### 1. `content_sources` (Provenance & Release Gate)
Stores verified provenance for every imported Islamic content corpus. Content cannot be served without an active, approved record in this table.

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
| `reviewer` | VARCHAR | Human reviewer identity/group |
| `reviewed_at` | TIMESTAMP | ISO timestamp of the review approval |
| `checksum` | VARCHAR | Cryptographic checksum (SHA-256) |
| `is_active` | BOOLEAN | Soft disable toggle |
| `created_at` | TIMESTAMP | Record creation date |

### 2. `quran_surahs` (Catalogue Metadata Only)
Non-fabricated catalogue metadata for the 114 Surahs. Does not contain Quranic Arabic text (which will be ingested via the approved verified ingestion pipeline in Phase 1 MVP).

| Column | Type | Description |
|---|---|---|
| `surah_number` | INTEGER PRIMARY KEY | Chapter number (1-114) |
| `name_arabic` | VARCHAR | Chapter name in Arabic |
| `name_simple` | VARCHAR | Transliterated name (e.g. `Al-Fatihah`) |
| `name_english` | VARCHAR | English meaning (e.g. `The Opener`) |
| `revelation_place` | VARCHAR | `makkah` or `madinah` |
| `revelation_order` | INTEGER | Chronological order |
| `verses_count` | INTEGER | Number of verses |
| `source_id` | VARCHAR FK | References `content_sources.id` |
