# DEENVERSE — Backend Setup and Local Development Guide

## 1. Prerequisites

- **Node.js**: v22.x or higher
- **npm**: v10.x or higher
- **SQLite3**: Pre-installed on most UNIX systems (used for local development and CI testing)

## 2. Installation & Environment Configuration

1. Clone the repository and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Copy the sample environment file:
   ```bash
   cp .env.example .env
   ```
   *Note: Only placeholder values are present in `.env.example`. Never commit actual secrets or credentials.*

3. Install dependencies:
   ```bash
   npm install
   ```

## 3. Running Database Migrations

Run database migrations to initialize the schema (SQLite local development):
```bash
npm run db:migrate
```

The command creates the initial schema only when neither required table exists. Re-running it after a successful migration is safe. If only one required table exists, it stops with a partial-schema error instead of guessing how to repair the database. The migration CLI currently supports SQLite only; PostgreSQL configuration is intentionally not advertised as ready. The API server does not silently run schema migrations at startup.

## 4. Running the Development Server

To start the Fastify server:
```bash
npm run dev
```
Or build and run the production bundle:
```bash
npm run build
npm start
```
The server will bind to `http://0.0.0.0:4000`.

Check health:
```bash
curl http://localhost:4000/api/v1/health
```

## 5. Running Automated Tests

Run the full test suite using the Node.js test runner:
```bash
npm test
```

Expected output:
```
✔ Quran Catalogue API Integration
✔ Validation Service
✔ Database migration safety
ℹ tests 15
ℹ pass 15
ℹ fail 0
```
