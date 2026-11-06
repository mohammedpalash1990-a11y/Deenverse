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
const sourceId = 'verified-quran-source';

before(async () => {
  await runMigrations(db);
  await db('content_sources').insert({
    id: sourceId,
    code: 'verified-quran',
    name: 'Verified Quran source',
    content_type: 'quran',
    edition: 'test-edition',
    source_url: 'https://example.org/quran',
    attribution: 'Test fixture only',
    license_id: 'test-license',
    redistribution_allowed: true,
    reviewer: 'test-source-reviewer',
    reviewed_at: '2026-11-04 00:00:00',
    checksum: 'a'.repeat(64),
    is_active: true
  });
  await db('content_source_approvals').insert({
    id: 'approval-1',
    source_id: sourceId,
    decision: 'approved',
    reviewer_id: 'test-artifact-reviewer',
    approved_at: '2026-11-04 00:00:00',
    artifact_sha256: 'a'.repeat(64),
    review_notes: 'Automated test fixture'
  });
  await db('quran_surahs').insert({
    surah_number: 1,
    name_arabic: 'الفاتحة',
    name_simple: 'Al-Fatihah',
    name_english: 'The Opening',
    revelation_place: 'makkah',
    revelation_order: 5,
    verses_count: 7,
    source_id: sourceId
  });
  await db('quran_ayahs').insert({
    surah_number: 1,
    ayah_number: 1,
    arabic,
    text_sha256: digest,
    source_id: sourceId
  });
});

after(async () => {
  await app.close();
  await db.destroy();
});

test('returns an ayah only from an approved source with matching text digest', async () => {
  const response = await app.inject({ method: 'GET', url: '/api/v1/ayah/1/1' });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().data.id, 'quran:ayah:1:1');
  assert.equal(response.json().data.payload.textArabic, arabic);
  assert.equal(response.json().data.payload.surahNumber, 1);
  assert.equal(response.json().data.payload.ayahNumber, 1);
  assert.equal(response.json().data.provenance.approvalStatus, 'approved');
  assert.equal(response.json().data.provenance.approvedByAuthority, 'test-artifact-reviewer');
  assert.equal(response.json().data.provenance.redistributionAllowed, true);
  assert.equal(response.json().data.provenance.sourceId, sourceId);
});

test('fails closed when source and artifact approval use the same reviewer', async () => {
  await db('content_source_approvals').where({ id: 'approval-1' }).update({ reviewer_id: 'test-source-reviewer' });
  const response = await app.inject({ method: 'GET', url: '/api/v1/ayah/1/1' });
  assert.equal(response.statusCode, 503);
  assert.equal(response.json().error.code, 'CONTENT_UNAVAILABLE');
  await db('content_source_approvals').where({ id: 'approval-1' }).update({ reviewer_id: 'test-artifact-reviewer' });
});

test('rejects the project-owner chat authorization identity as an artifact approver', async () => {
  await db('content_source_approvals').where({ id: 'approval-1' }).update({ reviewer_id: 'project-owner-chat-authorization' });
  const response = await app.inject({ method: 'GET', url: '/api/v1/ayah/1/1' });
  assert.equal(response.statusCode, 503);
  assert.equal(response.json().error.code, 'CONTENT_UNAVAILABLE');
  await db('content_source_approvals').where({ id: 'approval-1' }).update({ reviewer_id: 'test-artifact-reviewer' });
});

test('rejects non-canonical or invalid ayah parameters', async () => {
  for (const url of ['/api/v1/ayah/01/1', '/api/v1/ayah/1/0', '/api/v1/ayah/115/1', '/api/v1/ayah/1/1x']) {
    const response = await app.inject({ method: 'GET', url });
    assert.equal(response.statusCode, 400, url);
  }
});

test('does not return an ayah outside the verified surah count', async () => {
  const response = await app.inject({ method: 'GET', url: '/api/v1/ayah/1/8' });
  assert.equal(response.statusCode, 404);
});

test('fails closed when the stored ayah digest does not match its text', async () => {
  await db('quran_ayahs').where({ source_id: sourceId, surah_number: 1, ayah_number: 1 }).update({ text_sha256: 'b'.repeat(64) });
  const response = await app.inject({ method: 'GET', url: '/api/v1/ayah/1/1' });
  assert.equal(response.statusCode, 502);
});


test('fails closed when multiple active approved Quran editions exist', async () => {
  await db('content_sources').insert({
    id: 'second-approved-quran-source',
    code: 'second-approved-quran-source',
    name: 'Second synthetic Quran source',
    content_type: 'quran',
    edition: 'second-test-edition',
    source_url: 'https://example.org/second-quran-source',
    attribution: 'Synthetic test fixture only',
    license_id: 'test-license',
    redistribution_allowed: true,
    reviewer: 'second-source-reviewer',
    reviewed_at: '2026-11-04 00:00:00',
    checksum: 'b'.repeat(64),
    is_active: true
  });
  await db('content_source_approvals').insert({
    id: 'approval-second-quran-source',
    source_id: 'second-approved-quran-source',
    decision: 'approved',
    reviewer_id: 'second-artifact-reviewer',
    approved_at: '2026-11-04 00:00:00',
    artifact_sha256: 'b'.repeat(64),
    review_notes: 'Synthetic ambiguity regression fixture only'
  });

  const response = await app.inject({ method: 'GET', url: '/api/v1/ayah/1/1' });
  assert.equal(response.statusCode, 503);
  assert.equal(response.json().error.code, 'CONTENT_UNAVAILABLE');

  await db('content_source_approvals').where({ id: 'approval-second-quran-source' }).delete();
  await db('content_sources').where({ id: 'second-approved-quran-source' }).delete();
});
