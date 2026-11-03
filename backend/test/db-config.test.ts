import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveDatabaseConfig } from '../src/db/connection.js';

test('Database Configuration Resolver', async (t) => {
  const origEnv = { ...process.env };

  t.afterEach(() => {
    process.env = { ...origEnv };
  });

  await t.test('resolves default SQLite memory configuration', () => {
    delete process.env.DATABASE_URL;
    delete process.env.DB_CLIENT;
    delete process.env.DB_FILENAME;

    const config = resolveDatabaseConfig();
    assert.equal(config.client, 'sqlite3');
    assert.deepEqual(config.connection, { filename: ':memory:' });
  });

  await t.test('resolves explicit DATABASE_URL PostgreSQL configuration', () => {
    process.env.DATABASE_URL = 'postgresql://user:secret@localhost:5432/deenverse_prod';

    const config = resolveDatabaseConfig();
    assert.equal(config.client, 'pg');
    assert.equal(config.connection, 'postgresql://user:secret@localhost:5432/deenverse_prod');
  });

  await t.test('rejects PostgreSQL mode without an explicit database URL', () => {
    delete process.env.DATABASE_URL;
    process.env.DB_CLIENT = 'pg';

    assert.throws(() => resolveDatabaseConfig(), /DATABASE_URL is required/);
  });

  await t.test('rejects unsupported database clients instead of silently falling back', () => {
    delete process.env.DATABASE_URL;
    process.env.DB_CLIENT = 'mysql';

    assert.throws(() => resolveDatabaseConfig(), /DB_CLIENT must be either/);
  });

  await t.test('rejects database URLs with unsupported schemes', () => {
    process.env.DATABASE_URL = 'mysql://localhost/deenverse';
    delete process.env.DB_CLIENT;

    assert.throws(() => resolveDatabaseConfig(), /DATABASE_URL must use/);
  });

  await t.test('resolves custom DB_FILENAME for SQLite', () => {
    delete process.env.DATABASE_URL;
    process.env.DB_CLIENT = 'sqlite3';
    process.env.DB_FILENAME = './custom_path.sqlite';

    const config = resolveDatabaseConfig();
    assert.equal(config.client, 'sqlite3');
    assert.deepEqual(config.connection, { filename: './custom_path.sqlite' });
  });
});
