import { createHash } from 'node:crypto';
import { strict as assert } from 'node:assert';
import { after, before, test } from 'node:test';
import { buildApp } from '../src/app.js';
import { createDatabaseConnection } from '../src/db/connection.js';
import { runMigrations } from '../src/db/migrate.js';

const db = createDatabaseConnection({ client: 'sqlite3', connection: { filename: ':memory:' }, useNullAsDefault: true });
const app = buildApp({ db, enableRateLimit: false });
const arabic = 'بِسْمِ اللَّهِ';
const digest = createHash('sha256').update(arabic, 'utf8').digest('hex');
const sourceId = 'verified-quran-source';
const artifactDigest = 'a'.repeat(64);
const reviewWhere = { source_id: sourceId, surah_number: 1, ayah_number: 1 };

before(async () => {
  await runMigrations(db);
  await db('content_sources').insert({
    id: sourceId,
    code: 'verified-quran',
    name: 'Verified Quran source',
    content_type: 'quran',
    edition: 'test-edition',
    source_url: 'https://example.org/quran',
    attribution: 'Test fixture only',
    license_id: 'test-license',
    redistribution_allowed: true,
    reviewer: 'test-source-reviewer',
    reviewed_at: '2026-11-04 00:00:00',
    checksum: artifactDigest,
    is_active: true
  });
  await db('content_source_approvals').insert({
    id: 'approval-1',
    source_id: sourceId,
    decision: 'approved',
    reviewer_id: 'test-artifact-reviewer',
    approved_at: '2026-11-04 00:00:00',
    artifact_sha256: artifactDigest,
    review_notes: 'Automated test fixture'
  });
  await db('quran_surahs').insert({
    surah_number: 1,
    name_arabic: 'الفاتحة',
    name_simple: 'Al-Fatihah',
    name_english: 'The Opening',
    revelation_place: 'makkah',
    revelation_order: 5,
    verses_count: 7,
    source_id: sourceId
  });
  await db('quran_ayahs').insert({
    surah_number: 1,
    ayah_number: 1,
    arabic,
    text_sha256: digest,
    source_id: sourceId
  });
  await db('quran_ayah_reviews').insert({
    ...reviewWhere,
    review_status: 'passed',
    artifact_sha256: artifactDigest,
    reviewer_id: 'test-ayah-reviewer',
    reviewed_at: '2026-11-04 00:00:00',
    text_match: true,
    boundary_match: true
  });
});

after(async () => {
  await app.close();
  await db.destroy();
});

test('returns an ayah only after independent source-bound per-ayah review and text digest checks', async () => {
  const response = await app.inject({ method: 'GET', url: '/api/v1/ayah/1/1' });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().data.id, 'quran:ayah:1:1');
  assert.equal(response.json().data.payload.textArabic, arabic);
  assert.equal(response.json().data.payload.surahNumber, 1);
  assert.equal(response.json().data.payload.ayahNumber, 1);
  assert.equal(response.json().data.provenance.approvalStatus, 'approved');
  assert.equal(response.json().data.provenance.reviewer, 'test-source-reviewer');
  assert.equal(response.json().data.provenance.approvedByAuthority, 'test-artifact-reviewer');
  assert.equal(response.json().data.provenance.redistributionAllowed, true);
  assert.equal(response.json().data.provenance.sourceId, sourceId);
});

test('rejects an ayah with no per-ayah review record', async () => {
  await db('quran_ayah_reviews').where(reviewWhere).delete();
  const response = await app.inject({ method: 'GET', url: '/api/v1/ayah/1/1' });
  assert.equal(response.statusCode, 502);
  await db('quran_ayah_reviews').insert({
    ...reviewWhere, review_status: 'passed', artifact_sha256: artifactDigest,
    reviewer_id: 'test-ayah-reviewer', reviewed_at: '2026-11-04 00:00:00',
    text_match: true, boundary_match: true
  });
});

test('rejects a per-ayah review bound to a different artifact digest', async () => {
  await db('quran_ayah_reviews').where(reviewWhere).update({ artifact_sha256: 'c'.repeat(64) });
  const response = await app.inject({ method: 'GET', url: '/api/v1/ayah/1/1' });
  assert.equal(response.statusCode, 502);
  await db('quran_ayah_reviews').where(reviewWhere).update({ artifact_sha256: artifactDigest });
});

