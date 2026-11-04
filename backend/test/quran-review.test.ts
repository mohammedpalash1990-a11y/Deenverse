import { createHash } from 'node:crypto';
import { strict as assert } from 'node:assert';
import { after, before, test } from 'node:test';
import { buildApp } from '../src/app.js';
import { createDatabaseConnection } from '../src/db/connection.js';
import { runMigrations } from '../src/db/migrate.js';

const db = createDatabaseConnection({ client: 'sqlite3', connection: { filename: ':memory:' }, useNullAsDefault: true });
const app = buildApp({ db, enableRateLimit: false });
const arabic = 'بِسْمِ اللَّهِ';
const digest = createHash('sha256').update(arabic, 'utf8').digest('hex');
const artifact = 'a'.repeat(64);
const sourceId = 'review-source';
const adminToken = 'test-review-admin-token-with-at-least-thirty-two-bytes';

before(async () => {
  process.env.QURAN_REVIEW_ADMIN_TOKEN = adminToken;
  process.env.PUBLIC_APP_URL = 'https://deenverse.example';
  await runMigrations(db);
  await db('content_sources').insert({
    id: sourceId, code: 'review-source', name: 'Review source', content_type: 'quran',
    edition: 'review-edition', source_url: 'https://example.org/quran', attribution: 'Source publisher',
    license_id: 'test-license', redistribution_allowed: false, reviewer: 'source curator',
    reviewed_at: '2026-11-04 00:00:00', checksum: artifact, is_active: false
  });
  await db('quran_surahs').insert({
    surah_number: 1, name_arabic: 'الفاتحة', name_simple: 'Al-Fatihah', name_english: 'The Opening',
    revelation_place: 'makkah', revelation_order: 5, verses_count: 7, source_id: sourceId
  });
  await db('quran_ayahs').insert({ surah_number: 1, ayah_number: 1, arabic, text_sha256: digest, source_id: sourceId });
});

after(async () => {
  await app.close();
  await db.destroy();
  delete process.env.QURAN_REVIEW_ADMIN_TOKEN;
  delete process.env.PUBLIC_APP_URL;
});

test('requires the configured administrator token to create review batches', async () => {
  const response = await app.inject({
    method: 'POST', url: '/api/v1/quran/review-batches',
    payload: { sourceId, surahNumber: 1, ayahNumber: 1, reviewers: ['A', 'B', 'C'], createdBy: 'Coordinator' }
  });
  assert.equal(response.statusCode, 401);
});

test('creates separate single-use links and records each reviewer decision', async () => {
  const created = await app.inject({
    method: 'POST', url: '/api/v1/quran/review-batches',
    headers: { 'x-review-admin-token': adminToken },
    payload: { sourceId, surahNumber: 1, ayahNumber: 1, reviewers: ['Reviewer One', 'Reviewer Two', 'Reviewer Three'], createdBy: 'Coordinator' }
  });
  assert.equal(created.statusCode, 201);
  const batch = created.json().data;
  assert.equal(batch.invites.length, 3);
  const inviteUrl = new URL(batch.invites[0].url as string);
  const token = inviteUrl.pathname.split('/').pop() as string;
  assert.ok(token);

  const spoofedName = await app.inject({
    method: 'POST', url: `/api/v1/quran/review/${token}`,
    payload: { reviewerName: 'Someone Else', decision: 'passed', textMatch: true, referenceMatch: true }
  });
  assert.equal(spoofedName.statusCode, 403);

  const opened = await app.inject({ method: 'GET', url: `/api/v1/quran/review/${token}` });
  assert.equal(opened.statusCode, 200);
  assert.equal(opened.json().data.arabic, arabic);
  assert.equal(opened.json().data.source.checksum, artifact);

  const submitted = await app.inject({
    method: 'POST', url: `/api/v1/quran/review/${token}`,
    payload: { reviewerName: 'Reviewer One', decision: 'passed', textMatch: true, referenceMatch: true }
  });
  assert.equal(submitted.statusCode, 201);

  const duplicate = await app.inject({
    method: 'POST', url: `/api/v1/quran/review/${token}`,
    payload: { reviewerName: 'Reviewer One', decision: 'passed', textMatch: true, referenceMatch: true }
  });
  assert.equal(duplicate.statusCode, 409);

  const status = await app.inject({
    method: 'GET', url: `/api/v1/quran/review-batches/${batch.batchId}`,
    headers: { 'x-review-admin-token': adminToken }
  });
  assert.equal(status.statusCode, 200);
  assert.equal(status.json().data.reviews.filter((item: { review_submitted_at: string | null }) => item.review_submitted_at).length, 1);
  assert.equal(status.json().data.allSubmitted, false);
});

test('rejects a passed decision without both exact-match checks', async () => {
  const created = await app.inject({
    method: 'POST', url: '/api/v1/quran/review-batches',
    headers: { 'x-review-admin-token': adminToken },
    payload: { sourceId, surahNumber: 1, ayahNumber: 1, reviewers: ['D', 'E', 'F'], createdBy: 'Coordinator' }
  });
  const inviteUrl = new URL(created.json().data.invites[0].url as string);
  const token = inviteUrl.pathname.split('/').pop() as string;
  const response = await app.inject({
    method: 'POST', url: `/api/v1/quran/review/${token}`,
    payload: { reviewerName: 'D', decision: 'passed', textMatch: true, referenceMatch: false }
  });
  assert.equal(response.statusCode, 400);
});
