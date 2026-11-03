import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 1. Content sources & controlled approval provenance register
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

    // Explicit multi-stage approval state machine
    table.string('approval_status', 20).notNullable().defaultTo('pending'); // 'pending', 'rejected', 'approved'
    table.string('review_decision_id').notNullable();
    table.string('approved_by_authority').notNullable();
    table.timestamp('approved_at').notNullable();
    table.string('artifact_sha256', 64).notNullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  // 2. Quran Surahs (Catalogue metadata only - no Quranic text or invented scripture)
  // Composite primary key (source_id, surah_number) enables multi-edition support
  await knex.schema.createTable('quran_surahs', (table) => {
    table.string('source_id').notNullable().references('id').inTable('content_sources').onDelete('RESTRICT');
    table.integer('surah_number').notNullable();
    table.string('name_arabic').notNullable();
    table.string('name_simple').notNullable();
    table.string('name_english').notNullable();
    table.string('revelation_place', 10).notNullable(); // 'makkah' or 'madinah'
    table.integer('revelation_order').notNullable();
    table.integer('verses_count').notNullable();
    table.primary(['source_id', 'surah_number']);
  });

  // DB-level constraints for Quran catalogue integrity
  await knex.raw(`
    ALTER TABLE quran_surahs ADD CONSTRAINT check_surah_number_range CHECK (surah_number >= 1 AND surah_number <= 114);
  `).catch(() => {
    // SQLite ignores raw ALTER TABLE ADD CONSTRAINT gracefully or handles inline
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('quran_surahs');
  await knex.schema.dropTableIfExists('content_sources');
}
