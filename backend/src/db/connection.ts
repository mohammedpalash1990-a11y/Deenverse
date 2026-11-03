import knex, { Knex } from 'knex';

export interface DatabaseConfig {
  client: 'sqlite3' | 'pg';
  connection: string | { filename: string };
  useNullAsDefault?: boolean;
}

export function createDatabaseConnection(config?: Partial<DatabaseConfig>): Knex {
  const isSqlite = !config?.client || config.client === 'sqlite3';

  return knex({
    client: isSqlite ? 'sqlite3' : 'pg',
    connection: isSqlite
      ? { filename: typeof config?.connection === 'string' ? config.connection : ':memory:' }
      : config?.connection,
    useNullAsDefault: isSqlite
  });
}
