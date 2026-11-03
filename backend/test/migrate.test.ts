import assert from 'node:assert/strict';
import test from 'node:test';
import { createDatabaseConnection } from '../src/db/connection.js';
import { runMigrations } from '../src/db/migrate.js';

test('database migration creates the required schema and is safe to rerun', async () => {
  const db = createDatabaseConnection({ client: 'sqlite3', connection: ':memory:' });
  try {
    await runMigrations(db);
    assert.equal(await db.schema.hasTable('content_sources'), true);
    assert.equal(await db.schema.hasTable('quran_surahs'), true);

    await assert.doesNotReject(() => runMigrations(db));
  } finally {
    await db.destroy();
  }
});

test('database migration rejects a partial schema without changing it', async () => {
  const db = createDatabaseConnection({ client: 'sqlite3', connection: ':memory:' });
  try {
    await db.schema.createTable('content_sources', (table) => {
      table.string('id').primary();
    });

    await assert.rejects(
      () => runMigrations(db),
      /Partial DEENVERSE schema detected/
    );
    assert.equal(await db.schema.hasTable('content_sources'), true);
    assert.equal(await db.schema.hasTable('quran_surahs'), false);
  } finally {
    await db.destroy();
  }
});
