import assert from 'node:assert/strict';
import test from 'node:test';
import { buildApp } from '../src/app.js';
import { createDatabaseConnection } from '../src/db/connection.js';

test('API error handler preserves status semantics and hides internal diagnostics', async (t) => {
  const db = createDatabaseConnection({ client: 'sqlite3', connection: ':memory:' });
  const app = buildApp({ db, enableRateLimit: false });

  app.get('/test/forbidden', async () => {
    throw Object.assign(new Error('permission denied'), { statusCode: 403 });
  });
  app.get('/test/internal', async () => {
    throw new Error('sensitive database diagnostic');
  });

  t.after(async () => {
    await app.close();
    await db.destroy();
  });

  await t.test('maps 403 to FORBIDDEN with request metadata', async () => {
    const response = await app.inject({ method: 'GET', url: '/test/forbidden' });
    const body = JSON.parse(response.body);

    assert.equal(response.statusCode, 403);
    assert.equal(body.error.code, 'FORBIDDEN');
    assert.ok(body.error.requestId.startsWith('req_'));
    assert.deepEqual(body.error.details, []);
    assert.equal(body.error.retryable, false);
  });

  await t.test('maps unexpected errors to a safe INTERNAL_ERROR response', async () => {
    const response = await app.inject({ method: 'GET', url: '/test/internal' });
    const body = JSON.parse(response.body);

    assert.equal(response.statusCode, 500);
    assert.equal(body.error.code, 'INTERNAL_ERROR');
    assert.equal(body.error.message, 'An internal error occurred. Please try again.');
    assert.equal(response.body.includes('sensitive database diagnostic'), false);
    assert.ok(body.error.requestId.startsWith('req_'));
    assert.equal(body.error.retryable, true);
  });
});

test('CORS allows only exact configured browser origins', async (t) => {
  const previous = process.env.CORS_ALLOWED_ORIGINS;
  process.env.CORS_ALLOWED_ORIGINS = 'https://app.example.test';
  const db = createDatabaseConnection({ client: 'sqlite3', connection: ':memory:' });
  const app = buildApp({ db, enableRateLimit: false });

  t.after(async () => {
    await app.close();
    await db.destroy();
    if (previous === undefined) delete process.env.CORS_ALLOWED_ORIGINS;
    else process.env.CORS_ALLOWED_ORIGINS = previous;
  });

  await t.test('returns the allow-origin header for an exact match', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/health',
      headers: { origin: 'https://app.example.test' }
    });
    assert.equal(response.headers['access-control-allow-origin'], 'https://app.example.test');
  });

  await t.test('does not grant CORS access to an unlisted origin', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/health',
      headers: { origin: 'https://attacker.example.test' }
    });
    assert.equal(response.headers['access-control-allow-origin'], undefined);
  });
});
