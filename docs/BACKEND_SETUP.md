# DEENVERSE — Backend Setup and Local Development Guide

## 1. Prerequisites

- **Node.js**: v22.x or higher
- **npm**: v10.x or higher
- **SQLite3**: used for local development and CI testing

## 2. Installation & Environment Configuration

1. Clone the repository and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Copy the sample environment file:
   ```bash
   cp .env.example .env
   ```
   Only placeholder/local values are present in `.env.example`. Never commit actual secrets or credentials.
3. Install dependencies:
   ```bash
   npm install
   ```

## 3. Running Database Migrations

Run database migrations to initialize or upgrade the SQLite schema:
```bash
npm run db:migrate
```

The migration command:
- creates the base schema for a fresh database;
- adds the source-approval table to an existing database that already has the base `content_sources` and `quran_surahs` tables;
- safely does nothing when the complete schema already exists;
- rejects a partial base schema so an operator can inspect it rather than guessing how to repair it.

The source-approval table is an additive migration; the original base schema migration remains limited to its original tables. The migration CLI currently supports SQLite only. PostgreSQL is not ready for production use. The API server does not silently run schema migrations at startup.

## 4. Running the Development Server

Start the Fastify server:
```bash
npm run dev
```

Or build and run the production bundle:
```bash
npm run build
npm start
```

The server binds to `http://0.0.0.0:4000`. Configure browser access with the exact comma-separated `CORS_ALLOWED_ORIGINS` allow-list.

Check health:
```bash
curl http://localhost:4000/api/v1/health
```

## 5. Running Automated Tests

Run the full test suite:
```bash
npm test
```

The suite includes Quran catalogue API behavior, validation, migration idempotency and upgrade paths, canonical API errors, and exact-origin CORS behavior. Treat actual command output as the test result; no result is pre-claimed here.
