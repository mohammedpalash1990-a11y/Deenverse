import test from 'node:test';
import assert from 'node:assert/strict';
import { createDatabaseConnection } from '../src/db/connection.js';
import { runMigrations } from '../src/db/migrate.js';

test('Migration Ledger and Repeat Safety', async (t) => {
  const db = createDatabaseConnection({ connection: ':memory:' });

  t.after(async () => {
    await db.destroy();
  });

  await t.test('first run applies all migrations and creates ledger', async () => {
    await runMigrations(db);

    const hasLedger = await db.schema.hasTable('schema_migrations');
    assert.equal(hasLedger, true);

    const hasSources = await db.schema.hasTable('content_sources');
    assert.equal(hasSources, true);

    const hasSurahs = await db.schema.hasTable('quran_surahs');
    assert.equal(hasSurahs, true);

    const records = await db('schema_migrations').select();
    assert.equal(records.length, 1);
    assert.equal(records[0].name, '20261102_000001_initial_schema');
  });

  await t.test('second run is a safe no-op that does not fail or duplicate tables', async () => {
    // Should run smoothly without throwing "table already exists" error
    await runMigrations(db);

    const records = await db('schema_migrations').select();
    assert.equal(records.length, 1);
  });

  await t.test('enforces Quran catalogue metadata constraints', async () => {
    await db('content_sources').insert({
      id: 'test-source',
      code: 'test-catalogue',
      name: 'Test catalogue metadata',
      content_type: 'quran',
      edition: 'metadata-only-test',
      source_url: 'https://example.invalid/catalogue',
      attribution: 'Test fixture',
      license_id: 'test-only',
      redistribution_allowed: false,
      approval_status: 'pending',
      review_decision_id: 'test-pending-review',
      approved_by_authority: 'test-fixture-authority',
      approved_at: new Date().toISOString(),
      artifact_sha256: 'a'.repeat(64)
    });

    const validMetadata = {
      source_id: 'test-source',
      surah_number: 1,
      name_arabic: 'test',
      name_simple: 'test',
      name_english: 'test',
      revelation_place: 'makkah',
      revelation_order: 1,
      verses_count: 7
    };

    await db('quran_surahs').insert(validMetadata);

    await assert.rejects(
      db('quran_surahs').insert({ ...validMetadata, surah_number: 115 }),
      /constraint/i
    );
    await assert.rejects(
      db('quran_surahs').insert({ ...validMetadata, surah_number: 0 }),
      /constraint/i
    );
    await assert.rejects(
      db('quran_surahs').insert({ ...validMetadata, surah_number: 2, revelation_place: 'unknown' }),
      /constraint/i
    );
    await assert.rejects(
      db('quran_surahs').insert({ ...validMetadata, surah_number: 2, revelation_order: 0 }),
      /constraint/i
    );
    await assert.rejects(
      db('quran_surahs').insert({ ...validMetadata, surah_number: 2, verses_count: 0 }),
      /constraint/i
    );
  });
});
