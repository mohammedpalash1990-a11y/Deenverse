# Quran Ayah Team Review — Operator Guide

## Purpose

The review workspace creates a separate, expiring invitation for each of 3–5 named reviewers to inspect one exact Ayah from one registered source edition. It records each person's name, independent decision, text-match check, reference/boundary check, and notes. It does not edit Quran text.

## Required server configuration

Set these backend environment variables before creating review batches:

- `QURAN_REVIEW_ADMIN_TOKEN`: a unique random secret with at least 32 bytes of entropy. Keep it private; never put it in frontend source code or commit it.
- `PUBLIC_APP_URL`: the public Deenverse web origin, used to build invitation URLs (for example, `https://deenverse.example`).

If the administrator token is absent, batch creation and status access fail closed. The coordinator enters the secret in the review page; it is sent only in the HTTPS request header. It is not persisted by the page.

## Workflow

1. Register the exact Quran source edition and its artifact SHA-256 in `content_sources`.
2. Import the exact Ayah bytes without normalization and store their SHA-256 in `quran_ayahs`.
3. Open `/quran/review`, enter the source ID, Surah/Ayah coordinates, coordinator name, and 3–5 distinct reviewer names.
4. Send each reviewer only their own generated link. Each link is a random, single-use bearer credential; the database stores only its SHA-256 hash. Links expire after 14 days.
5. Reviewers open their link, compare the Arabic letters, diacritics, source reference and verse boundaries against the linked source, and submit their own decision.
6. The coordinator checks the batch status through the authenticated review API.

## Integrity and limitations

- An invitation is bound to the exact source ID, Surah/Ayah coordinates and source artifact checksum.
- The reviewer page re-checks the source checksum and stored Ayah text digest before showing the text.
- A submitted invitation cannot be submitted again.
- A positive decision requires both exact-text and reference/boundary checks.
- Failed and uncertain decisions remain visible as separate records; they are not overwritten by other reviewers.
- The review batch is an evidence-collection workflow only. It does not automatically approve the Quran source, alter the existing per-Ayah publication gate, or mark an Ayah as verified.
- A qualified human authority must assess the full review evidence and record the required primary/independent publication approval separately.
- Never use an AI-generated correction or majority vote to change Quran text.

## API

- `POST /api/v1/quran/review-batches` — create 3–5 invites; requires `X-Review-Admin-Token`.
- `GET /api/v1/quran/review/:token` — open an individual invite.
- `POST /api/v1/quran/review/:token` — submit one review.
- `GET /api/v1/quran/review-batches/:batchId` — inspect team submissions; requires `X-Review-Admin-Token`.

Do not share the administrator token. Treat each invitation URL as a private credential and send it only to the named reviewer.
