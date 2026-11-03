import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/app.js';
import { createDatabaseConnection } from '../src/db/connection.js';
import * as initialSchema from '../src/db/migrations/20261102_000001_initial_schema.js';

test('Quran Catalogue API Integration', async (t) => {
  const db = createDatabaseConnection({ connection: ':memory:' });
  await initialSchema.up(db);
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

  await t.test('Serves verified Surah catalogue metadata with correct envelope and provenance when configured', async () => {
    // Insert approved source provenance
    await db('content_sources').insert({
      id: 'src-tanzil-uthmani',
      code: 'tanzil-uthmani-v1',
      name: 'Tanzil Project Verified Quran Metadata',
      content_type: 'quran',
      edition: '1.0.2',
      source_url: 'https://tanzil.net/pub/download/quran-uthmani.txt',
      attribution: 'Tanzil Project Verified Quran Metadata',
      license_id: 'CC-BY-3.0',
      redistribution_allowed: true,
      reviewer: 'Islamic Editorial Board',
      reviewed_at: '2026-11-01T00:00:00.000Z',
      checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      is_active: true
    });

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
        source_id: 'src-tanzil-uthmani'
      },
      {
        surah_number: 2,
        name_arabic: 'البقرة',
        name_simple: 'Al-Baqarah',
        name_english: 'The Cow',
        revelation_place: 'madinah',
        revelation_order: 87,
        verses_count: 286,
        source_id: 'src-tanzil-uthmani'
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
    assert.equal(first.provenance.sourceId, 'src-tanzil-uthmani');
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
    assert.equal(body.data.length, 1);
    assert.equal(body.data[0].payload.surahNumber, 1);
  });

  await t.test('GET /api/v1/quran/surahs/999 returns 400 for out-of-range surah', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/quran/surahs/999'
    });

    assert.equal(res.statusCode, 400);
    const body = JSON.parse(res.body);
    assert.equal(body.error.code, 'INVALID_QUERY');
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
});
