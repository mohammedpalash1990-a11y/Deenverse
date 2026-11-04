import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/app.js';
import { createDatabaseConnection } from '../src/db/connection.js';
import * as initialSchema from '../src/db/migrations/20261102_000001_initial_schema.js';
import * as sourceApprovalGate from '../src/db/migrations/20261103_000002_source_approval_gate.js';
import * as quranAyahs from '../src/db/migrations/20261104_000003_quran_ayahs.js';
import * as hadithLibrary from '../src/db/migrations/20261104_000005_hadith_library.js';

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
    assert.equal(body.status, 'healthy');
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
    await initialSchema.up(db);
    await sourceApprovalGate.up(db);
    await quranAyahs.up(db);
    await hadithLibrary.up(db);

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
  });

  await t.test('GET /api/v1/ready rejects a table whose required columns are missing', async () => {
    await db.schema.dropTable('quran_ayahs');
    await db.schema.createTable('quran_ayahs', (table) => { table.integer('id').primary(); });
    const res = await app.inject({ method: 'GET', url: '/api/v1/ready' });
    assert.equal(res.statusCode, 503);
    assert.equal(res.json().error.code, 'UNAVAILABLE');
    assert.equal(res.json().error.message, 'Database schema is not fully migrated.');
    assert.equal((await app.inject({ method: 'GET', url: '/api/v1/health' })).statusCode, 200);
  });

});
