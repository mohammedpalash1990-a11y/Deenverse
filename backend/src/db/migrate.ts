import { createDatabaseConnection } from './connection.js';
import * as initialSchema from './migrations/20261102_000001_initial_schema.js';
import { fileURLToPath } from 'url';

export async function runMigrations(db = createDatabaseConnection()) {
  console.log('Running initial database migrations...');
  await initialSchema.up(db);
  console.log('Migrations applied successfully.');
  return db;
}

// Allow direct CLI execution: `npx tsx src/db/migrate.ts` or `npm run migrate`
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runMigrations()
    .then((db) => db.destroy())
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
