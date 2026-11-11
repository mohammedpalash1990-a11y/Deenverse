import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { buildApp } from '../src/app.js';
import { createDatabaseConnection } from '../src/db/connection.js';
import { runMigrations } from '../src/db/migrate.js';

const db = createDatabaseConnection({ client: 'sqlite3', connection: ':memory:' });
const app = buildApp({ db, enableRateLimit: false });

before(async () => {
  await runMigrations(db);
});

after(async () => {
  await app.close();
  await db.destroy();
});

test('accepts a problem report and does not mutate religious content tables', async () => {
  const contentCountsBefore = {
    surahs: Number(await db('quran_surahs').count('* as count').first().then((row) => row?.count)),
    ayahs: Number(await db('quran_ayahs').count('* as count').first().then((row) => row?.count)),
    hadith: Number(await db('hadith_records').count('* as count').first().then((row) => row?.count))
  };

  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/problem-reports',
    payload: {
      category: 'quran',
      description: 'The Bengali explanation for this Ayah is difficult to understand.',
      stepsToReproduce: 'Open the Quran section and select the relevant Ayah.',
      currentSection: 'Quran',
      appVersion: '0.1.0',
      surahNumber: 2,
      ayahNumber: 5
    }
  });

  assert.equal(response.statusCode, 201);
  assert.equal(response.json().data.status, 'received');
  const stored = await db('problem_reports').where({ id: response.json().data.id }).first();
  assert.equal(stored.category, 'quran');
  assert.equal(stored.surah_number, 2);
  assert.equal(stored.ayah_number, 5);
  assert.equal(stored.status, 'new');
  assert.equal(stored.diagnostics, null);

  assert.deepEqual({
    surahs: Number(await db('quran_surahs').count('* as count').first().then((row) => row?.count)),
    ayahs: Number(await db('quran_ayahs').count('* as count').first().then((row) => row?.count)),
    hadith: Number(await db('hadith_records').count('* as count').first().then((row) => row?.count))
  }, contentCountsBefore);
});

test('stores diagnostics only when explicitly supplied', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/problem-reports',
    payload: {
      category: 'bug',
      description: 'The settings screen does not save the selected option.',
      currentSection: 'Settings',
      appVersion: '0.1.0',
      diagnostics: '{"browser":"test-browser"}'
    }
  });

  assert.equal(response.statusCode, 201);
  const stored = await db('problem_reports').where({ id: response.json().data.id }).first();
  assert.equal(stored.diagnostics, '{"browser":"test-browser"}');
});

test('rejects short descriptions, incomplete Ayah references, and non-Quran Ayah references', async () => {
  const beforeCount = Number(await db('problem_reports').count('* as count').first().then((row) => row?.count));

  const invalidPayloads = [
    {
      category: 'quran',
      description: 'Too short',
      currentSection: 'Quran',
      appVersion: '0.1.0'
    },
    {
      category: 'quran',
      description: 'A report with an incomplete Ayah reference.',
      currentSection: 'Quran',
      appVersion: '0.1.0',
      surahNumber: 2
    },
    {
      category: 'bug',
      description: 'A bug report must not carry Quran coordinates.',
      currentSection: 'Settings',
      appVersion: '0.1.0',
      surahNumber: 2,
      ayahNumber: 5
    }
  ];

  for (const payload of invalidPayloads) {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/problem-reports',
      payload
    });
    assert.equal(response.statusCode, 400);
    assert.equal(response.json().error.code, 'VALIDATION_ERROR');
  }

  assert.equal(
    Number(await db('problem_reports').count('* as count').first().then((row) => row?.count)),
    beforeCount
  );
});

test('rejects out-of-range references and oversized fields', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/problem-reports',
    payload: {
      category: 'quran',
      description: 'This report contains an invalid Surah number.',
      currentSection: 'Quran',
      appVersion: '0.1.0',
      surahNumber: 115,
      ayahNumber: 1
    }
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.json().error.code, 'VALIDATION_ERROR');
});
