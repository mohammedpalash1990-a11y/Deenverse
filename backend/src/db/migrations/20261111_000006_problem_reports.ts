import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('problem_reports'))) {
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

  // The HTTP runtime stays read-only for religious-content tables. Support
  // reports are the only write path exposed to the public runtime roles.
  // Reapply these narrow grants on every migration pass so a role created
  // after the table can still receive the required INSERT privilege.
  if (knex.client.config.client === 'pg') {
    await knex.raw(`
      DO $deenverse$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'deenverse_runtime_ro') THEN
          GRANT INSERT ON TABLE public.problem_reports TO deenverse_runtime_ro;
        END IF;
        IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'deenverse_api') THEN
          GRANT INSERT ON TABLE public.problem_reports TO deenverse_api;
        END IF;
      END
      $deenverse$;
    `);
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('problem_reports');
}
