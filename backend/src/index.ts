import { buildApp } from './app.js';
import { createDatabaseConnection } from './db/connection.js';

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
const CORS_ORIGIN = (process.env.CORS_ALLOWED_ORIGINS || process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

async function main(): Promise<void> {
  const dbClient = process.env.DB_CLIENT || 'sqlite3';
  if (dbClient !== 'sqlite3') {
    throw new Error('PostgreSQL runtime is not configured yet. Use DB_CLIENT=sqlite3 until the PostgreSQL driver, connection handling, and migrations are implemented.');
  }

  const db = createDatabaseConnection({
    client: 'sqlite3',
    connection: process.env.DB_FILENAME || './deenverse.sqlite'
  });
  const app = buildApp({
    db,
    allowedOrigins: CORS_ORIGIN,
    rateLimitMax: RATE_LIMIT_MAX,
    rateLimitWindowMs: RATE_LIMIT_WINDOW_MS
  });

  try {
    const address = await app.listen({ port: PORT, host: HOST });
    console.log(`DEENVERSE backend listening at ${address}`);
  } catch (error) {
    await app.close();
    await db.destroy();
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
