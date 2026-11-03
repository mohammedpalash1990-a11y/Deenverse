import { Knex } from 'knex';

/**
 * Add the explicit source-approval gate without rewriting an existing
 * content_sources/quran_surahs schema created by the original migration.
 */
export async function up(knex: Knex): Promise<void> {
  if (await knex.schema.hasTable('content_source_approvals')) return;

  if (!(await knex.schema.hasTable('content_sources'))) {
    throw new Error('Cannot add source approvals before content_sources exists.');
  }

  await knex.schema.createTable('content_source_approvals', (table) => {
    table.string('id').primary();
    table.string('source_id').notNullable().unique().references('id').inTable('content_sources').onDelete('RESTRICT');
    table.string('decision', 20).notNullable();
    table.string('reviewer_id').notNullable();
    table.timestamp('approved_at').notNullable();
    table.string('artifact_sha256', 64).notNullable();
    table.text('review_notes').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('content_source_approvals');
}
