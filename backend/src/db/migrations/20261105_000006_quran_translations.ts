import { Knex } from 'knex';

/**
 * Stores verbatim Quran translations separately from Arabic ayah text.
 * Every translation remains linked to its registered publisher/source.
 */
export async function up(knex: Knex): Promise<void> {
  if (await knex.schema.hasTable('quran_translations')) return;

  await knex.schema.createTable('quran_translations', (table) => {
    table.increments('id').primary();
    table.integer('surah_number').notNullable().checkBetween([1, 114]);
    table.integer('ayah_number').notNullable().checkBetween([1, 286]);
    table.string('locale', 12).notNullable();
    table.string('translator_name').notNullable();
    table.string('publisher').notNullable();
    table.string('edition_version', 40).notNullable();
    table.text('translation_text').notNullable();
    table.text('footnotes_json').nullable();
    table.string('text_sha256', 64).notNullable();
    table.string('source_id').notNullable()
      .references('id').inTable('content_sources').onDelete('RESTRICT');
    table.unique(['source_id', 'surah_number', 'ayah_number'], {
      indexName: 'quran_translations_source_surah_ayah_unique'
    });
    table.index(['locale', 'surah_number', 'ayah_number'], 'quran_translations_lookup_idx');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('quran_translations');
}
