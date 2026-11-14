# Backend runtime configuration

The backend reads its runtime settings from environment variables. Copy `.env.example` to a local `.env` file and provide deployment-specific values; do not commit the local file.

## Server

- `PORT`: TCP port from 1 through 65535. Defaults to `4000`.
- `HOST`: bind address. Defaults to `0.0.0.0`.
- `NODE_ENV`: set to `production` in production deployments.

Numeric settings must be positive safe integers. Invalid values stop startup rather than silently falling back.

## Browser origins

- `CORS_ALLOWED_ORIGINS` or `CORS_ORIGIN`: comma-separated exact origin allowlist.
- Production must set at least one exact deployed frontend origin; startup fails if both settings are missing or empty. The `http://localhost:3000` fallback is development-only.
- Requests without an `Origin` header are allowed for non-browser clients.
- Browser origins not present in the allowlist are rejected.

Do not use a wildcard origin for authenticated browser traffic. Set `CORS_ALLOWED_ORIGINS` to the exact deployed frontend origin(s), not the API origin.

## Rate limiting

- `RATE_LIMIT_MAX`: maximum requests per client in one window; defaults to `100`.
- `RATE_LIMIT_WINDOW_MS`: window duration in milliseconds; defaults to `60000` (one minute).

Both values must be positive safe integers. The same settings are available through `buildApp` options for isolated tests and embedded application instances. The current limiter is process-local; multi-instance deployments need a shared rate-limit store before relying on a cluster-wide quota.

## Database credentials

- `DATABASE_URL`: PostgreSQL connection string for the HTTP runtime. In production it must use a dedicated least-privilege role with SELECT on application tables and INSERT only on `problem_reports`; it must not write Quran/Hadith/content tables or read/update/delete support reports.
- `MIGRATION_DATABASE_URL`: separate PostgreSQL connection string for schema migrations. In production this must be configured; it must use the database owner/migration credential and must never be exposed to the HTTP runtime.
- `DB_CLIENT=pg`: optional explicit PostgreSQL driver selection. A supported PostgreSQL `DATABASE_URL` selects PostgreSQL even when `DB_CLIENT` is omitted.
- `DB_CLIENT=sqlite3`: development/test only. Production startup rejects SQLite.

The release command runs `npm run db:migrate` with `MIGRATION_DATABASE_URL`; the HTTP process then starts with `DATABASE_URL`, which must be read-only. Do not use the migration credential as the runtime credential. Keep both secrets in the hosting provider's secret environment store, never in source control or build logs.

Use a pooled Neon URL for the long-lived HTTP runtime if the hosting architecture needs connection pooling. Use a direct (non-pooled) URL for migrations. The migration CLI applies additive migrations in one database transaction, takes a PostgreSQL advisory lock, and validates required tables/columns. The problem-report migration grants only `INSERT` on `problem_reports` to existing `deenverse_runtime_ro` and `deenverse_api` roles; it does not grant writes on religious-content tables or report reads/updates/deletes. PostgreSQL readiness also verifies that the current runtime role has this report-only INSERT privilege. A successful build or SQLite test alone is not evidence that a hosted PostgreSQL instance is reachable; verify the deployment database with `/api/v1/ready`.

## Deployment lifecycle and probes

Use `/api/v1/health` for liveness and `/api/v1/ready` for readiness. Both probes bypass the public API rate limiter so a busy client cannot exhaust a shared quota and cause spurious restarts. Readiness still returns HTTP 503 when the database is disconnected or required schema tables are missing. Neither probe certifies that a corpus is approved, authentication is implemented, or all product features are ready. Avoid high-frequency public readiness polling: it checks the database on each request.

SIGTERM and SIGINT stop accepting HTTP requests, drain in-flight requests via Fastify, and then destroy the database pool. Shutdown has a ten-second deadline; configure the hosting platform's termination grace period above that deadline. A deadline overrun exits unsuccessfully rather than leaving a hung instance.

For reproducible installs, run `npm ci` in both the repository root and `backend/`. Both dependency graphs now have committed lockfiles. Keep Node.js 22 aligned with CI. The environment template is documentation, not an automatic `.env` loader: inject these variables through the host environment or a supported Node environment-file mechanism.

## Migration integrity

The migration CLI runs additive migrations in one database transaction. A failed migration rolls back newly applied DDL while preserving the prior schema/data. Partial legacy schemas require operator inspection; the CLI does not drop or invent replacement tables to conceal the problem. PostgreSQL release jobs use a transaction-scoped advisory lock to serialize migration checks and writes. Run release migrations with a finite hosting job timeout; database connectivity failures or long-held external locks must not leave a release job unbounded.

Readiness and migration completion both verify required table and column names from `src/db/schema-readiness.ts`. Update this registry with future schema migrations. These checks do not certify column types, constraints, corpus approval, or content authenticity. Probe at a modest interval (for example, 30 seconds), since readiness performs metadata queries against the database.
