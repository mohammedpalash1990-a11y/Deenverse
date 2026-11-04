import { Knex } from 'knex';

/**
 * Hadith library storage foundation.
 * This migration creates empty structures only; it imports no Hadith text,
 * translation, grading, or sample religious content.
 */
export async function up(knex: Knex): Promise<void> {
  const tables = ['hadith_books', 'hadith_chapters', 'hadith_records', 'hadith_translations', 'hadith_grade_assessments', 'hadith_record_reviews'];
  const existing = await Promise.all(tables.map((name) => knex.schema.hasTable(name)));
  if (existing.every(Boolean)) return;
  if (existing.some(Boolean)) {
    throw new Error('Partial Hadith schema detected. Inspect hadith_* tables before retrying migration.');
  }

  await knex.schema.createTable('hadith_books', (table) => {
    table.string('id').primary();
    table.string('source_id').notNullable().references('id').inTable('content_sources').onDelete('RESTRICT');
    table.string('slug').notNullable();
    table.string('title_arabic').notNullable();
    table.string('title_english').nullable();
    table.string('title_bengali').nullable();
    table.string('compiler_name').nullable();
    table.string('collection_type', 40).notNullable();
    table.string('edition').notNullable();
    table.integer('sort_order').notNullable().defaultTo(0);
    table.unique(['source_id', 'slug']);
    table.unique(['id', 'source_id']);
    table.index(['sort_order', 'slug'], 'hadith_books_sort_idx');
  });

  await knex.schema.createTable('hadith_chapters', (table) => {
    table.string('id').primary();
    table.string('book_id').notNullable();
    table.string('source_id').notNullable().references('id').inTable('content_sources').onDelete('RESTRICT');
    table.foreign(['book_id', 'source_id']).references(['id', 'source_id']).inTable('hadith_books').onDelete('RESTRICT');
    table.unique(['id', 'book_id']);
    table.string('chapter_number').notNullable();
    table.string('title_arabic').nullable();
    table.string('title_english').nullable();
    table.string('title_bengali').nullable();
    table.integer('sort_order').notNullable().defaultTo(0);
    table.unique(['book_id', 'chapter_number']);
    table.index(['book_id', 'sort_order'], 'hadith_chapters_book_sort_idx');
  });

  await knex.schema.createTable('hadith_records', (table) => {
    table.string('id').primary();
    table.string('book_id').notNullable();
    table.string('chapter_id').nullable();
    table.string('source_id').notNullable().references('id').inTable('content_sources').onDelete('RESTRICT');
    table.foreign(['book_id', 'source_id']).references(['id', 'source_id']).inTable('hadith_books').onDelete('RESTRICT');
    table.foreign(['chapter_id', 'book_id']).references(['id', 'book_id']).inTable('hadith_chapters').onDelete('RESTRICT');
    table.unique(['id', 'source_id']);
    table.string('hadith_number').notNullable();
    table.string('numbering_system').notNullable();
    table.text('arabic_text').notNullable();
    table.text('narrator_text').nullable();
    table.text('isnad_text').nullable();
    table.text('source_reference').notNullable();
    table.string('text_sha256', 64).notNullable();
    table.unique(['source_id', 'book_id', 'numbering_system', 'hadith_number']);
    table.index(['book_id', 'chapter_id'], 'hadith_records_book_chapter_idx');
    table.index(['source_id', 'text_sha256'], 'hadith_records_source_digest_idx');
  });

  await knex.schema.createTable('hadith_translations', (table) => {
    table.string('id').primary();
    table.string('hadith_id').notNullable();
    table.string('source_id').notNullable().references('id').inTable('content_sources').onDelete('RESTRICT');
    table.foreign(['hadith_id', 'source_id']).references(['id', 'source_id']).inTable('hadith_records').onDelete('RESTRICT');
    table.string('locale', 12).notNullable();
    table.string('translator_name').notNullable();
    table.text('translation_text').notNullable();
    table.string('license_id').notNullable();
    table.string('text_sha256', 64).notNullable();
    table.unique(['hadith_id', 'locale', 'source_id']);
    table.index(['locale', 'hadith_id'], 'hadith_translations_locale_idx');
  });

  await knex.schema.createTable('hadith_grade_assessments', (table) => {
    table.string('id').primary();
    table.string('hadith_id').notNullable();
    table.string('source_id').notNullable().references('id').inTable('content_sources').onDelete('RESTRICT');
    table.foreign(['hadith_id', 'source_id']).references(['id', 'source_id']).inTable('hadith_records').onDelete('RESTRICT');
    table.string('grade', 40).notNullable();
    table.string('grading_authority').notNullable();
    table.string('grading_work').notNullable();
    table.string('grading_reference').notNullable();
    table.text('assessment_note').nullable();
    table.string('assessment_sha256', 64).notNullable();
    table.timestamp('assessed_at').nullable();
    table.index(['hadith_id', 'grade'], 'hadith_grade_assessments_hadith_grade_idx');
  });

  await knex.schema.createTable('hadith_record_reviews', (table) => {
    table.string('id').primary();
    table.string('hadith_id').notNullable().references('id').inTable('hadith_records').onDelete('RESTRICT');
    table.string('source_id').notNullable().references('id').inTable('content_sources').onDelete('RESTRICT');
    table.string('review_role', 20).notNullable().checkIn(['primary', 'independent']);
    table.string('review_status', 32).notNullable().checkIn(['in_review', 'passed', 'failed', 'needs_correction']);
    table.string('artifact_sha256', 64).notNullable();
    table.string('reviewer_id').notNullable();
    table.timestamp('reviewed_at').notNullable();
    table.boolean('text_match').notNullable().defaultTo(false);
    table.boolean('reference_match').notNullable().defaultTo(false);
    table.text('issue_note').nullable();
    table.unique(['hadith_id', 'review_role']);
    table.index(['review_status', 'artifact_sha256'], 'hadith_record_reviews_gate_idx');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('hadith_record_reviews');
  await knex.schema.dropTableIfExists('hadith_grade_assessments');
  await knex.schema.dropTableIfExists('hadith_translations');
  await knex.schema.dropTableIfExists('hadith_records');
  await knex.schema.dropTableIfExists('hadith_chapters');
  await knex.schema.dropTableIfExists('hadith_books');
}
