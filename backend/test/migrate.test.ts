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
});
