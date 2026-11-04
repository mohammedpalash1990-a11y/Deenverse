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
    await db.schema.dropTableIfExists('quran_ayahs');
    await db.schema.dropTableIfExists('content_source_approvals');
    await db.schema.dropTableIfExists('quran_surahs');
    await db.schema.dropTableIfExists('content_sources');

    await runMigrations(db);
    assert.equal(await db.schema.hasTable('content_sources'), true);
    assert.equal(await db.schema.hasTable('quran_surahs'), true);
    assert.equal(await db.schema.hasTable('quran_ayahs'), true);
    assert.equal(await db.schema.hasTable('content_source_approvals'), true);

    await assert.doesNotReject(() => runMigrations(db), 'PostgreSQL migrations must be safe to rerun.');

    const port = await reservePort();
    const backendDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
    child = spawn(process.execPath, ['--import', 'tsx', 'src/index.ts'], {
      cwd: backendDirectory,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        DB_CLIENT: 'pg',
        DATABASE_URL: testDatabaseUrl,
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
        readiness = await fetch(`http://127.0.0.1:${port}/api/v1/ready`);
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
  } finally {
    if (child && child.exitCode === null && child.signalCode === null) {
      child.kill('SIGTERM');
      await Promise.race([once(child, 'exit'), delay(5_000)]);
      if (child.exitCode === null && child.signalCode === null) {
        child.kill('SIGKILL');
        await once(child, 'exit');
      }
    }
    await db.schema.dropTableIfExists('content_source_approvals');
    await db.schema.dropTableIfExists('quran_surahs');
    await db.schema.dropTableIfExists('content_sources');
    await db.destroy();
  }
});
