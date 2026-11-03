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
if (PORT > 65_535) {
  throw new Error('PORT must not exceed 65535.');
}
const RATE_LIMIT_MAX = readPositiveInteger('RATE_LIMIT_MAX', 100);
const RATE_LIMIT_WINDOW_MS = readPositiveInteger('RATE_LIMIT_WINDOW_MS', 60_000);
const HOST = process.env.HOST || '0.0.0.0';
const CORS_ORIGIN = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:3000'];

async function main() {
  const db = createDatabaseConnection();

  const app = buildApp({
    db,
    allowedOrigins: CORS_ORIGIN,
    rateLimitMax: RATE_LIMIT_MAX,
    rateLimitWindowMs: RATE_LIMIT_WINDOW_MS
  });

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
