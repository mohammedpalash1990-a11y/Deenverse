import { buildApp } from './app.js';
import { createDatabaseConnection } from './db/connection.js';

const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function main() {
  const db = createDatabaseConnection({
    client: (process.env.DB_CLIENT as 'sqlite3' | 'pg') || 'sqlite3',
    connection: process.env.DB_FILENAME || './deenverse.sqlite'
  });

  const app = buildApp({ db });

  try {
    const address = await app.listen({ port: PORT, host: HOST });
    console.log(`DEENVERSE backend listening at ${address}`);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  main();
}