test('rejects a primary reviewer who is not independent of the source and approval reviewers', async () => {
  for (const reviewer_id of [
    'test-source-reviewer',
    'test-artifact-reviewer',
    ' PROJECT-OWNER-CHAT-AUTHORIZATION '
  ]) {
    await db('quran_ayah_reviews').where(reviewWhere).update({ reviewer_id });
    const response = await app.inject({ method: 'GET', url: '/api/v1/ayah/1/1' });
    assert.equal(response.statusCode, 502, reviewer_id);
  }
  await db('quran_ayah_reviews').where(reviewWhere).update({ reviewer_id: 'test-ayah-reviewer' });
});

test('rejects reviewer aliases that differ only by case or whitespace', async () => {
  for (const reviewer_id of [' TEST-SOURCE-REVIEWER ', ' TEST-ARTIFACT-REVIEWER ']) {
    await db('quran_ayah_reviews').where(reviewWhere).update({ reviewer_id });
    const response = await app.inject({ method: 'GET', url: '/api/v1/ayah/1/1' });
    assert.equal(response.statusCode, 502, reviewer_id);
  }
  await db('quran_ayah_reviews').where(reviewWhere).update({ reviewer_id: 'test-ayah-reviewer' });
});

test('rejects failed, in-progress, and second-review-pending primary decisions', async () => {
  for (const review_status of ['failed', 'in_review', 'needs_second_review']) {
    await db('quran_ayah_reviews').where(reviewWhere).update({ review_status });
    const response = await app.inject({ method: 'GET', url: '/api/v1/ayah/1/1' });
    assert.equal(response.statusCode, 502, review_status);
  }
  await db('quran_ayah_reviews').where(reviewWhere).update({ review_status: 'passed' });
});

test('requires exact text and Ayah-boundary review matches', async () => {
  for (const field of ['text_match', 'boundary_match']) {
    await db('quran_ayah_reviews').where(reviewWhere).update({ [field]: false });
    const response = await app.inject({ method: 'GET', url: '/api/v1/ayah/1/1' });
    assert.equal(response.statusCode, 502, field);
    await db('quran_ayah_reviews').where(reviewWhere).update({ [field]: true });
  }
});

test('requires any recorded second review to be passed and independently identified', async () => {
  for (const second_review_status of ['failed', 'needs_second_review']) {
    await db('quran_ayah_reviews').where(reviewWhere).update({
      second_review_status,
      second_reviewer_id: 'test-second-reviewer',
      second_reviewed_at: '2026-11-04 01:00:00'
    });
    const response = await app.inject({ method: 'GET', url: '/api/v1/ayah/1/1' });
    assert.equal(response.statusCode, 502, second_review_status);
  }

  for (const second_reviewer_id of [
    'test-ayah-reviewer',
    'test-source-reviewer',
    'test-artifact-reviewer',
    'project-owner-chat-authorization'
  ]) {
    await db('quran_ayah_reviews').where(reviewWhere).update({
      second_review_status: 'passed',
      second_reviewer_id,
      second_reviewed_at: '2026-11-04 01:00:00'
    });
    const response = await app.inject({ method: 'GET', url: '/api/v1/ayah/1/1' });
    assert.equal(response.statusCode, 502, second_reviewer_id);
  }

  await db('quran_ayah_reviews').where(reviewWhere).update({
    second_review_status: 'passed',
    second_reviewer_id: 'test-second-ayah-reviewer',
    second_reviewed_at: '2026-11-04 01:00:00'
  });
  const validSecondReview = await app.inject({ method: 'GET', url: '/api/v1/ayah/1/1' });
  assert.equal(validSecondReview.statusCode, 200);

  await db('quran_ayah_reviews').where(reviewWhere).update({
    second_review_status: null,
    second_reviewer_id: null,
    second_reviewed_at: null
  });
});

test('rejects missing or invalid primary review timestamps', async () => {
  await db('quran_ayah_reviews').where(reviewWhere).update({ reviewed_at: 'not-a-date' });
  const response = await app.inject({ method: 'GET', url: '/api/v1/ayah/1/1' });
  assert.equal(response.statusCode, 502);
  await db('quran_ayah_reviews').where(reviewWhere).update({ reviewed_at: '2026-11-04 00:00:00' });
});

test('rejects non-canonical or invalid ayah parameters', async () => {
  for (const url of ['/api/v1/ayah/01/1', '/api/v1/ayah/1/0', '/api/v1/ayah/115/1', '/api/v1/ayah/1/1x']) {
    const response = await app.inject({ method: 'GET', url });
    assert.equal(response.statusCode, 400, url);
  }
});

test('does not return an ayah outside the verified surah count', async () => {
  const response = await app.inject({ method: 'GET', url: '/api/v1/ayah/1/8' });
  assert.equal(response.statusCode, 404);
});

