import { Knex } from 'knex';

/**
 * Stores a source-bound human-review decision for each Ayah.
 * This migration creates empty review metadata only; it imports no Quran text.
 */
export async function up(knex: Knex): Promise<void> {
  if (await knex.schema.hasTable('quran_ayah_reviews')) return;

  if (!(await knex.schema.hasTable('quran_ayahs'))) {
    throw new Error('Cannot add Ayah reviews before quran_ayahs exists.');
  }

  await knex.schema.createTable('quran_ayah_reviews', (table) => {
    table.increments('id').primary();
    table.string('source_id').notNullable()
      .references('id').inTable('content_sources').onDelete('RESTRICT');
    table.integer('surah_number').notNullable().checkBetween([1, 114]);
    table.integer('ayah_number').notNullable().checkBetween([1, 286]);
    table.string('review_status', 32).notNullable()
      .checkIn(['not_started', 'in_review', 'passed', 'failed', 'needs_second_review']);
    table.string('artifact_sha256', 64).notNullable();
    table.string('reviewer_id').notNullable();
    table.timestamp('reviewed_at').notNullable();
    table.boolean('text_match').notNullable().defaultTo(false);
    table.boolean('boundary_match').notNullable().defaultTo(false);
    table.string('second_review_status', 32).nullable()
      .checkIn(['passed', 'failed', 'needs_second_review']);
    table.string('second_reviewer_id').nullable();
    table.timestamp('second_reviewed_at').nullable();
    table.text('issue_note').nullable();
    table.unique(['source_id', 'surah_number', 'ayah_number'], {
      indexName: 'quran_ayah_reviews_source_surah_ayah_unique'
    });
    table.foreign(['source_id', 'surah_number', 'ayah_number'])
      .references(['source_id', 'surah_number', 'ayah_number'])
      .inTable('quran_ayahs')
      .onDelete('RESTRICT');
    table.index(['review_status', 'artifact_sha256'], 'quran_ayah_reviews_gate_idx');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('quran_ayah_reviews');
}
