import { buildApp } from './app.js';
import { createDatabaseConnection } from './db/connection.js';

const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function main() {
  const dbClient = process.env.DB_CLIENT || 'sqlite3';
  if (dbClient !== 'sqlite3') {
    throw new Error(
      'PostgreSQL runtime is not configured yet. Use DB_CLIENT=sqlite3 until the PostgreSQL driver, connection handling, and migrations are implemented.'
    );
  }

  const db = createDatabaseConnection({
    client: 'sqlite3',
    connection: process.env.DB_FILENAME || './deenverse.sqlite'
  });

  const app = buildApp({ db });

  try {
    const address = await app.listen({ port: PORT, host: HOST });
    console.log(`DEENVERSE backend listening at ${address}`);
  } catch (err) {
    await app.close();
    await db.destroy();
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  main().catch((error: unknown) => {
    console.error('Failed to start DEENVERSE backend:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
