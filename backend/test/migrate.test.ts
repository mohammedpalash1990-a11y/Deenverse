import assert from 'node:assert/strict';
import test from 'node:test';
import { createDatabaseConnection } from '../src/db/connection.js';
import { runMigrations } from '../src/db/migrate.js';
import * as initialSchema from '../src/db/migrations/20261102_000001_initial_schema.js';

test('database migration creates the complete schema and is safe to rerun', async () => {
  const db = createDatabaseConnection({ client: 'sqlite3', connection: ':memory:' });
  try {
    await runMigrations(db);
    assert.equal(await db.schema.hasTable('content_sources'), true);
    assert.equal(await db.schema.hasTable('quran_surahs'), true);
    assert.equal(await db.schema.hasTable('content_source_approvals'), true);

    await assert.doesNotReject(() => runMigrations(db));
  } finally {
    await db.destroy();
  }
});

test('database migration upgrades an existing base schema with the approval table', async () => {
  const db = createDatabaseConnection({ client: 'sqlite3', connection: ':memory:' });
  try {
    // Represents a database created before the source-approval migration existed.
    await initialSchema.up(db);
    assert.equal(await db.schema.hasTable('content_sources'), true);
    assert.equal(await db.schema.hasTable('quran_surahs'), true);
    assert.equal(await db.schema.hasTable('content_source_approvals'), false);

    await runMigrations(db);

    assert.equal(await db.schema.hasTable('content_source_approvals'), true);
    await assert.doesNotReject(() => runMigrations(db));
  } finally {
    await db.destroy();
  }
});

test('database migration rejects a partial base schema without changing it', async () => {
  const db = createDatabaseConnection({ client: 'sqlite3', connection: ':memory:' });
  try {
    await db.schema.createTable('content_sources', (table) => {
      table.string('id').primary();
    });

    await assert.rejects(
      () => runMigrations(db),
      /Partial DEENVERSE base schema detected/
    );
    assert.equal(await db.schema.hasTable('content_sources'), true);
    assert.equal(await db.schema.hasTable('quran_surahs'), false);
    assert.equal(await db.schema.hasTable('content_source_approvals'), false);
  } finally {
    await db.destroy();
  }
});
