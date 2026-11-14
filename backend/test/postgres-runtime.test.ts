import assert from 'node:assert/strict';
import test from 'node:test';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDatabaseConnection } from '../src/db/connection.js';
import { runMigrations } from '../src/db/migrate.js';
import { hasRequiredSchema } from '../src/db/schema-readiness.js';

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

async function reservePort(): Promise<number> {
  const server = createServer();
  await new Promise<void>((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  const address = server.address();
  if (!address || typeof address === 'string') {
    await new Promise<void>((resolveClose) => server.close(() => resolveClose()));
    throw new Error('Could not reserve a local port for the PostgreSQL runtime test.');
  }
  await new Promise<void>((resolveClose) => server.close(() => resolveClose()));
  return address.port;
}

test('PostgreSQL migrations and production runtime are verified against a real PostgreSQL service', {
  skip: !testDatabaseUrl
}, async () => {
  if (!testDatabaseUrl) throw new Error('TEST_DATABASE_URL must be configured by the PostgreSQL CI service.');

  const databaseUrl = new URL(testDatabaseUrl);
  const databaseName = decodeURIComponent(databaseUrl.pathname.replace(/^\/+/, ''));
  assert.match(databaseName, /_test$/, 'TEST_DATABASE_URL must point to a database ending in _test.');

  const db = createDatabaseConnection({ client: 'pg', connection: testDatabaseUrl });
  let child: ReturnType<typeof spawn> | undefined;
  let childStdout = '';
  let childStderr = '';

  try {
    await db.raw('SELECT 1');
    await db.schema.dropTableIfExists('problem_reports');
    await db.schema.dropTableIfExists('hadith_record_reviews');
    await db.schema.dropTableIfExists('hadith_grade_assessments');
    await db.schema.dropTableIfExists('hadith_translations');
    await db.schema.dropTableIfExists('hadith_records');
    await db.schema.dropTableIfExists('hadith_chapters');
    await db.schema.dropTableIfExists('hadith_books');
    await db.schema.dropTableIfExists('quran_ayah_reviews');
    await db.schema.dropTableIfExists('quran_ayahs');
    await db.schema.dropTableIfExists('content_source_approvals');
    await db.schema.dropTableIfExists('quran_surahs');
    await db.schema.dropTableIfExists('content_sources');

    // A late schema failure must roll back transactional DDL in PostgreSQL,
    // preserve pre-existing rows, and release the migration advisory lock.
    await db.schema.createTable('hadith_chapters', (table) => { table.string('id').primary(); });
    await db('hadith_chapters').insert({ id: 'synthetic-preserved-row' });
    await assert.rejects(() => runMigrations(db), /Partial Hadith schema detected/);
    assert.equal(await db.schema.hasTable('content_sources'), false);
    assert.equal(await db.schema.hasTable('quran_ayahs'), false);
    assert.deepEqual(await db('hadith_chapters').select('id'), [{ id: 'synthetic-preserved-row' }]);
    await db.schema.dropTable('hadith_chapters');

    // Concurrent release jobs serialize on the transaction-scoped PG lock.
    await Promise.all([runMigrations(db), runMigrations(db)]);

    // Create the runtime roles after the report table exists, then rerun the
    // idempotent migration runner to prove it applies the narrow grants later.
    await db.raw(`
      DO $deenverse$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'deenverse_runtime_ro') THEN
          CREATE ROLE deenverse_runtime_ro LOGIN PASSWORD 'deenverse-test-password';
        ELSE
          ALTER ROLE deenverse_runtime_ro LOGIN PASSWORD 'deenverse-test-password';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'deenverse_api') THEN
          CREATE ROLE deenverse_api NOLOGIN;
        END IF;
      END
      $deenverse$;
    `);
    const runtimeDatabaseUrl = new URL(testDatabaseUrl);
    runtimeDatabaseUrl.username = 'deenverse_runtime_ro';
    runtimeDatabaseUrl.password = 'deenverse-test-password';
    await db.raw('GRANT USAGE ON SCHEMA public TO deenverse_runtime_ro');
    await db.raw('GRANT USAGE ON SCHEMA public TO deenverse_api');

    // Simulate Neon default privileges: new tables receive SELECT for the
    // runtime roles. The report migration must revoke that broad default and
    // leave only INSERT on the support-report table.
    await db.raw('GRANT SELECT ON ALL TABLES IN SCHEMA public TO deenverse_runtime_ro');
    await db.raw('GRANT SELECT ON ALL TABLES IN SCHEMA public TO deenverse_api');
    await runMigrations(db);
    assert.equal(await db.schema.hasTable('content_sources'), true);
    assert.equal(await db.schema.hasTable('quran_surahs'), true);
    assert.equal(await db.schema.hasTable('quran_ayahs'), true);
    assert.equal(await db.schema.hasTable('quran_ayah_reviews'), true);
    assert.equal(await db.schema.hasTable('content_source_approvals'), true);
    assert.equal(await db.schema.hasTable('problem_reports'), true);
    const reportRolePrivileges = await db.raw(`
      SELECT
        has_table_privilege('deenverse_runtime_ro', 'public.problem_reports', 'INSERT') AS runtime_can_insert_report,
        has_table_privilege('deenverse_runtime_ro', 'public.problem_reports', 'SELECT') AS runtime_can_select_report,
        has_table_privilege('deenverse_runtime_ro', 'public.problem_reports', 'UPDATE') AS runtime_can_update_report,
        has_table_privilege('deenverse_runtime_ro', 'public.problem_reports', 'DELETE') AS runtime_can_delete_report,
        has_table_privilege('deenverse_runtime_ro', 'public.content_sources', 'INSERT') AS runtime_can_insert_content,
        has_table_privilege('deenverse_api', 'public.problem_reports', 'INSERT') AS api_can_insert_report,
        has_table_privilege('deenverse_api', 'public.problem_reports', 'SELECT') AS api_can_select_report,
        has_table_privilege('deenverse_api', 'public.content_sources', 'INSERT') AS api_can_insert_content
    `);
    assert.deepEqual(reportRolePrivileges.rows[0], {
      runtime_can_insert_report: true,
      runtime_can_select_report: false,
      runtime_can_update_report: false,
      runtime_can_delete_report: false,
      runtime_can_insert_content: false,
      api_can_insert_report: true,
      api_can_select_report: false,
      api_can_insert_content: false
    });

    await db.raw('REVOKE INSERT ON TABLE public.problem_reports FROM deenverse_runtime_ro');
    const runtimeNotReady = await db.transaction(async (transaction) => {
      await transaction.raw('SET LOCAL ROLE deenverse_runtime_ro');
      return hasRequiredSchema(transaction);
    });
    assert.equal(runtimeNotReady, false, 'readiness must fail when the runtime role cannot submit reports');

    await db.raw('GRANT INSERT ON TABLE public.problem_reports TO deenverse_runtime_ro');
    const runtimeReady = await db.transaction(async (transaction) => {
      await transaction.raw('SET LOCAL ROLE deenverse_runtime_ro');
      return hasRequiredSchema(transaction);
    });
    assert.equal(runtimeReady, true, 'readiness must pass after the report-only INSERT grant is restored');

    await assert.doesNotReject(() => runMigrations(db), 'PostgreSQL migrations must be safe to rerun.');

    const port = await reservePort();
    const backendDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
    child = spawn(process.execPath, ['--import', 'tsx', 'src/index.ts'], {
      cwd: backendDirectory,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        DB_CLIENT: 'pg',
        DATABASE_URL: runtimeDatabaseUrl.toString(),
        HOST: '127.0.0.1',
        PORT: String(port),
        CORS_ALLOWED_ORIGINS: 'http://127.0.0.1'
      },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    child.stdout?.setEncoding('utf8');
    child.stderr?.setEncoding('utf8');
    child.stdout?.on('data', (chunk: string) => { childStdout += chunk; });
    child.stderr?.on('data', (chunk: string) => { childStderr += chunk; });

    const deadline = Date.now() + 15_000;
    let readiness: Response | undefined;
    while (Date.now() < deadline) {
      if (child.exitCode !== null) break;
      try {
        readiness = await fetch(`http://127.0.0.1:${port}/api/v1/ready`, { signal: AbortSignal.timeout(2_000) });
        if (readiness.status === 200) break;
      } catch {
        // The child may still be opening its PostgreSQL pool and HTTP listener.
      }
      await delay(150);
    }

    assert.ok(
      readiness,
      `Production PostgreSQL process did not answer readiness. stdout: ${childStdout}\nstderr: ${childStderr}`
    );
    assert.equal(readiness.status, 200, childStderr);
    const body = await readiness.json() as { status?: string; database?: string; migrations?: string };
    assert.equal(body.status, 'ready');
    assert.equal(body.database, 'connected');
    assert.equal(body.migrations, 'applied');
    assert.match(childStdout, /DEENVERSE backend listening/);

    const reportResponse = await fetch(`http://127.0.0.1:${port}/api/v1/problem-reports`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        category: 'bug',
        description: 'The PostgreSQL runtime role can submit this support report.',
        currentSection: 'Settings',
        appVersion: 'postgres-runtime-test'
      }),
      signal: AbortSignal.timeout(5_000)
    });
    const reportResponseText = await reportResponse.text();
    assert.equal(reportResponse.status, 201, reportResponseText);
    const reportBody = JSON.parse(reportResponseText) as { data?: { id?: string; status?: string } };
    assert.equal(reportBody.data?.status, 'received');
    const storedReport = await db('problem_reports').where({ id: reportBody.data?.id }).first();
    assert.equal(storedReport?.category, 'bug');
    assert.equal(storedReport?.status, 'new');
  } finally {
    if (child && child.exitCode === null && child.signalCode === null) {
      const childExit = once(child, 'exit');
      child.kill('SIGTERM');
      const exitedGracefully = await Promise.race([
        childExit.then(() => true),
        delay(5_000).then(() => false)
      ]);
      if (!exitedGracefully && child.exitCode === null && child.signalCode === null) {
        child.kill('SIGKILL');
        const exitedAfterKill = await Promise.race([
          childExit.then(() => true),
          delay(5_000).then(() => false)
        ]);
        assert.equal(exitedAfterKill, true, 'PostgreSQL runtime child did not exit after SIGKILL.');
      }
    }
    await db.schema.dropTableIfExists('problem_reports');
    await db.schema.dropTableIfExists('hadith_record_reviews');
    await db.schema.dropTableIfExists('hadith_grade_assessments');
    await db.schema.dropTableIfExists('hadith_translations');
    await db.schema.dropTableIfExists('hadith_records');
    await db.schema.dropTableIfExists('hadith_chapters');
    await db.schema.dropTableIfExists('hadith_books');
    await db.schema.dropTableIfExists('quran_ayah_reviews');
    await db.schema.dropTableIfExists('quran_ayahs');
    await db.schema.dropTableIfExists('content_source_approvals');
    await db.schema.dropTableIfExists('quran_surahs');
    await db.schema.dropTableIfExists('content_sources');
    await db.raw('DROP ROLE IF EXISTS deenverse_runtime_ro');
    await db.raw('DROP ROLE IF EXISTS deenverse_api');
    await db.destroy();
  }
});
