import knex, { Knex } from 'knex';

export interface DatabaseConfig {
  client?: 'sqlite3' | 'pg';
  connection?: string | { filename: string };
  useNullAsDefault?: boolean;
}

export function resolveDatabaseConfig(databaseUrlOverride?: string): DatabaseConfig {
  const databaseUrl = (databaseUrlOverride ?? process.env.DATABASE_URL)?.trim();
  const requestedClient = process.env.DB_CLIENT?.trim();

  if (requestedClient && requestedClient !== 'sqlite3' && requestedClient !== 'pg') {
    throw new Error("DB_CLIENT must be either 'sqlite3' or 'pg'.");
  }

  if (databaseUrl) {
    if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
      throw new Error('DATABASE_URL must use the postgresql:// or postgres:// scheme.');
    }
    return {
      client: 'pg',
      connection: databaseUrl
    };
  }

  const client = requestedClient || 'sqlite3';
  if (client === 'pg') {
    throw new Error('DATABASE_URL is required when DB_CLIENT=pg.');
  }

  return {
    client: 'sqlite3',
    connection: { filename: process.env.DB_FILENAME || ':memory:' },
    useNullAsDefault: true
  };
}

/**
 * Resolve the optional support-report writer connection.
 *
 * The HTTP content connection remains read-only. In production, report writes
 * must use a distinct PostgreSQL role with INSERT on problem_reports only.
 */
export function resolveReportsDatabaseConfig(): DatabaseConfig | undefined {
  const reportDatabaseUrl = process.env.REPORTS_DATABASE_URL?.trim();
  if (!reportDatabaseUrl) return undefined;

  const config = resolveDatabaseConfig(reportDatabaseUrl);
  if (process.env.NODE_ENV === 'production') {
    if (config.client !== 'pg') {
      throw new Error('Production report storage requires a PostgreSQL REPORTS_DATABASE_URL.');
    }

    const runtimeDatabaseUrl = process.env.DATABASE_URL?.trim();
    if (!runtimeDatabaseUrl) {
      throw new Error('DATABASE_URL is required when REPORTS_DATABASE_URL is configured in production.');
    }

    let runtimeUsername: string;
    let reportUsername: string;
    try {
      runtimeUsername = decodeURIComponent(new URL(runtimeDatabaseUrl).username);
      reportUsername = decodeURIComponent(new URL(reportDatabaseUrl).username);
    } catch {
      throw new Error('DATABASE_URL and REPORTS_DATABASE_URL must be valid PostgreSQL URLs in production.');
    }

    if (!runtimeUsername || !reportUsername || runtimeUsername === reportUsername) {
      throw new Error('REPORTS_DATABASE_URL must use a dedicated PostgreSQL role distinct from DATABASE_URL.');
    }
  }

  return config;
}

export function createDatabaseConnection(config?: Partial<DatabaseConfig>): Knex {
  const resolved = config || resolveDatabaseConfig();
  const isSqlite = !resolved.client || resolved.client === 'sqlite3';

  return knex({
    client: isSqlite ? 'sqlite3' : 'pg',
    connection: isSqlite
      ? typeof resolved.connection === 'string'
        ? { filename: resolved.connection }
        : resolved.connection || { filename: ':memory:' }
      : resolved.connection,
    useNullAsDefault: isSqlite
  });
}
