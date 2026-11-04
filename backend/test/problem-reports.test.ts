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

test('accepts a problem report and stores it without a content approval workflow', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/problem-reports',
    payload: {
      category: 'quran',
      description: 'The Bengali explanation for this ayah is difficult to understand.',
      stepsToReproduce: 'Open Quran reader and select the ayah.',
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
});

test('rejects incomplete ayah references and short descriptions', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/problem-reports',
    payload: {
      category: 'quran',
      description: 'Wrong',
      currentSection: 'Quran',
      appVersion: '0.1.0',
      surahNumber: 2
    }
  });
  assert.equal(response.statusCode, 400);
  assert.equal(await db('problem_reports').count({ count: '*' }).first().then((row) => Number(row?.count)), 0);
});
