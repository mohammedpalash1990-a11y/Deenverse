# Backend runtime configuration

The backend reads its runtime settings from environment variables. Copy `.env.example` to a local `.env` file and provide deployment-specific values; do not commit the local file.

## Server

- `PORT`: TCP port from 1 through 65535. Defaults to `4000`.
- `HOST`: bind address. Defaults to `0.0.0.0`.
- `NODE_ENV`: set to `production` in production deployments.

Numeric settings must be positive safe integers. Invalid values stop startup rather than silently falling back.

## Browser origins

- `CORS_ORIGIN`: comma-separated exact origin allowlist.
- Requests without an `Origin` header are allowed for non-browser clients.
- Browser origins not present in the allowlist are rejected.

Do not use a wildcard origin for authenticated browser traffic.

## Rate limiting

- `RATE_LIMIT_MAX`: maximum requests per client in one window; defaults to `100`.
- `RATE_LIMIT_WINDOW_MS`: window duration in milliseconds; defaults to `60000` (one minute).

Both values must be positive safe integers. The same settings are available through `buildApp` options for isolated tests and embedded application instances. The current limiter is process-local; multi-instance deployments need a shared rate-limit store before relying on a cluster-wide quota.

## Database

- `DB_CLIENT=sqlite3` uses SQLite and defaults to an in-memory database unless `DB_FILENAME` is set.
- `DB_CLIENT=pg` requires an explicit `DATABASE_URL` using `postgresql://` or `postgres://`.
- A supported PostgreSQL `DATABASE_URL` selects PostgreSQL even when `DB_CLIENT` is omitted.
- Unsupported clients and URL schemes fail closed.

The backend runtime and migration CLI support PostgreSQL through Knex and the `pg` driver. Production startup rejects SQLite. Set `NODE_ENV=production` and `DATABASE_URL` to a PostgreSQL connection string. Run `npm run db:migrate` from `backend/` as a release step before starting the service. The migration CLI applies the same additive schema migrations to SQLite in development and PostgreSQL in production. A successful TypeScript build or SQLite test run alone is not evidence that a particular hosted PostgreSQL instance is reachable; verify the deployment database with `/api/v1/ready`.
