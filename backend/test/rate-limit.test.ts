import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/app.js';
import { createDatabaseConnection } from '../src/db/connection.js';

test('Rate limit configuration', async (t) => {
  const db = createDatabaseConnection({ connection: ':memory:' });

  t.after(async () => {
    await db.destroy();
  });

  await t.test('uses configured request limit and returns a structured 429 response', async () => {
    const app = buildApp({
      db,
      rateLimitMax: 1,
      rateLimitWindowMs: 60_000
    });
    await app.ready();

    t.after(async () => {
      await app.close();
    });

    const first = await app.inject({ method: 'GET', url: '/api/v1/quran/surahs' });
    const second = await app.inject({ method: 'GET', url: '/api/v1/quran/surahs' });

    assert.notEqual(first.statusCode, 429);
    assert.equal(second.statusCode, 429);
    assert.equal(JSON.parse(second.body).error.code, 'RATE_LIMITED');

    // An exhausted public quota must never trigger an orchestrator restart.
    for (let attempt = 0; attempt < 3; attempt++) {
      const health = await app.inject({ method: 'GET', url: '/api/v1/health' });
      const ready = await app.inject({ method: 'GET', url: '/api/v1/ready' });
      assert.equal(health.statusCode, 200);
      assert.equal(ready.statusCode, 503); // Unmigrated database, not a quota failure.
      assert.equal(ready.json().error.code, 'UNAVAILABLE');
    }
  });

  await t.test('rejects a zero request limit', () => {
    assert.throws(
      () => buildApp({ db, rateLimitMax: 0 }),
      /rateLimitMax must be a positive safe integer/
    );
  });

  await t.test('rejects a non-positive rate limit window', () => {
    assert.throws(
      () => buildApp({ db, rateLimitWindowMs: -1 }),
      /rateLimitWindowMs must be a positive safe integer/
    );
  });
});
