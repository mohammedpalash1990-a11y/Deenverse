import { Knex } from 'knex';
import { createDatabaseConnection } from './connection.js';
import * as initialSchema from './migrations/20261102_000001_initial_schema.js';
import { fileURLToPath } from 'url';

const MIGRATIONS = [
  { name: '20261102_000001_initial_schema', run: initialSchema.up }
];

export async function runMigrations(db: Knex = createDatabaseConnection()): Promise<Knex> {
  // Ensure migration ledger table exists
  const hasLedger = await db.schema.hasTable('schema_migrations');
  if (!hasLedger) {
    await db.schema.createTable('schema_migrations', (table) => {
      table.string('name').primary();
      table.timestamp('executed_at').notNullable().defaultTo(db.fn.now());
    });
  }

  // Query executed migrations
  const executedRows = await db('schema_migrations').select('name');
  const executedSet = new Set(executedRows.map((r) => r.name));

  for (const migration of MIGRATIONS) {
    if (!executedSet.has(migration.name)) {
      console.log(`Applying migration: ${migration.name}...`);
      await db.transaction(async (trx) => {
        await migration.run(trx);
        await trx('schema_migrations').insert({ name: migration.name });
      });
      executedSet.add(migration.name);
      console.log(`Migration ${migration.name} applied successfully.`);
    } else {
      console.log(`Migration ${migration.name} is already applied (skipped).`);
    }
  }

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
