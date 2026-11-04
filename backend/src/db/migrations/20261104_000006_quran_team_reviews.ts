import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('quran_review_batches', (table) => {
    table.string('id').primary();
    table.string('source_id').notNullable().references('id').inTable('content_sources').onDelete('RESTRICT');
    table.integer('surah_number').notNullable().checkBetween([1, 114]);
    table.integer('ayah_number').notNullable().checkBetween([1, 286]);
    table.string('artifact_sha256', 64).notNullable();
    table.string('created_by').notNullable();
    table.timestamp('created_at').notNullable();
    table.timestamp('expires_at').notNullable();
    table.index(['source_id', 'surah_number', 'ayah_number'], 'quran_review_batches_ayah_idx');
  });

  await knex.schema.createTable('quran_review_invites', (table) => {
    table.string('token_hash', 64).primary();
    table.string('batch_id').notNullable().references('id').inTable('quran_review_batches').onDelete('CASCADE');
    table.string('reviewer_label').notNullable();
    table.timestamp('created_at').notNullable();
    table.timestamp('expires_at').notNullable();
    table.timestamp('submitted_at').nullable();
    table.unique(['batch_id', 'reviewer_label']);
  });

  await knex.schema.createTable('quran_review_submissions', (table) => {
    table.string('id').primary();
    table.string('token_hash', 64).notNullable().unique()
      .references('token_hash').inTable('quran_review_invites').onDelete('CASCADE');
    table.string('reviewer_name').notNullable();
    table.string('decision', 24).notNullable().checkIn(['passed', 'failed', 'needs_correction']);
    table.boolean('text_match').notNullable();
    table.boolean('reference_match').notNullable();
    table.text('issue_note').nullable();
    table.timestamp('submitted_at').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('quran_review_submissions');
  await knex.schema.dropTableIfExists('quran_review_invites');
  await knex.schema.dropTableIfExists('quran_review_batches');
}
