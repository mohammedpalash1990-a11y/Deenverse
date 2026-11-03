import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

test('production backend startup fails closed before opening a SQLite database', () => {
  const directory = mkdtempSync(join(tmpdir(), 'deenverse-production-guard-'));
  const databasePath = join(directory, 'must-not-be-created.sqlite');
  const backendDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');

  try {
    const result = spawnSync(process.execPath, ['--import', 'tsx', 'src/index.ts'], {
      cwd: backendDirectory,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        DB_CLIENT: 'sqlite3',
        DB_FILENAME: databasePath,
        PORT: '3001'
      },
      encoding: 'utf8',
      timeout: 10_000
    });

    assert.notEqual(result.status, 0, 'production startup must be rejected');
    assert.match(
      result.stderr,
      /Production requires PostgreSQL. Set DATABASE_URL to a PostgreSQL connection string; SQLite is development\\/test only./
    );
    assert.equal(existsSync(databasePath), false, 'SQLite database must not be opened or created');
    assert.doesNotMatch(result.stdout + result.stderr, /DEENVERSE backend listening/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