test('fails closed when the stored ayah digest does not match its text', async () => {
  await db('quran_ayahs').where(reviewWhere).update({ text_sha256: 'b'.repeat(64) });
  const response = await app.inject({ method: 'GET', url: '/api/v1/ayah/1/1' });
  assert.equal(response.statusCode, 502);
  await db('quran_ayahs').where(reviewWhere).update({ text_sha256: digest });
});

test('fails closed when source and artifact approval use the same reviewer', async () => {
  await db('content_source_approvals').where({ id: 'approval-1' }).update({ reviewer_id: 'test-source-reviewer' });
  const response = await app.inject({ method: 'GET', url: '/api/v1/ayah/1/1' });
  assert.equal(response.statusCode, 503);
  assert.equal(response.json().error.code, 'CONTENT_UNAVAILABLE');
  await db('content_source_approvals').where({ id: 'approval-1' }).update({ reviewer_id: 'test-artifact-reviewer' });
});

test('rejects reviewer identities that differ only by case or surrounding whitespace', async () => {
  await db('content_source_approvals').where({ id: 'approval-1' }).update({ reviewer_id: ' TEST-SOURCE-REVIEWER ' });
  const duplicateIdentity = await app.inject({ method: 'GET', url: '/api/v1/ayah/1/1' });
  assert.equal(duplicateIdentity.statusCode, 503);
  assert.equal(duplicateIdentity.json().error.code, 'CONTENT_UNAVAILABLE');
  await db('content_source_approvals').where({ id: 'approval-1' }).update({ reviewer_id: 'test-artifact-reviewer' });
});

test('rejects the project-owner chat authorization identity as an artifact approver', async () => {
  await db('content_source_approvals').where({ id: 'approval-1' }).update({ reviewer_id: 'project-owner-chat-authorization' });
  const response = await app.inject({ method: 'GET', url: '/api/v1/ayah/1/1' });
  assert.equal(response.statusCode, 503);
  assert.equal(response.json().error.code, 'CONTENT_UNAVAILABLE');
  await db('content_source_approvals').where({ id: 'approval-1' }).update({ reviewer_id: 'test-artifact-reviewer' });
});

test('rejects reserved reviewer identities regardless of case or surrounding whitespace', async () => {
  await db('content_source_approvals').where({ id: 'approval-1' }).update({ reviewer_id: ' PROJECT-OWNER-CHAT-AUTHORIZATION ' });
  const reservedApproval = await app.inject({ method: 'GET', url: '/api/v1/ayah/1/1' });
  assert.equal(reservedApproval.statusCode, 503);
  await db('content_source_approvals').where({ id: 'approval-1' }).update({ reviewer_id: 'test-artifact-reviewer' });

  await db('content_sources').where({ id: sourceId }).update({ reviewer: ' PROJECT-OWNER-CHAT-AUTHORIZATION ' });
  const reservedSource = await app.inject({ method: 'GET', url: '/api/v1/ayah/1/1' });
  assert.equal(reservedSource.statusCode, 503);
  await db('content_sources').where({ id: sourceId }).update({ reviewer: 'test-source-reviewer' });
});

test('fails closed when multiple active approved Quran editions exist', async () => {
  await db('content_sources').insert({
    id: 'second-approved-quran-source',
    code: 'second-approved-quran-source',
    name: 'Second synthetic Quran source',
    content_type: 'quran',
    edition: 'second-test-edition',
    source_url: 'https://example.org/second-quran-source',
    attribution: 'Synthetic test fixture only',
    license_id: 'test-license',
    redistribution_allowed: true,
    reviewer: 'second-source-reviewer',
    reviewed_at: '2026-11-04 00:00:00',
    checksum: 'b'.repeat(64),
    is_active: true
  });
  await db('content_source_approvals').insert({
    id: 'approval-second-quran-source',
    source_id: 'second-approved-quran-source',
    decision: 'approved',
    reviewer_id: 'second-artifact-reviewer',
    approved_at: '2026-11-04 00:00:00',
    artifact_sha256: 'b'.repeat(64),
    review_notes: 'Synthetic ambiguity regression fixture only'
  });

  const response = await app.inject({ method: 'GET', url: '/api/v1/ayah/1/1' });
  assert.equal(response.statusCode, 503);
  assert.equal(response.json().error.code, 'CONTENT_UNAVAILABLE');

  await db('content_source_approvals').where({ id: 'approval-second-quran-source' }).delete();
  await db('content_sources').where({ id: 'second-approved-quran-source' }).delete();
});
