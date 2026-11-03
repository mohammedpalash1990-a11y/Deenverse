import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/app.js';
import { createDatabaseConnection } from '../src/db/connection.js';
import { runMigrations, INITIAL_SCHEMA_MIGRATION } from '../src/db/migrate.js';

test('Liveness and Readiness Probes', async (t) => {
  const db = createDatabaseConnection({ connection: ':memory:' });
  const app = buildApp({ db, enableRateLimit: false });

  t.after(async () => {
    await app.close();
    await db.destroy();
  });

  await t.test('GET /api/v1/health returns liveness status 200', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/health'
    });

    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.status, 'ok');
    assert.equal(body.probe, 'liveness');
    assert.ok(body.requestId);
  });

  await t.test('GET /api/v1/ready returns 503 UNAVAILABLE when database is not migrated', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/ready'
    });

    assert.equal(res.statusCode, 503);
    const body = JSON.parse(res.body);
    assert.equal(body.error.code, 'UNAVAILABLE');
    assert.equal(body.error.message, 'Database schema is not fully migrated.');
  });

  await t.test('GET /api/v1/ready returns 200 ready when migrations are applied', async () => {
    await runMigrations(db);

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/ready'
    });

    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.status, 'ready');
    assert.equal(body.probe, 'readiness');
    assert.equal(body.database, 'connected');
    assert.equal(body.migrations, 'applied');

    await db('schema_migrations').where({ name: INITIAL_SCHEMA_MIGRATION }).del();

    const incomplete = await app.inject({
      method: 'GET',
      url: '/api/v1/ready'
    });
    assert.equal(incomplete.statusCode, 503);
    assert.equal(JSON.parse(incomplete.body).error.code, 'UNAVAILABLE');
    assert.equal(JSON.parse(incomplete.body).error.message, 'Required database migrations have not been applied.');
  });
});
