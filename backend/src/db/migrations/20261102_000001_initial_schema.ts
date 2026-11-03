import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 1. Content sources & provenance register
  await knex.schema.createTable('content_sources', (table) => {
    table.string('id').primary();
    table.string('code').notNullable().unique();
    table.string('name').notNullable();
    table.string('content_type', 30).notNullable(); // 'quran', 'translation', 'tafsir', 'hadith', 'dua', 'audio'
    table.string('edition').notNullable();
    table.text('source_url').notNullable();
    table.string('attribution').notNullable();
    table.string('license_id').notNullable();
    table.boolean('redistribution_allowed').notNullable().defaultTo(false);
    table.string('reviewer').notNullable();
    table.timestamp('reviewed_at').notNullable();
    table.string('checksum').notNullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  // 2. Quran Surahs (Catalogue metadata only - no Quranic text or invented scripture)
  await knex.schema.createTable('quran_surahs', (table) => {
    table.integer('surah_number').primary().checkBetween([1, 114]);
    table.string('name_arabic').notNullable();
    table.string('name_simple').notNullable();
    table.string('name_english').notNullable();
    table.string('revelation_place').notNullable().checkIn(['makkah', 'madinah']); // 'makkah' or 'madinah'
    table.integer('revelation_order').notNullable();
    table.integer('verses_count').notNullable();
    table.string('source_id').notNullable().references('id').inTable('content_sources').onDelete('RESTRICT');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('quran_surahs');
  await knex.schema.dropTableIfExists('content_sources');
}
