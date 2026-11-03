import knex, { Knex } from 'knex';

export interface DatabaseConfig {
  client?: 'sqlite3' | 'pg';
  connection?: string | { filename: string };
  useNullAsDefault?: boolean;
}

export function resolveDatabaseConfig(): DatabaseConfig {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl && (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://'))) {
    return {
      client: 'pg',
      connection: databaseUrl
    };
  }

  const client = (process.env.DB_CLIENT as 'sqlite3' | 'pg') || 'sqlite3';
  if (client === 'pg') {
    return {
      client: 'pg',
      connection: databaseUrl || 'postgresql://localhost:5432/deenverse'
    };
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
