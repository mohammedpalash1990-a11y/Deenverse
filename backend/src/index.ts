import { buildApp } from './app.js';
import { createDatabaseConnection } from './db/connection.js';

const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const CORS_ORIGIN = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:3000'];

async function main() {
  const db = createDatabaseConnection();

  const app = buildApp({
    db,
    allowedOrigins: CORS_ORIGIN
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
