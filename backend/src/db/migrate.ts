import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { createDatabaseConnection } from './connection.js';
import * as initialSchema from './migrations/20261102_000001_initial_schema.js';
import * as sourceApprovalGate from './migrations/20261103_000002_source_approval_gate.js';

const BASE_REQUIRED_TABLES = ['content_sources', 'quran_surahs'] as const;
const REQUIRED_TABLES = [...BASE_REQUIRED_TABLES, 'content_source_approvals'] as const;

/**
 * Apply the base schema to a fresh database, then apply additive migrations.
 * Existing databases with the base schema are upgraded without destructive
 * recreation. Unexpected partial base schemas fail closed for operator review.
 */
export async function runMigrations(db = createDatabaseConnection()): Promise<void> {
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

  const complete = await Promise.all(REQUIRED_TABLES.map((table) => db.schema.hasTable(table)));
  if (!complete.every(Boolean)) {
    throw new Error('DEENVERSE migrations did not create the complete required schema.');
  }
}

async function main(): Promise<void> {
  const client = process.env.DB_CLIENT || 'sqlite3';
  if (client !== 'sqlite3') {
    throw new Error('The migration CLI currently supports SQLite only; PostgreSQL support is not configured.');
  }

  const db = createDatabaseConnection({
    client: 'sqlite3',
    connection: process.env.DB_FILENAME || './deenverse.sqlite'
  });

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
