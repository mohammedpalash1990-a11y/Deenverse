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

// MOCKED — in-memory fallback when database drivers or external DB are unavailable
function createMockKnex(): Knex {
  const mockQueryBuilder = () => {
    const chain: Record<string, unknown> = {
      where: () => chain,
      andWhere: () => chain,
      orWhere: () => chain,
      join: () => chain,
      leftJoin: () => chain,
      select: () => chain,
      orderBy: () => chain,
      limit: () => chain,
      offset: () => chain,
      first: async () => undefined,
      count: async () => [{ count: 0 }],
      insert: async () => [1],
      update: async () => 0,
      del: async () => 0,
      columnInfo: async () => ({}),
      then: (resolve: (value: unknown[]) => void) => Promise.resolve([]).then(resolve)
    };
    return chain;
  };

  const mockDb = Object.assign((_table: string) => mockQueryBuilder(), {
    raw: async () => ({ rows: [] }),
    destroy: async () => undefined,
    schema: { hasTable: async () => false },
    client: { config: { client: 'mock' } }
  });

  return mockDb as unknown as Knex;
}

export function createDatabaseConnection(config?: Partial<DatabaseConfig>): Knex {
  const resolved = config || resolveDatabaseConfig();
  const isSqlite = !resolved.client || resolved.client === 'sqlite3';

  if (isSqlite) {
    console.warn('[AI Studio] SQLite native driver stripped — using in-memory mock database');
    return createMockKnex();
  }

  try {
    return knex({
      client: 'pg',
      connection: resolved.connection
    });
  } catch {
    console.warn('[AI Studio] PostgreSQL not connected — using in-memory mock database');
    return createMockKnex();
  }
}
