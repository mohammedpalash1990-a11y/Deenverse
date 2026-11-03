import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { createDatabaseConnection } from './connection.js';
import * as initialSchema from './migrations/20261102_000001_initial_schema.js';

const REQUIRED_TABLES = ['content_sources', 'quran_surahs'] as const;

/**
 * Apply the initial schema exactly once. A partially-created schema is treated
 * as an error so an operator must inspect/repair it rather than masking drift.
 */
export async function runMigrations(db = createDatabaseConnection()): Promise<void> {
  const present = await Promise.all(REQUIRED_TABLES.map((table) => db.schema.hasTable(table)));
  if (present.every(Boolean)) return;
  if (present.some(Boolean)) {
    throw new Error(
      'Partial DEENVERSE schema detected. Inspect content_sources and quran_surahs before retrying migrations.'
    );
  }
  await initialSchema.up(db);
  const created = await Promise.all(REQUIRED_TABLES.map((table) => db.schema.hasTable(table)));
  if (!created.every(Boolean)) {
    throw new Error('Initial migration did not create the complete required schema.');
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
