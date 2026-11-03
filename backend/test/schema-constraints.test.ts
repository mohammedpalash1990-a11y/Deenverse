import test from 'node:test';
import assert from 'node:assert/strict';
import { createDatabaseConnection } from '../src/db/connection.js';
import * as initialSchema from '../src/db/migrations/20261102_000001_initial_schema.js';

test('Schema Constraints and Coverage Validation', async (t) => {
  const db = createDatabaseConnection({ connection: ':memory:' });
  await initialSchema.up(db);

  t.after(async () => {
    await db.destroy();
  });

  await t.test('rejects out of range surah number (e.g. 0 or 115)', async () => {
    // Insert valid source
    await db('content_sources').insert({
      id: 'src-test',
      code: 'test-src',
      name: 'Test Source',
      content_type: 'quran',
      edition: '1.0',
      source_url: 'https://example.com',
      attribution: 'Attribution',
      license_id: 'MIT',
      redistribution_allowed: true,
      approval_status: 'approved',
      review_decision_id: 'rev-1',
      approved_by_authority: 'Auth',
      approved_at: new Date().toISOString(),
      artifact_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    });

    await assert.rejects(async () => {
      await db('quran_surahs').insert({
        source_id: 'src-test',
        surah_number: 0, // Invalid: must be >= 1
        name_arabic: 'الفاتحة',
        name_simple: 'Al-Fatihah',
        name_english: 'The Opener',
        revelation_place: 'makkah',
        revelation_order: 5,
        verses_count: 7
      });
    }, /CHECK constraint failed/);

    await assert.rejects(async () => {
      await db('quran_surahs').insert({
        source_id: 'src-test',
        surah_number: 115, // Invalid: must be <= 114
        name_arabic: 'الفاتحة',
        name_simple: 'Al-Fatihah',
        name_english: 'The Opener',
        revelation_place: 'makkah',
        revelation_order: 5,
        verses_count: 7
      });
    }, /CHECK constraint failed/);
  });

  await t.test('rejects invalid revelation place', async () => {
    await assert.rejects(async () => {
      await db('quran_surahs').insert({
        source_id: 'src-test',
        surah_number: 1,
        name_arabic: 'الفاتحة',
        name_simple: 'Al-Fatihah',
        name_english: 'The Opener',
        revelation_place: 'unknown_place', // Invalid!
        revelation_order: 5,
        verses_count: 7
      });
    }, /CHECK constraint failed/);
  });
});
