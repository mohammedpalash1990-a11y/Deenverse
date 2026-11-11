import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/app.js';
import { createDatabaseConnection } from '../src/db/connection.js';
import * as initialSchema from '../src/db/migrations/20261102_000001_initial_schema.js';
import * as sourceApprovalGate from '../src/db/migrations/20261103_000002_source_approval_gate.js';
import * as problemReports from '../src/db/migrations/20261111_000006_problem_reports.js';

test('CORS permits only explicitly configured browser origins', async (t) => {
  const previousOrigins = process.env.CORS_ALLOWED_ORIGINS;
  process.env.CORS_ALLOWED_ORIGINS = 'https://app.example.test, https://admin.example.test';

  const db = createDatabaseConnection({ client: 'sqlite3', connection: ':memory:' });
  await initialSchema.up(db);
  await sourceApprovalGate.up(db);
  await problemReports.up(db);
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

    assert.equal(response.statusCode, 403);
    assert.equal(response.headers['access-control-allow-origin'], undefined);
    const body = JSON.parse(response.body);
    assert.equal(body.error.code, 'FORBIDDEN');
    assert.ok(body.error.requestId.startsWith('req_'));
  });
  await t.test('allows problem-report submission only from an explicitly configured origin', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/problem-reports',
      headers: { origin: 'https://app.example.test' },
      payload: {
        category: 'bug',
        description: 'The report form should submit from the trusted application origin.',
        currentSection: 'Support',
        appVersion: '0.1.0'
      }
    });

    assert.equal(response.statusCode, 201);
    assert.equal(response.headers['access-control-allow-origin'], 'https://app.example.test');
    assert.equal(response.headers['access-control-allow-credentials'], undefined);
  });

  await t.test('blocks problem-report submission from unlisted origins before storing a report', async () => {
    const beforeCount = Number(
      await db('problem_reports').count('* as count').first().then((row) => row?.count)
    );
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/problem-reports',
      headers: { origin: 'https://untrusted.example.test' },
      payload: {
        category: 'bug',
        description: 'An untrusted browser origin must not submit a report.',
        currentSection: 'Support',
        appVersion: '0.1.0'
      }
    });

    assert.equal(response.statusCode, 403);
    assert.equal(response.headers['access-control-allow-origin'], undefined);
    const afterCount = Number(
      await db('problem_reports').count('* as count').first().then((row) => row?.count)
    );
    assert.equal(afterCount, beforeCount);
  });

});
