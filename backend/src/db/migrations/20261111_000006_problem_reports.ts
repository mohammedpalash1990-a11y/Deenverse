import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  if (await knex.schema.hasTable('problem_reports')) return;

  await knex.schema.createTable('problem_reports', (table) => {
    table.string('id', 36).primary();
    table.string('category', 40).notNullable().checkIn([
      'bug', 'audio', 'quran', 'hadith_dua', 'feature', 'suggestion'
    ]);
    table.text('description').notNullable();
    table.text('steps_to_reproduce').nullable();
    table.string('current_section', 100).notNullable();
    table.string('app_version', 30).notNullable();
    table.integer('surah_number').nullable().checkBetween([1, 114]);
    table.integer('ayah_number').nullable().checkBetween([1, 286]);
    table.text('diagnostics').nullable();
    table.string('status', 20).notNullable().defaultTo('new').checkIn([
      'new', 'reviewed', 'resolved'
    ]);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.index(['status', 'created_at'], 'problem_reports_status_created_idx');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('problem_reports');
}
