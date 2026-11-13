import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCorsOrigins } from '../src/cors-config.js';

test('CORS origin configuration', async (t) => {
  await t.test('requires an explicit browser origin allowlist in production', () => {
    assert.throws(
      () => resolveCorsOrigins({
        nodeEnv: 'production',
        corsAllowedOrigins: '',
        corsOrigin: ''
      }),
      /Production requires CORS_ALLOWED_ORIGINS or CORS_ORIGIN/
    );
  });

  await t.test('uses the configured production allowlist and normalizes origin-only values', () => {
    assert.deepEqual(
      resolveCorsOrigins({
        nodeEnv: 'production',
        corsAllowedOrigins: ' https://app.example.test/ , https://admin.example.test '
      }),
      ['https://app.example.test', 'https://admin.example.test']
    );
  });

  await t.test('prefers CORS_ALLOWED_ORIGINS over the CORS_ORIGIN alias', () => {
    assert.deepEqual(
      resolveCorsOrigins({
        nodeEnv: 'production',
        corsAllowedOrigins: 'https://app.example.test',
        corsOrigin: 'https://legacy.example.test'
      }),
      ['https://app.example.test']
    );
  });

  await t.test('uses the CORS_ORIGIN alias when the primary setting is empty', () => {
    assert.deepEqual(
      resolveCorsOrigins({
        nodeEnv: 'production',
        corsAllowedOrigins: '',
        corsOrigin: 'https://app.example.test'
      }),
      ['https://app.example.test']
    );
  });

  await t.test('retains the localhost default outside production', () => {
    assert.deepEqual(
      resolveCorsOrigins({
        nodeEnv: 'development',
        corsAllowedOrigins: '',
        corsOrigin: ''
      }),
      ['http://localhost:3000']
    );
  });

  await t.test('deduplicates equivalent origins', () => {
    assert.deepEqual(
      resolveCorsOrigins({
        nodeEnv: 'production',
        corsAllowedOrigins: 'https://app.example.test, https://app.example.test/'
      }),
      ['https://app.example.test']
    );
  });

  await t.test('rejects non-origin CORS entries', () => {
    for (const value of [
      '*',
      'https://*.example.test',
      'https://app.example.test/path',
      'https://user:secret@app.example.test',
      'ftp://app.example.test',
      'not-a-url',
      'https://app.example.test?token=secret',
      'https://app.example.test#fragment'
    ]) {
      assert.throws(
        () => resolveCorsOrigins({
          nodeEnv: 'production',
          corsAllowedOrigins: value,
          corsOrigin: ''
        }),
        /CORS allowlist entries/
      );
    }
  });
});
