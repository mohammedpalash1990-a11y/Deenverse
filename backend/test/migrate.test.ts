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
    assert.equal(await db.schema.hasTable('quran_ayah_reviews'), true);
    assert.equal(await db('quran_ayah_reviews').count('* as count').first().then((row) => Number(row?.count)), 0);
    assert.equal(await db.schema.hasTable('problem_reports'), true);
    assert.equal(await db('problem_reports').count('* as count').first().then((row) => Number(row?.count)), 0);
    for (const table of [
      'hadith_books', 'hadith_chapters', 'hadith_records',
      'hadith_translations', 'hadith_grade_assessments', 'hadith_record_reviews'
    ]) {
      assert.equal(await db.schema.hasTable(table), true, table);
      assert.equal(await db(table).count('* as count').first().then((row) => Number(row?.count)), 0, table);
    }

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
    assert.equal(await db.schema.hasTable('hadith_books'), true);
    assert.equal(await db.schema.hasTable('hadith_record_reviews'), true);
    assert.equal(await db.schema.hasTable('quran_ayah_reviews'), true);
    assert.equal(await db.schema.hasTable('problem_reports'), true);
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
    assert.equal(await db.schema.hasTable('problem_reports'), false);
  } finally {
    await db.destroy();
  }
});

for (const orphanTable of ['hadith_books', 'hadith_chapters']) {
  test(`failed migration rolls back newly created tables and preserves existing ${orphanTable}`, async () => {
    const db = createDatabaseConnection({ client: 'sqlite3', connection: ':memory:' });
    try {
      // Synthetic legacy/partial schema: never repair or delete it implicitly.
      await db.schema.createTable(orphanTable, (table) => { table.string('id').primary(); });
      await db(orphanTable).insert({ id: 'synthetic-preserved-row' });

      await assert.rejects(() => runMigrations(db), /Partial Hadith schema detected/);
      assert.deepEqual(await db(orphanTable).select('id'), [{ id: 'synthetic-preserved-row' }]);
      for (const table of ['content_sources', 'quran_surahs', 'content_source_approvals', 'quran_ayahs', 'quran_ayah_reviews', 'problem_reports']) {
        assert.equal(await db.schema.hasTable(table), false, `${table} must roll back`);
      }
    } finally {
      await db.destroy();
    }
  });
}

test('failed upgrade preserves the original base schema and rolls back additive tables', async () => {
  const db = createDatabaseConnection({ client: 'sqlite3', connection: ':memory:' });
  try {
    await initialSchema.up(db);
    await db.schema.createTable('hadith_books', (table) => { table.string('id').primary(); });
    await assert.rejects(() => runMigrations(db), /Partial Hadith schema detected/);
    assert.equal(await db.schema.hasTable('content_sources'), true);
    assert.equal(await db.schema.hasTable('quran_surahs'), true);
    assert.equal(await db.schema.hasTable('content_source_approvals'), false);
    assert.equal(await db.schema.hasTable('quran_ayahs'), false);
    assert.equal(await db.schema.hasTable('quran_ayah_reviews'), false);
    assert.equal(await db.schema.hasTable('problem_reports'), false);
  } finally {
    await db.destroy();
  }
});

test('migration refuses existing tables with missing required columns without repairing or deleting data', async () => {
  const db = createDatabaseConnection({ client: 'sqlite3', connection: ':memory:' });
  try {
    await runMigrations(db);
    await db.schema.dropTable('quran_ayah_reviews');
    await db.schema.dropTable('quran_ayahs');
    await db.schema.createTable('quran_ayahs', (table) => { table.integer('id').primary(); });
    await db('quran_ayahs').insert({ id: 123 });
    await assert.rejects(() => runMigrations(db), /quran_ayahs has the required source\/coordinate columns/);
    assert.equal(await db.schema.hasTable('quran_ayah_reviews'), false);
    assert.deepEqual(await db('quran_ayahs').select('*'), [{ id: 123 }]);
  } finally {
    await db.destroy();
  }
});
