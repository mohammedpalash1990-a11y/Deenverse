import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  test(`runtime closes its listener and database pool on ${signal}`, { timeout: 15_000 }, async () => {
    const child = spawn(process.execPath, ['--import', 'tsx', 'src/index.ts'], {
      env: {
        ...process.env,
        NODE_ENV: 'development',
        DATABASE_URL: '',
        DB_CLIENT: 'sqlite3',
        DB_FILENAME: ':memory:',
        DEENVERSE_SEED_TANZIL_UTHMANI: 'false',
        HOST: '127.0.0.1',
        PORT: '41987'
      },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let output = '';
    const exited = once(child, 'exit');
    try {
      await new Promise<void>((resolve, reject) => {
        child.once('error', reject);
        child.once('exit', () => reject(new Error('Process exited before listening: ' + output)));
        child.stdout.on('data', (chunk) => {
          output += chunk;
          if (output.includes('DEENVERSE backend listening')) resolve();
        });
        child.stderr.on('data', (chunk) => { output += chunk; });
      });
      child.kill(signal);
      const [code, exitSignal] = await exited;
      assert.equal(code, 0, output);
      assert.equal(exitSignal, null, 'Process should drain instead of being terminated by the signal');
    } finally {
      if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
    }
  });
}
