import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/app.js';
import { createDatabaseConnection } from '../src/db/connection.js';
import * as initialSchema from '../src/db/migrations/20261102_000001_initial_schema.js';

test('Quran Catalogue API Integration', async (t) => {
  const db = createDatabaseConnection({ connection: ':memory:' });
  await initialSchema.up(db);
  const app = buildApp({ db, enableRateLimit: false, allowedOrigins: ['http://localhost:3000'] });

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
    assert.equal(body.status, 'ok');
    assert.ok(body.requestId.startsWith('req_'));
  });

  await t.test('Fails closed with 503 UNAVAILABLE when no approved source exists', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/quran/surahs'
    });

    assert.equal(res.statusCode, 503);
    const body = JSON.parse(res.body);
    assert.equal(body.error.code, 'UNAVAILABLE');
    assert.equal(body.error.retryable, false);
  });

  await t.test('Rejects invalid query pagination parameters with 400 INVALID_QUERY', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/quran/surahs?limit=500' // Exceeds max 50
    });

    assert.equal(res.statusCode, 400);
    const body = JSON.parse(res.body);
    assert.equal(body.error.code, 'INVALID_QUERY');
  });

  await t.test('Rejects a valid cursor whose next page offset would overflow', async () => {
    const cursor = Buffer.from(Number.MAX_SAFE_INTEGER.toString()).toString('base64');
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/quran/surahs?limit=50&cursor=${cursor}`
    });

    assert.equal(res.statusCode, 400);
    assert.equal(JSON.parse(res.body).error.code, 'INVALID_QUERY');
  });

  await t.test('Rejects tampered pagination cursor with 400 INVALID_QUERY', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/quran/surahs?cursor=invalid-cursor-value'
    });

    assert.equal(res.statusCode, 400);
    const body = JSON.parse(res.body);
    assert.equal(body.error.code, 'INVALID_QUERY');
  });

  await t.test('Fails closed if source is not approved (pending review)', async () => {
    await db('content_sources').insert({
      id: 'src-pending-synthetic',
      code: 'pending-test-v1',
      name: 'Unapproved Synthetic Test Source',
      content_type: 'quran',
      edition: '0.0.1-synthetic',
      source_url: 'https://example.com/test-corpus.txt',
      attribution: 'Synthetic Test Attribution Only',
      license_id: 'CC0-1.0',
      redistribution_allowed: true,
      approval_status: 'pending', // Pending approval!
      review_decision_id: 'decision-pending',
      approved_by_authority: 'Pending Authority',
      approved_at: '2026-11-01T00:00:00.000Z',
      artifact_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      is_active: true
    });

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/quran/surahs'
    });

    assert.equal(res.statusCode, 503);
    const body = JSON.parse(res.body);
    assert.equal(body.error.code, 'UNAVAILABLE');

    // Clean up
    await db('content_sources').where({ id: 'src-pending-synthetic' }).del();
  });

  await t.test('Fails closed on malformed approval timestamps without throwing', async () => {
    await db('content_sources').insert({
      id: 'src-invalid-approved-at',
      code: 'invalid-approved-at-v1',
      name: 'Invalid Approval Timestamp Test Source',
      content_type: 'quran',
      edition: '0.0.1-synthetic',
      source_url: 'https://example.invalid/invalid-date-metadata.txt',
      attribution: 'Synthetic Metadata for Automated Tests Only',
      license_id: 'CC0-1.0',
      redistribution_allowed: true,
      approval_status: 'approved',
      review_decision_id: 'test-invalid-date-decision',
      approved_by_authority: 'Automated Test Review Authority',
      approved_at: 'not-a-valid-date',
      artifact_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      is_active: true
    });

    const listResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/quran/surahs'
    });
    assert.equal(listResponse.statusCode, 503);
    assert.equal(JSON.parse(listResponse.body).error.code, 'UNAVAILABLE');

    const detailResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/quran/surahs/1'
    });
    assert.equal(detailResponse.statusCode, 503);
    assert.equal(JSON.parse(detailResponse.body).error.code, 'UNAVAILABLE');

    await db('content_sources').where({ id: 'src-invalid-approved-at' }).del();
  });

  await t.test('Serves catalogue metadata with correct envelope and provenance when configured with synthetic test fixture', async () => {
    // Insert synthetic test fixture with explicit non-authoritative identifiers
    await db('content_sources').insert({
      id: 'src-test-synthetic-corpus',
      code: 'synthetic-test-v1',
      name: 'Synthetic Test Catalogue Fixture (Non-authoritative)',
      content_type: 'quran',
      edition: '0.0.1-synthetic',
      source_url: 'https://example.com/synthetic-metadata.txt',
      attribution: 'Synthetic Metadata for Automated Tests Only',
      license_id: 'CC0-1.0',
      redistribution_allowed: true,
      approval_status: 'approved',
      review_decision_id: 'test-audit-decision-001',
      approved_by_authority: 'Automated Test Review Authority',
      approved_at: '2026-11-01T00:00:00.000Z',
      artifact_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      is_active: true
    });

    // Insert synthetic surah catalog records
    await db('quran_surahs').insert([
      {
        source_id: 'src-test-synthetic-corpus',
        surah_number: 1,
        name_arabic: 'الفاتحة',
        name_simple: 'Al-Fatihah',
        name_english: 'The Opener',
        revelation_place: 'makkah',
        revelation_order: 5,
        verses_count: 7
      },
      {
        source_id: 'src-test-synthetic-corpus',
        surah_number: 2,
        name_arabic: 'البقرة',
        name_simple: 'Al-Baqarah',
        name_english: 'The Cow',
        revelation_place: 'madinah',
        revelation_order: 87,
        verses_count: 286
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
    assert.equal(first.provenance.sourceId, 'src-test-synthetic-corpus');
    assert.equal(first.provenance.redistributionAllowed, true);
    assert.equal(first.provenance.approvalStatus, 'approved');
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
    assert.equal(body.data.length, 1);
    assert.equal(body.data[0].payload.surahNumber, 1);
  });

  await t.test('Strict Surah parsing: rejects malformed suffixes, decimals, leading zeros', async () => {
    // "1abc" suffix
    const resSuffix = await app.inject({
      method: 'GET',
      url: '/api/v1/quran/surahs/1abc'
    });
    assert.equal(resSuffix.statusCode, 400);
    assert.equal(JSON.parse(resSuffix.body).error.code, 'INVALID_QUERY');

    // "1.5" decimal
    const resDecimal = await app.inject({
      method: 'GET',
      url: '/api/v1/quran/surahs/1.5'
    });
    assert.equal(resDecimal.statusCode, 400);
    assert.equal(JSON.parse(resDecimal.body).error.code, 'INVALID_QUERY');

    // "0" or "01" leading zero
    const resZero = await app.inject({
      method: 'GET',
      url: '/api/v1/quran/surahs/01'
    });
    assert.equal(resZero.statusCode, 400);
    assert.equal(JSON.parse(resZero.body).error.code, 'INVALID_QUERY');

    // "999" out of range
    const resOutOfRange = await app.inject({
      method: 'GET',
      url: '/api/v1/quran/surahs/999'
    });
    assert.equal(resOutOfRange.statusCode, 400);
    assert.equal(JSON.parse(resOutOfRange.body).error.code, 'INVALID_QUERY');
  });

  await t.test('GET /api/v1/quran/surahs/50 returns 404 for unseeded surah', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/quran/surahs/50'
    });

    assert.equal(res.statusCode, 404);
    const body = JSON.parse(res.body);
    assert.equal(body.error.code, 'NOT_FOUND');
  });

  await t.test('Fails closed when multiple active approved Quran sources create edition ambiguity', async () => {
    await db('content_sources').insert({
      id: 'src-second-approved-synthetic',
      code: 'second-approved-synthetic-v1',
      name: 'Second Synthetic Approved Source (Non-authoritative)',
      content_type: 'quran',
      edition: '0.0.2-synthetic',
      source_url: 'https://example.invalid/second-synthetic-metadata.txt',
      attribution: 'Synthetic Metadata for Automated Tests Only',
      license_id: 'CC0-1.0',
      redistribution_allowed: true,
      approval_status: 'approved',
      review_decision_id: 'test-audit-decision-002',
      approved_by_authority: 'Automated Test Review Authority',
      approved_at: '2026-11-02T00:00:00.000Z',
      artifact_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      is_active: true
    });

    const listResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/quran/surahs'
    });
    assert.equal(listResponse.statusCode, 503);
    assert.equal(JSON.parse(listResponse.body).error.code, 'UNAVAILABLE');

    const detailResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/quran/surahs/1'
    });
    assert.equal(detailResponse.statusCode, 503);
    assert.equal(JSON.parse(detailResponse.body).error.code, 'UNAVAILABLE');
  });

});