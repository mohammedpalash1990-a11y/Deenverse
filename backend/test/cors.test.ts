import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/app.js';
import { createDatabaseConnection } from '../src/db/connection.js';

test('CORS Security Configuration', async (t) => {
  const db = createDatabaseConnection({ connection: ':memory:' });
  const app = buildApp({
    db,
    enableRateLimit: false,
    allowedOrigins: ['https://deenverse.com', 'http://localhost:3000']
  });

  t.after(async () => {
    await app.close();
    await db.destroy();
  });

  await t.test('allows requests without origin header (e.g. server-to-server or mobile clients)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/health'
    });
    assert.equal(res.statusCode, 200);
  });

  await t.test('allows requests from explicit allowlisted origin', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/health',
      headers: {
        origin: 'https://deenverse.com'
      }
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.headers['access-control-allow-origin'], 'https://deenverse.com');
  });

  await t.test('blocks requests from unauthorized origin with 403 FORBIDDEN', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/health',
      headers: {
        origin: 'https://malicious-site.example'
      }
    });
    assert.equal(res.statusCode, 403);
    const body = JSON.parse(res.body);
    assert.equal(body.error.code, 'FORBIDDEN');
  });
});
