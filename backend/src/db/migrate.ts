import { hasRequiredSchema } from './schema-readiness.js';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { createDatabaseConnection, resolveDatabaseConfig, DatabaseConfig } from './connection.js';
import * as initialSchema from './migrations/20261102_000001_initial_schema.js';
import * as sourceApprovalGate from './migrations/20261103_000002_source_approval_gate.js';
import * as quranAyahs from './migrations/20261104_000003_quran_ayahs.js';
import * as hadithLibrary from './migrations/20261104_000005_hadith_library.js';

const BASE_REQUIRED_TABLES = ['content_sources', 'quran_surahs'] as const;

/**
 * Apply the base schema to a fresh database, then apply additive migrations.
 * Existing databases with the base schema are upgraded without destructive
 * recreation. Unexpected partial base schemas fail closed for operator review.
 */
export async function runMigrations(db = createDatabaseConnection()): Promise<void> {
  // PostgreSQL and SQLite support transactional DDL. A failed release must not
  // leave only the first tables of a multi-table migration behind.
  await db.transaction(async (transaction) => {
    if (db.client.config.client === 'pg') {
      // Serialize release jobs on this database. Transaction-scoped locks are
      // released on both commit and rollback, including connection loss.
      await transaction.raw('SELECT pg_advisory_xact_lock(?, ?)', [20261104, 1]);
    }
    await applyMigrations(transaction);
  });
}

async function applyMigrations(db: import('knex').Knex): Promise<void> {
  const basePresent = await Promise.all(BASE_REQUIRED_TABLES.map((table) => db.schema.hasTable(table)));

  if (basePresent.every((present) => !present)) {
    await initialSchema.up(db);
  } else if (basePresent.some((present) => !present)) {
    throw new Error(
      'Partial DEENVERSE base schema detected. Inspect content_sources and quran_surahs before retrying migrations.'
    );
  }

  if (!(await db.schema.hasTable('content_source_approvals'))) {
    await sourceApprovalGate.up(db);
  }

  if (!(await db.schema.hasTable('quran_ayahs'))) {
    await quranAyahs.up(db);
  }

  // Always invoke its preflight: a lone hadith_books table must not conceal
  // missing companion tables, and orphan companion tables must not be ignored.
  await hadithLibrary.up(db);

  if (!(await hasRequiredSchema(db))) {
    throw new Error('DEENVERSE migrations did not create the complete required schema. Inspect missing tables or columns before retrying.');
  }
}

/**
 * Production migrations use a separate owner/migrator credential.
 * The HTTP runtime must use DATABASE_URL with a read-only role.
 */
export function createDatabaseConfigForMigration(): DatabaseConfig {
  const migrationUrl = process.env.MIGRATION_DATABASE_URL?.trim();
  const config = resolveDatabaseConfig(migrationUrl || undefined);
  if (process.env.NODE_ENV === 'production' && (!migrationUrl || config.client !== 'pg')) {
    throw new Error('Production migrations require MIGRATION_DATABASE_URL with a PostgreSQL connection string.');
  }
  return config;
}

async function main(): Promise<void> {
  const config = createDatabaseConfigForMigration();
  const db = createDatabaseConnection(config);

  try {
    await runMigrations(db);
    console.log('DEENVERSE database schema is ready.');
  } finally {
    await db.destroy();
  }
}

const invokedPath = process.argv[1];
if (invokedPath && import.meta.url === pathToFileURL(resolve(invokedPath)).href) {
  main().catch((error: unknown) => {
    console.error('Database migration failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
