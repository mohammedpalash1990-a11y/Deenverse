import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { createDatabaseConnection, resolveDatabaseConfig, DatabaseConfig } from './connection.js';
import * as initialSchema from './migrations/20261102_000001_initial_schema.js';
import * as sourceApprovalGate from './migrations/20261103_000002_source_approval_gate.js';
import * as quranAyahs from './migrations/20261104_000003_quran_ayahs.js';
import * as hadithLibrary from './migrations/20261104_000005_hadith_library.js';

const BASE_REQUIRED_TABLES = ['content_sources', 'quran_surahs'] as const;
const HADITH_TABLES = ['hadith_books', 'hadith_chapters', 'hadith_records', 'hadith_translations', 'hadith_grade_assessments', 'hadith_record_reviews'] as const;
const REQUIRED_TABLES = [...BASE_REQUIRED_TABLES, 'content_source_approvals', 'quran_ayahs', ...HADITH_TABLES] as const;

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

  if (!(await db.schema.hasTable('quran_ayahs'))) {
    await quranAyahs.up(db);
  }

  if (!(await db.schema.hasTable('hadith_books'))) {
    await hadithLibrary.up(db);
  }

  const complete = await Promise.all(REQUIRED_TABLES.map((table) => db.schema.hasTable(table)));
  if (!complete.every(Boolean)) {
    throw new Error('DEENVERSE migrations did not create the complete required schema.');
  }
}

function createDatabaseConfigForMigration(): DatabaseConfig {
  const config = resolveDatabaseConfig();
  if (process.env.NODE_ENV === 'production' && config.client !== 'pg') {
    throw new Error('Production migrations require PostgreSQL. Set DATABASE_URL to a PostgreSQL connection string.');
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
