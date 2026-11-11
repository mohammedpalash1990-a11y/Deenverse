import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { buildApp } from '../src/app.js';
import { createDatabaseConnection } from '../src/db/connection.js';
import { runMigrations } from '../src/db/migrate.js';
import { encodeCursor } from '../src/services/validation.js';

const digest = (value: string) => createHash('sha256').update(value, 'utf8').digest('hex');

test('Hadith API publishes only source-approved, independently reviewed, intact records', async (t) => {
  const db = createDatabaseConnection({ client: 'sqlite3', connection: ':memory:' });
  await runMigrations(db);
  const app = buildApp({ db, enableRateLimit: false });

  t.after(async () => {
    await app.close();
    await db.destroy();
  });

  const unavailable = await app.inject({ method: 'GET', url: '/api/v1/hadith/books' });
  assert.equal(unavailable.statusCode, 503);
  assert.equal(JSON.parse(unavailable.body).error.code, 'CONTENT_UNAVAILABLE');

  const emptySearch = await app.inject({ method: 'GET', url: '/api/v1/hadith/search?q=' });
  assert.equal(emptySearch.statusCode, 400);

  const canonicalSearch = 'নিশ্চয়';
  const canonicallyEquivalentSearch = 'নিশ্চয়';
  const cursorScope = JSON.stringify(['hadith', 'search', canonicalSearch, 'bn', 20]);
  const canonicalSearchCursor = encodeCursor(0, cursorScope);
  const crossNormalizationReplay = await app.inject({
    method: 'GET',
    url: `/api/v1/hadith/search?q=${encodeURIComponent(canonicallyEquivalentSearch)}&locale=bn&limit=20&cursor=${encodeURIComponent(canonicalSearchCursor)}`
  });
  assert.equal(crossNormalizationReplay.statusCode, 400, 'cursor must not be replayed across code-point-distinct search strings');

  const sourceChecksum = 'a'.repeat(64);
  await db('content_sources').insert({
    id: 'hadith-source-fixture',
    code: 'hadith-fixture',
    name: 'Synthetic Hadith source fixture',
    content_type: 'hadith',
    edition: 'fixture-edition-1',
    source_url: 'https://example.org/hadith-fixture',
    attribution: 'Synthetic automated test fixture only',
    license_id: 'TEST-FIXTURE-NOT-A-LICENSE',
    redistribution_allowed: true,
    reviewer: 'test-reviewer',
    reviewed_at: '2026-11-03T12:34:56.000Z',
    checksum: sourceChecksum,
    is_active: true
  });
  await db('content_source_approvals').insert({
    id: 'hadith-source-approval',
    source_id: 'hadith-source-fixture',
    decision: 'approved',
    reviewer_id: 'test-source-authority',
    approved_at: '2026-11-04T00:00:00.000Z',
    artifact_sha256: sourceChecksum,
    review_notes: 'Automated test fixture only; not a real source approval.'
  });

  const translationChecksum = 'b'.repeat(64);
  await db('content_sources').insert({
    id: 'hadith-translation-fixture',
    code: 'hadith-translation-fixture',
    name: 'Synthetic Hadith translation fixture',
    content_type: 'translation',
    edition: 'translation-fixture-edition-1',
    source_url: 'https://example.org/hadith-translation-fixture',
    attribution: 'Synthetic automated test translation fixture only',
    license_id: 'TEST-TRANSLATION-NOT-A-LICENSE',
    redistribution_allowed: true,
    reviewer: 'test-reviewer',
    reviewed_at: '2026-11-03T13:45:00.000Z',
    checksum: translationChecksum,
    is_active: true
  });
  await db('content_source_approvals').insert({
    id: 'hadith-translation-approval',
    source_id: 'hadith-translation-fixture',
    decision: 'approved',
    reviewer_id: 'test-translation-authority',
    approved_at: '2026-11-04T01:00:00.000Z',
    artifact_sha256: translationChecksum,
    review_notes: 'Automated test fixture only; not a real source approval.'
  });

  await db('hadith_books').insert({
    id: 'fixture-book',
    source_id: 'hadith-source-fixture',
    slug: 'fixture-collection',
    title_arabic: 'مجموعة اختبارية',
    title_english: 'Fixture Collection',
    title_bengali: 'পরীক্ষামূলক সংকলন',
    compiler_name: 'Fixture Compiler',
    collection_type: 'collection',
    edition: 'fixture-edition-1',
    sort_order: 1
  });
  await db('hadith_chapters').insert({
    id: 'fixture-chapter',
    book_id: 'fixture-book',
    source_id: 'hadith-source-fixture',
    chapter_number: '1',
    title_arabic: 'باب الاختبار',
    title_english: 'Fixture Chapter',
    title_bengali: 'পরীক্ষামূলক অধ্যায়',
    sort_order: 1
  });

  const verifiedText = 'الْحَمْدُ لِلَّهِ';
  await db('hadith_records').insert([
    {
      id: 'fixture-hadith-1',
      book_id: 'fixture-book',
      chapter_id: 'fixture-chapter',
      source_id: 'hadith-source-fixture',
      hadith_number: '1',
      numbering_system: 'fixture-edition-1',
      arabic_text: verifiedText,
      narrator_text: 'Fixture narrator',
      isnad_text: 'Fixture chain',
      source_reference: 'Fixture collection, chapter 1, narration 1',
      text_sha256: digest(verifiedText)
    },
    {
      id: 'fixture-hadith-unreviewed',
      book_id: 'fixture-book',
      chapter_id: 'fixture-chapter',
      source_id: 'hadith-source-fixture',
      hadith_number: '2',
      numbering_system: 'fixture-edition-1',
      arabic_text: 'نص غير مكتمل المراجعة',
      narrator_text: 'Unreviewed fixture narrator',
      isnad_text: null,
      source_reference: 'Unreviewed fixture record',
      text_sha256: digest('نص غير مكتمل المراجعة')
    }
  ]);

  await db('hadith_record_reviews').insert([
    {
      id: 'review-primary-1',
      hadith_id: 'fixture-hadith-1',
      source_id: 'hadith-source-fixture',
      review_role: 'primary',
      review_status: 'passed',
      artifact_sha256: sourceChecksum,
      reviewer_id: 'reviewer-primary',
      reviewed_at: '2026-11-04T00:00:00.000Z',
      text_match: true,
      reference_match: true
    },
    {
      id: 'review-independent-1',
      hadith_id: 'fixture-hadith-1',
      source_id: 'hadith-source-fixture',
      review_role: 'independent',
      review_status: 'passed',
      artifact_sha256: sourceChecksum,
      reviewer_id: 'reviewer-independent',
      reviewed_at: '2026-11-04T00:05:00.000Z',
      text_match: true,
      reference_match: true
    },
    {
      id: 'review-primary-unreviewed',
      hadith_id: 'fixture-hadith-unreviewed',
      source_id: 'hadith-source-fixture',
      review_role: 'primary',
      review_status: 'passed',
      artifact_sha256: sourceChecksum,
      reviewer_id: 'reviewer-primary',
      reviewed_at: '2026-11-04T00:00:00.000Z',
      text_match: true,
      reference_match: true
    }
  ]);

  const translationText = 'সমস্ত প্রশংসা আল্লাহর জন্য।';
  await db('hadith_translations').insert({
    id: 'fixture-translation-1',
    hadith_id: 'fixture-hadith-1',
    source_id: 'hadith-translation-fixture',
    locale: 'bn',
    translator_name: 'Fixture Translator',
    translation_text: translationText,
    license_id: 'TEST-TRANSLATION-NOT-A-LICENSE',
    text_sha256: digest(translationText)
  });

  const books = await app.inject({ method: 'GET', url: '/api/v1/hadith/books' });
  assert.equal(books.statusCode, 200);
  assert.equal(JSON.parse(books.body).data[0].id, 'fixture-book');
  assert.equal(JSON.parse(books.body).data[0].provenance.approvalStatus, 'approved');
  assert.equal(JSON.parse(books.body).data[0].provenance.reviewer, 'test-reviewer');
  assert.equal(JSON.parse(books.body).data[0].provenance.reviewedAt, '2026-11-03T12:34:56.000Z');
  assert.equal(JSON.parse(books.body).data[0].provenance.approvedByAuthority, 'test-source-authority');
  assert.equal(JSON.parse(books.body).data[0].provenance.approvedAt, '2026-11-04T00:00:00.000Z');

  const chapters = await app.inject({ method: 'GET', url: '/api/v1/hadith/books/fixture-book/chapters' });
  assert.equal(chapters.statusCode, 200);
  assert.equal(JSON.parse(chapters.body).data[0].titleBengali, 'পরীক্ষামূলক অধ্যায়');

  const records = await app.inject({ method: 'GET', url: '/api/v1/hadith/books/fixture-book/records?locale=bn' });
  assert.equal(records.statusCode, 200);
  const recordBody = JSON.parse(records.body);
  assert.equal(recordBody.data.length, 1, 'a primary review alone must not publish a record');
  assert.equal(recordBody.data[0].arabicText, verifiedText);
  assert.equal(recordBody.data[0].provenance.reviewer, 'test-reviewer');
  assert.equal(recordBody.data[0].provenance.reviewedAt, '2026-11-03T12:34:56.000Z');
  assert.equal(recordBody.data[0].provenance.approvedByAuthority, 'test-source-authority');
  assert.equal(recordBody.data[0].provenance.approvedAt, '2026-11-04T00:00:00.000Z');
  assert.equal(recordBody.data[0].translations[0].text, translationText);
  assert.equal(recordBody.data[0].translations[0].provenance.contentType, 'translation');
  assert.equal(recordBody.data[0].translations[0].provenance.reviewer, 'test-reviewer');
  assert.equal(recordBody.data[0].translations[0].provenance.reviewedAt, '2026-11-03T13:45:00.000Z');
  assert.equal(recordBody.data[0].translations[0].provenance.approvedByAuthority, 'test-translation-authority');
  assert.equal(recordBody.data[0].translations[0].provenance.approvedAt, '2026-11-04T01:00:00.000Z');

  const byId = await app.inject({ method: 'GET', url: '/api/v1/hadith/records/fixture-hadith-1?locale=bn' });
  assert.equal(byId.statusCode, 200);
  assert.equal(JSON.parse(byId.body).data.translations.length, 1);

  const arabicSearch = await app.inject({ method: 'GET', url: '/api/v1/hadith/search?q=%D8%A7%D9%84%D8%AD%D9%85%D8%AF&locale=ar' });
  assert.equal(arabicSearch.statusCode, 200);
  assert.equal(JSON.parse(arabicSearch.body).data.length, 1);

  const bengaliSearch = await app.inject({ method: 'GET', url: '/api/v1/hadith/search?q=%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%B6%E0%A6%82%E0%A6%B8%E0%A6%BE&locale=bn' });
  assert.equal(bengaliSearch.statusCode, 200);
  assert.equal(JSON.parse(bengaliSearch.body).data.length, 1);

  await db('content_sources').where({ id: 'hadith-translation-fixture' }).update({ reviewer: 'test-translation-authority' });
  const sameTranslationReviewer = await app.inject({ method: 'GET', url: '/api/v1/hadith/records/fixture-hadith-1?locale=bn' });
  assert.equal(sameTranslationReviewer.statusCode, 200);
  assert.equal(JSON.parse(sameTranslationReviewer.body).data.translations.length, 0, 'translation source and approval reviewers must be independent');
  await db('content_sources').where({ id: 'hadith-translation-fixture' }).update({ reviewer: 'test-reviewer' });

  await db('hadith_records').where({ id: 'fixture-hadith-1' }).update({ text_sha256: '0'.repeat(64) });
  const corrupt = await app.inject({ method: 'GET', url: '/api/v1/hadith/records/fixture-hadith-1' });
  assert.equal(corrupt.statusCode, 502);
  assert.equal(JSON.parse(corrupt.body).error.code, 'INTEGRITY_REJECTED');

  await db('content_source_approvals').where({ id: 'hadith-source-approval' }).update({ artifact_sha256: '0'.repeat(64) });
  const mismatchedSource = await app.inject({ method: 'GET', url: '/api/v1/hadith/books' });
  assert.equal(mismatchedSource.statusCode, 503, 'a checksum-mismatched source approval must fail closed');

  await db('content_source_approvals').where({ id: 'hadith-source-approval' }).update({ artifact_sha256: sourceChecksum });
  await db('content_sources').where({ id: 'hadith-source-fixture' }).update({ reviewer: 'test-source-authority' });
  const sameSourceReviewer = await app.inject({ method: 'GET', url: '/api/v1/hadith/books' });
  assert.equal(sameSourceReviewer.statusCode, 503, 'source reviewer and approval reviewer must be independent');

  await db('content_sources').where({ id: 'hadith-source-fixture' }).update({ reviewer: 'test-reviewer' });
  await db('content_source_approvals').where({ id: 'hadith-source-approval' }).update({ reviewer_id: 'project-owner-chat-authorization' });
  const reservedReviewer = await app.inject({ method: 'GET', url: '/api/v1/hadith/books' });
  assert.equal(reservedReviewer.statusCode, 503, 'the reserved project-owner authorization identity must never approve Hadith sources');

  await db('content_source_approvals').where({ id: 'hadith-source-approval' }).update({ reviewer_id: 'test-source-authority' });
  await db('hadith_record_reviews').where({ id: 'review-independent-1' }).update({ reviewer_id: 'REVIEWER-PRIMARY' });
  const caseFoldedDuplicateReviewers = await app.inject({ method: 'GET', url: '/api/v1/hadith/records/fixture-hadith-1' });
  assert.equal(caseFoldedDuplicateReviewers.statusCode, 404, 'reviewer identities differing only by case are not independent');

  await db('hadith_record_reviews').where({ id: 'review-independent-1' }).update({ reviewer_id: 'project-owner-chat-authorization' });
  const reservedRecordReviewer = await app.inject({ method: 'GET', url: '/api/v1/hadith/records/fixture-hadith-1' });
  assert.equal(reservedRecordReviewer.statusCode, 404, 'reserved project-owner identity cannot perform independent narration review');

  await db('hadith_record_reviews').where({ id: 'review-independent-1' }).update({ reviewer_id: 'reviewer-independent' });

  await db('hadith_record_reviews').where({ id: 'review-independent-1' }).update({ source_id: 'unrelated-source' });
  const mismatchedIndependentReviewSource = await app.inject({ method: 'GET', url: '/api/v1/hadith/records/fixture-hadith-1' });
  assert.equal(mismatchedIndependentReviewSource.statusCode, 404, 'independent review must be bound to the exact Hadith source');
  await db('hadith_record_reviews').where({ id: 'review-independent-1' }).update({ source_id: 'hadith-source-fixture' });

  await db('hadith_record_reviews').where({ id: 'review-primary-1' }).update({ source_id: 'unrelated-source' });
  const mismatchedPrimaryReviewSource = await app.inject({ method: 'GET', url: '/api/v1/hadith/records/fixture-hadith-1' });
  assert.equal(mismatchedPrimaryReviewSource.statusCode, 404, 'primary review must be bound to the exact Hadith source');
  await db('hadith_record_reviews').where({ id: 'review-primary-1' }).update({ source_id: 'hadith-source-fixture' });

  await db('content_sources').where({ id: 'hadith-source-fixture' }).update({ reviewer: 'project-owner-chat-authorization' });
  const reservedSourceReviewer = await app.inject({ method: 'GET', url: '/api/v1/hadith/books' });
  assert.equal(reservedSourceReviewer.statusCode, 503, 'reserved project-owner identity cannot register a Hadith source review');
});
