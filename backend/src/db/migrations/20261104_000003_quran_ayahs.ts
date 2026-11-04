import { Knex } from 'knex';

/**
 * Stores Quran ayah text only when it is tied to a registered content source.
 * Approval is checked at read time; this migration inserts no religious text.
 */
export async function up(knex: Knex): Promise<void> {
  if (await knex.schema.hasTable('quran_ayahs')) return;

  await knex.schema.createTable('quran_ayahs', (table) => {
    table.increments('id').primary();
    table.integer('surah_number').notNullable().checkBetween([1, 114]);
    table.integer('ayah_number').notNullable().checkBetween([1, 286]);
    table.text('arabic').notNullable();
    table.string('text_sha256', 64).notNullable();
    table.string('source_id').notNullable()
      .references('id').inTable('content_sources').onDelete('RESTRICT');
    table.unique(['source_id', 'surah_number', 'ayah_number'], {
      indexName: 'quran_ayahs_source_surah_ayah_unique'
    });
    table.index(['surah_number', 'ayah_number'], 'quran_ayahs_lookup_idx');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('quran_ayahs');
}
