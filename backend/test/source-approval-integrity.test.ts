import assert from 'node:assert/strict';
import test from 'node:test';
import { buildApp } from '../src/app.js';
import { createDatabaseConnection } from '../src/db/connection.js';
import * as initialSchema from '../src/db/migrations/20261102_000001_initial_schema.js';
import * as sourceApprovalGate from '../src/db/migrations/20261103_000002_source_approval_gate.js';

test('catalogue publication requires the approval digest to match the registered source digest', async (t) => {
  const db = createDatabaseConnection({ client: 'sqlite3', connection: ':memory:' });
  await initialSchema.up(db);
  await sourceApprovalGate.up(db);
  const app = buildApp({ db, enableRateLimit: false });
  const sourceDigest = 'a'.repeat(64);
  const differentDigest = 'b'.repeat(64);

  t.after(async () => {
    await app.close();
    await db.destroy();
  });

  await db('content_sources').insert({
    id: 'synthetic-source-fixture',
    code: 'SYNTHETIC_FIXTURE_ONLY',
    name: 'Synthetic metadata fixture',
    content_type: 'quran',
    edition: 'synthetic-test-edition',
    source_url: 'https://example.org/synthetic-fixture',
    attribution: 'Synthetic fixture only; not a religious source',
    license_id: 'TEST_FIXTURE_NOT_A_LICENSE',
    redistribution_allowed: true,
    reviewer: 'synthetic-test-reviewer',
    reviewed_at: '2026-11-03T00:00:00.000Z',
    checksum: sourceDigest,
    is_active: true
  });
  await db('content_source_approvals').insert({
    id: 'synthetic-approval-fixture',
    source_id: 'synthetic-source-fixture',
    decision: 'approved',
    reviewer_id: 'synthetic-independent-artifact-reviewer',
    approved_at: '2026-11-03T00:00:00.000Z',
    artifact_sha256: differentDigest,
    review_notes: 'Synthetic mismatch fixture; never approve or publish.'
  });
  await db('quran_surahs').insert({
    surah_number: 1,
    name_arabic: 'Synthetic metadata',
    name_simple: 'Synthetic metadata',
    name_english: 'Synthetic metadata',
    revelation_place: 'makkah',
    revelation_order: 1,
    verses_count: 1,
    source_id: 'synthetic-source-fixture'
  });

  await t.test('a mismatched approval digest blocks both catalogue and detail reads', async () => {
    const list = await app.inject({ method: 'GET', url: '/api/v1/quran/surahs' });
    const detail = await app.inject({ method: 'GET', url: '/api/v1/quran/surahs/1' });

    assert.equal(list.statusCode, 503);
    assert.equal(JSON.parse(list.body).error.code, 'CONTENT_UNAVAILABLE');
    assert.equal(detail.statusCode, 503);
    assert.equal(JSON.parse(detail.body).error.code, 'CONTENT_UNAVAILABLE');
  });

  await t.test('an exact stored digest match passes the metadata gate only', async () => {
    await db('content_source_approvals')
      .where({ id: 'synthetic-approval-fixture' })
      .update({ artifact_sha256: sourceDigest });

    const list = await app.inject({ method: 'GET', url: '/api/v1/quran/surahs' });
    assert.equal(list.statusCode, 200);
    const body = JSON.parse(list.body);
    assert.equal(body.data[0].provenance.checksum, sourceDigest);
    assert.equal(body.data[0].payload.nameSimple, 'Synthetic metadata');
  });
});
