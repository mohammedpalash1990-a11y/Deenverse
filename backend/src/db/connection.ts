import knex, { Knex } from 'knex';

export interface DatabaseConfig {
  client?: 'sqlite3' | 'pg';
  connection?: string | { filename: string };
  useNullAsDefault?: boolean;
}

export function resolveDatabaseConfig(): DatabaseConfig {
  const databaseUrl = process.env.DATABASE_URL?.trim();
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
