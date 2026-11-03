import { createDatabaseConnection } from './connection.js';
import * as initialSchema from './migrations/20261102_000001_initial_schema.js';

export async function runMigrations(db = createDatabaseConnection()) {
  await initialSchema.up(db);
  return db;
}
