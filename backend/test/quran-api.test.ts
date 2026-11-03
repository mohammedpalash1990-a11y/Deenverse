import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/app.js';
import { createDatabaseConnection } from '../src/db/connection.js';
import * as initialSchema from '../src/db/migrations/20261102_000001_initial_schema.js';
import * as sourceApprovalGate from '../src/db/migrations/20261103_000002_source_approval_gate.js';
import { ContentProvenanceSchema } from '../src/services/validation.js';


test('Content provenance requires a SHA-256 checksum in hexadecimal format', () => {
  const validProvenance = {
    contentType: 'quran',
    sourceId: 'src-test-fixture',
    edition: 'synthetic-test-fixture',
    sourceUrl: 'https://example.org/synthetic-test-fixture',
    attribution: 'Synthetic test fixture only',
    licenseId: 'TEST-FIXTURE-NOT-A-LICENSE',
    redistributionAllowed: true,
    reviewer: 'test-reviewer',
    reviewedAt: '2026-11-01T00:00:00.000Z',
    checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  };

  assert.equal(ContentProvenanceSchema.safeParse(validProvenance).success, true);
  assert.equal(ContentProvenanceSchema.safeParse({ ...validProvenance, checksum: '' }).success, false);
  assert.equal(ContentProvenanceSchema.safeParse({ ...validProvenance, checksum: 'not-a-hash' }).success, false);
  assert.equal(ContentProvenanceSchema.safeParse({ ...validProvenance, checksum: 'g'.repeat(64) }).success, false);
  assert.equal(ContentProvenanceSchema.safeParse({ ...validProvenance, checksum: 'a'.repeat(63) }).success, false);
});

