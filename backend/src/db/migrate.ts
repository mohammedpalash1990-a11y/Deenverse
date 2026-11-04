import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { createDatabaseConnection, resolveDatabaseConfig, DatabaseConfig } from './connection.js';
import * as initialSchema from './migrations/20261102_000001_initial_schema.js';
import * as sourceApprovalGate from './migrations/20261103_000002_source_approval_gate.js';
import * as quranAyahs from './migrations/20261104_000003_quran_ayahs.js';
import * as quranAyahReviews from './migrations/20261104_000004_quran_ayah_reviews.js';
import * as quranTeamReviews from './migrations/20261104_000006_quran_team_reviews.js';

const BASE_REQUIRED_TABLES = ['content_sources', 'quran_surahs'] as const;
const REQUIRED_TABLES = [...BASE_REQUIRED_TABLES, 'content_source_approvals', 'quran_ayahs', 'quran_ayah_reviews', 'quran_review_batches', 'quran_review_invites', 'quran_review_submissions'] as const;

export async function runMigrations(db = createDatabaseConnection()): Promise<void> {
  const basePresent = await Promise.all(BASE_REQUIRED_TABLES.map((table) => db.schema.hasTable(table)));
  if (basePresent.every((present) => !present)) await initialSchema.up(db);
  else if (basePresent.some((present) => !present)) {
    throw new Error('Partial DEENVERSE base schema detected. Inspect content_sources and quran_surahs before retrying migrations.');
  }
  if (!(await db.schema.hasTable('content_source_approvals'))) await sourceApprovalGate.up(db);
  if (!(await db.schema.hasTable('quran_ayahs'))) await quranAyahs.up(db);
  if (!(await db.schema.hasTable('quran_ayah_reviews'))) await quranAyahReviews.up(db);
  if (!(await db.schema.hasTable('quran_review_batches'))) await quranTeamReviews.up(db);
  const complete = await Promise.all(REQUIRED_TABLES.map((table) => db.schema.hasTable(table)));
  if (!complete.every(Boolean)) throw new Error('DEENVERSE migrations did not create the complete required schema.');
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
