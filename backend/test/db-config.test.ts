import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveDatabaseConfig, resolveReportsDatabaseConfig } from '../src/db/connection.js';
import { createDatabaseConfigForMigration } from '../src/db/migrate.js';

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

  await t.test('resolves PostgreSQL configuration from an explicit URL override', () => {
    process.env.DATABASE_URL = 'postgresql://runtime:secret@localhost:5432/deenverse';
    const migrationUrl = 'postgresql://migrator:secret@localhost:5432/deenverse';

    const config = resolveDatabaseConfig(migrationUrl);
    assert.equal(config.client, 'pg');
    assert.equal(config.connection, migrationUrl);
  });

  await t.test('requires a separate PostgreSQL migration URL in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://runtime:secret@localhost:5432/deenverse';
    delete process.env.MIGRATION_DATABASE_URL;

    assert.throws(
      () => createDatabaseConfigForMigration(),
      /Production migrations require MIGRATION_DATABASE_URL/
    );
  });

  await t.test('uses the separate migration URL in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://runtime:secret@localhost:5432/deenverse';
    process.env.MIGRATION_DATABASE_URL = 'postgresql://migrator:secret@localhost:5432/deenverse';

    const config = createDatabaseConfigForMigration();
    assert.equal(config.client, 'pg');
    assert.equal(config.connection, process.env.MIGRATION_DATABASE_URL);
  });

  await t.test('rejects PostgreSQL mode without an explicit database URL', () => {
    delete process.env.DATABASE_URL;
    delete process.env.DB_CLIENT;

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

  await t.test('omits the report writer when REPORTS_DATABASE_URL is not configured', () => {
    delete process.env.REPORTS_DATABASE_URL;
    assert.equal(resolveReportsDatabaseConfig(), undefined);
  });

  await t.test('resolves a separate PostgreSQL report writer role in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://runtime:secret@localhost:5432/deenverse';
    process.env.REPORTS_DATABASE_URL = 'postgresql://reports:secret@localhost:5432/deenverse';

    const config = resolveReportsDatabaseConfig();
    assert.equal(config?.client, 'pg');
    assert.equal(config?.connection, process.env.REPORTS_DATABASE_URL);
  });

  await t.test('rejects a report writer URL that reuses the runtime database role', () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://runtime:secret@localhost:5432/deenverse';
    process.env.REPORTS_DATABASE_URL = 'postgresql://runtime:another-secret@localhost:5432/deenverse';

    assert.throws(
      () => resolveReportsDatabaseConfig(),
      /dedicated PostgreSQL role distinct from DATABASE_URL/
    );
  });

  await t.test('rejects SQLite report storage in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://runtime:secret@localhost:5432/deenverse';
    process.env.REPORTS_DATABASE_URL = 'sqlite3://reports.sqlite';

    assert.throws(
      () => resolveReportsDatabaseConfig(),
      /DATABASE_URL must use the postgresql/
    );
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