test('Quran Catalogue API Integration', async (t) => {
  const db = createDatabaseConnection({ connection: ':memory:' });
  await initialSchema.up(db);
  await sourceApprovalGate.up(db);
  const app = buildApp({ db, enableRateLimit: false });

  t.after(async () => {
    await app.close();
    await db.destroy();
  });

  await t.test('GET /api/v1/health returns 200 with request identifier', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/health'
    });

    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.status, 'healthy');
    assert.ok(body.requestId.startsWith('req_'));
  });

  await t.test('Unknown routes return the canonical NOT_FOUND envelope', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/does-not-exist'
    });

    assert.equal(res.statusCode, 404);
    const body = JSON.parse(res.body);
    assert.equal(body.error.code, 'NOT_FOUND');
    assert.ok(body.error.requestId.startsWith('req_'));
    assert.deepEqual(body.error.details, []);
    assert.equal(body.error.retryable, false);
  });

  await t.test('Fails closed with 503 UNAVAILABLE when no approved source exists', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/quran/surahs'
    });

    assert.equal(res.statusCode, 503);
    const body = JSON.parse(res.body);
    assert.equal(body.error.code, 'CONTENT_UNAVAILABLE');
    assert.ok(body.error.requestId.startsWith('req_'));
    assert.deepEqual(body.error.details, []);
    assert.equal(body.error.retryable, false);
  });

  await t.test('Rejects invalid query pagination parameters with 400 INVALID_QUERY', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/quran/surahs?limit=500' // Exceeds max 50
    });

    assert.equal(res.statusCode, 400);
    const body = JSON.parse(res.body);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.ok(body.error.requestId.startsWith('req_'));
  });

  await t.test('Serves verified Surah catalogue metadata with correct envelope and provenance when configured', async () => {
    // Insert approved source provenance
    await db('content_sources').insert({
      id: 'src-test-fixture',
      code: 'synthetic-test-fixture',
      name: 'Synthetic test fixture — not a production source',
      content_type: 'quran',
      edition: 'synthetic-fixture-only',
      source_url: 'https://example.org/synthetic-test-fixture',
      attribution: 'Synthetic test fixture only; not approved for production',
      license_id: 'TEST-FIXTURE-NOT-A-LICENSE',
      redistribution_allowed: true,
      reviewer: 'Islamic Editorial Board',
      reviewed_at: '2026-11-01T00:00:00.000Z',
      checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      is_active: true
    });

    const unapprovedRes = await app.inject({
      method: 'GET',
      url: '/api/v1/quran/surahs'
    });
    assert.equal(unapprovedRes.statusCode, 503, 'source metadata alone must never grant publication access');
    const unapprovedSingleRes = await app.inject({
      method: 'GET',
      url: '/api/v1/quran/surahs/1'
    });
    assert.equal(unapprovedSingleRes.statusCode, 503, 'single-Surah reads must use the same approval gate');

    // Test-only approval fixture. This does not approve or identify any production Quran source.
    await db('content_source_approvals').insert({
      id: 'approval-test-fixture',
      source_id: 'src-test-fixture',
      decision: 'approved',
      reviewer_id: 'test-reviewer',
      approved_at: '2026-11-01T00:00:00.000Z',
      artifact_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      review_notes: 'Automated test fixture only; never use as a real source approval.'
    });

    await db('content_source_approvals')
      .where({ id: 'approval-test-fixture' })
      .update({ artifact_sha256: '0'.repeat(64) });
    const checksumMismatchRes = await app.inject({
      method: 'GET',
      url: '/api/v1/quran/surahs'
    });
    assert.equal(checksumMismatchRes.statusCode, 503, 'approval for a different artifact must not publish this source');
    await db('content_source_approvals')
      .where({ id: 'approval-test-fixture' })
      .update({ artifact_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' });

    await db('content_source_approvals')
      .where({ id: 'approval-test-fixture' })
      .update({ decision: 'rejected' });
    const rejectedApprovalRes = await app.inject({
      method: 'GET',
      url: '/api/v1/quran/surahs'
    });
    assert.equal(rejectedApprovalRes.statusCode, 503, 'a rejected source approval must never publish the catalogue');
    await db('content_source_approvals')
      .where({ id: 'approval-test-fixture' })
      .update({ decision: 'approved' });

    await db('content_sources')
      .where({ id: 'src-test-fixture' })
      .update({ source_url: 'http://example.org/synthetic-test-fixture' });
    const invalidProvenanceRes = await app.inject({
      method: 'GET',
      url: '/api/v1/quran/surahs'
    });
    assert.equal(invalidProvenanceRes.statusCode, 503, 'invalid non-HTTPS provenance must fail closed');
    await db('content_sources')
      .where({ id: 'src-test-fixture' })
      .update({ source_url: 'https://example.org/synthetic-test-fixture' });

    // Insert surah catalog metadata (Surah 1 Al-Fatihah, Surah 2 Al-Baqarah)
    await db('quran_surahs').insert([
      {
        surah_number: 1,
        name_arabic: 'الفاتحة',
        name_simple: 'Al-Fatihah',
        name_english: 'The Opener',
        revelation_place: 'makkah',
        revelation_order: 5,
        verses_count: 7,
        source_id: 'src-test-fixture'
      },
      {
        surah_number: 2,
        name_arabic: 'البقرة',
        name_simple: 'Al-Baqarah',
        name_english: 'The Cow',
        revelation_place: 'madinah',
        revelation_order: 87,
        verses_count: 286,
        source_id: 'src-test-fixture'
      }
    ]);

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/quran/surahs?limit=1'
    });

    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);

    // Validate REST Envelope format per docs/CONTENT-API-RESPONSE-PARSING.md
    assert.ok(body.meta);
    assert.ok(body.meta.requestId.startsWith('req_'));
    assert.ok(body.meta.nextCursor); // Cursor for page 2
    assert.equal(Array.isArray(body.data), true);
    assert.equal(body.data.length, 1);

    const first = body.data[0];
    assert.equal(first.id, 'quran:surah:1');
    assert.equal(first.type, 'quran');
    assert.equal(first.title, 'Al-Fatihah');
    assert.equal(first.locale, 'ar');
    assert.equal(first.provenance.sourceId, 'src-test-fixture');
    assert.equal(first.provenance.redistributionAllowed, true);
    assert.equal(first.provenance.checksum, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    assert.equal(first.payload.surahNumber, 1);
    assert.equal(first.payload.nameArabic, 'الفاتحة');
    assert.equal(first.payload.versesCount, 7);

    // Fetch page 2 using cursor
    const resPage2 = await app.inject({
      method: 'GET',
      url: `/api/v1/quran/surahs?limit=1&cursor=${body.meta.nextCursor}`
    });

    assert.equal(resPage2.statusCode, 200);
    const bodyPage2 = JSON.parse(resPage2.body);
    assert.equal(bodyPage2.data.length, 1);
    assert.equal(bodyPage2.data[0].id, 'quran:surah:2');
    assert.equal(bodyPage2.meta.nextCursor, null); // Reached end of records
  });

  await t.test('GET /api/v1/quran/surahs/1 returns specific surah', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/quran/surahs/1'
    });

    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.data.payload.surahNumber, 1);
    assert.ok(body.meta.requestId.startsWith('req_'));
  });

  await t.test('GET /api/v1/quran/surahs/999 returns 400 for out-of-range surah', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/quran/surahs/999'
    });

    assert.equal(res.statusCode, 400);
    const body = JSON.parse(res.body);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.ok(body.error.requestId.startsWith('req_'));
  });

  await t.test('GET /api/v1/quran/surahs/50 returns 404 for unseeded surah', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/quran/surahs/50'
    });

    assert.equal(res.statusCode, 404);
    const body = JSON.parse(res.body);
    assert.equal(body.error.code, 'NOT_FOUND');
    assert.ok(body.error.requestId.startsWith('req_'));
    assert.deepEqual(body.error.details, []);
  });
});
