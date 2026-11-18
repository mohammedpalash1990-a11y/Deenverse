import assert from 'node:assert/strict';
import test from 'node:test';
import { createDatabaseConnection } from '../src/db/connection.js';

test('SQLite connections use a real transactional database driver', async () => {
  const db = createDatabaseConnection({
    client: 'sqlite3',
    connection: ':memory:',
    useNullAsDefault: true
  });

  try {
    assert.equal(db.client.config.client, 'sqlite3');
    await db.schema.createTable('connection_probe', (table) => {
      table.string('id').primary();
    });
    await db('connection_probe').insert({ id: 'sqlite-driver-ready' });
    assert.deepEqual(await db('connection_probe').select('id'), [
      { id: 'sqlite-driver-ready' }
    ]);
    await assert.doesNotReject(() => db.transaction(async (transaction) => {
      await transaction('connection_probe').insert({ id: 'transaction-ready' });
    }));
  } finally {
    await db.destroy();
  }
});
