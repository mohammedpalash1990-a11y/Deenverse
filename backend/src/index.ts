import { buildApp } from './app.js';
import { createDatabaseConnection, resolveDatabaseConfig } from './db/connection.js';
import { seedTanzilUthmaniFromOfficialSource } from './db/seed-tanzil.js';
import { resolveCorsOrigins } from './cors-config.js';

function readPositiveInteger(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new Error(name + ' must be a positive safe integer.');
  }
  return value;
}

const PORT = readPositiveInteger('PORT', 4000);
if (PORT > 65_535) throw new Error('PORT must not exceed 65535.');
const RATE_LIMIT_MAX = readPositiveInteger('RATE_LIMIT_MAX', 100);
const RATE_LIMIT_WINDOW_MS = readPositiveInteger('RATE_LIMIT_WINDOW_MS', 60_000);
const HOST = process.env.HOST || '0.0.0.0';

async function main(): Promise<void> {
  const databaseConfig = resolveDatabaseConfig();
  if (process.env.NODE_ENV === 'production' && databaseConfig.client !== 'pg') {
    throw new Error('Production requires PostgreSQL. Set DATABASE_URL to a PostgreSQL connection string; SQLite is development/test only.');
  }

  const corsOrigins = resolveCorsOrigins();
  const db = createDatabaseConnection(databaseConfig);
  if (process.env.DEENVERSE_SEED_TANZIL_UTHMANI === 'true') {
    try {
      await seedTanzilUthmaniFromOfficialSource(db);
    } catch (error) {
      await db.destroy();
      throw error;
    }
  }
  const app = buildApp({
    db,
    allowedOrigins: corsOrigins,
    rateLimitMax: RATE_LIMIT_MAX,
    rateLimitWindowMs: RATE_LIMIT_WINDOW_MS
  });

  // Drain HTTP requests before releasing the database pool.
  app.addHook('onClose', async () => { await db.destroy(); });
  let shuttingDown = false;
  const shutdown = async (): Promise<void> => {
    if (shuttingDown) return;
    shuttingDown = true;
    const deadline = setTimeout(() => {
      console.error('DEENVERSE shutdown deadline exceeded.');
      process.exit(1);
    }, 10_000);
    deadline.unref();
    try {
      await app.close();
    } catch {
      console.error('Failed to shut down DEENVERSE backend cleanly.');
      process.exitCode = 1;
    } finally {
      clearTimeout(deadline);
      process.removeListener('SIGTERM', shutdown);
      process.removeListener('SIGINT', shutdown);
    }
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  try {
    const address = await app.listen({ port: PORT, host: HOST });
    console.log(`DEENVERSE backend listening at ${address}`);
  } catch (error) {
    await shutdown();
    console.error('Failed to start DEENVERSE backend:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

if (process.env.NODE_ENV !== 'test') {
  main().catch((error: unknown) => {
    console.error('Failed to start DEENVERSE backend:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
