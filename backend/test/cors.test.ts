import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/app.js';
import { createDatabaseConnection } from '../src/db/connection.js';
import * as initialSchema from '../src/db/migrations/20261102_000001_initial_schema.js';
import * as sourceApprovalGate from '../src/db/migrations/20261103_000002_source_approval_gate.js';

test('CORS permits only explicitly configured browser origins', async (t) => {
  const previousOrigins = process.env.CORS_ALLOWED_ORIGINS;
  process.env.CORS_ALLOWED_ORIGINS = 'https://app.example.test, https://admin.example.test';

  const db = createDatabaseConnection({ client: 'sqlite3', connection: ':memory:' });
  await initialSchema.up(db);
  await sourceApprovalGate.up(db);
  const app = buildApp({ db, enableRateLimit: false });

  t.after(async () => {
    await app.close();
    await db.destroy();
    if (previousOrigins === undefined) delete process.env.CORS_ALLOWED_ORIGINS;
    else process.env.CORS_ALLOWED_ORIGINS = previousOrigins;
  });

  await t.test('returns the exact allow-origin header for an approved origin', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/health',
      headers: { origin: 'https://app.example.test' }
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.headers['access-control-allow-origin'], 'https://app.example.test');
    assert.equal(response.headers['access-control-allow-credentials'], undefined);
  });

  await t.test('does not grant CORS access to an unlisted origin', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/health',
      headers: { origin: 'https://untrusted.example.test' }
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.headers['access-control-allow-origin'], undefined);
  });
});
