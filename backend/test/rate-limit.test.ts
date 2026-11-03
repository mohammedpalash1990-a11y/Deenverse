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

    t.after(async () => {
      await app.close();
    });

    const first = await app.inject({ method: 'GET', url: '/api/v1/health' });
    const second = await app.inject({ method: 'GET', url: '/api/v1/health' });

    assert.equal(first.statusCode, 200);
    assert.equal(second.statusCode, 429);
    assert.equal(JSON.parse(second.body).error.code, 'RATE_LIMITED');
  });

  await t.test('allows requests from an explicitly trusted browser origin', async () => {
    const app = buildApp({
      db,
      enableRateLimit: false,
      allowedOrigins: ['https://app.example.test']
    });
    t.after(async () => {
      await app.close();
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/health',
      headers: { origin: 'https://app.example.test' }
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.headers['access-control-allow-origin'], 'https://app.example.test');
  });

  await t.test('rejects requests from an untrusted browser origin with a structured 403', async () => {
    const app = buildApp({
      db,
      enableRateLimit: false,
      allowedOrigins: ['https://app.example.test']
    });
    t.after(async () => {
      await app.close();
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/health',
      headers: { origin: 'https://attacker.example.test' }
    });

    assert.equal(response.statusCode, 403);
    assert.equal(JSON.parse(response.body).error.code, 'FORBIDDEN');
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
