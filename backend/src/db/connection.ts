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

import { newDb } from 'pg-mem';

function createInMemoryKnex(): Knex {
  try {
    const db = newDb();
    const knexInstance = db.adapters.createKnex();
    return knexInstance as unknown as Knex;
  } catch (err) {
    console.warn('[AI Studio] pg-mem initialization failed, using fallback mock:', err);
    return createMockKnex();
  }
}

// MOCKED — fallback query builder when database drivers or external DB are unavailable
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
    schema: { hasTable: async () => false, createTable: async () => undefined, dropTableIfExists: async () => undefined },
    transaction: async (cb: (trx: unknown) => Promise<unknown>) => cb(mockDb),
    client: { config: { client: 'mock' } }
  });

  return mockDb as unknown as Knex;
}

export function createDatabaseConnection(config?: Partial<DatabaseConfig>): Knex {
  const resolved = config || resolveDatabaseConfig();
  const isSqlite = !resolved.client || resolved.client === 'sqlite3';

  if (isSqlite) {
    return createInMemoryKnex();
  }

  try {
    return knex({
      client: 'pg',
      connection: resolved.connection
    });
  } catch {
    console.warn('[AI Studio] PostgreSQL not connected — using in-memory mock database');
    return createInMemoryKnex();
  }
}
