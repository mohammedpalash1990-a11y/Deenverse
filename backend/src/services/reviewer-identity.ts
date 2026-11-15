import type { Knex } from 'knex';

const REVIEWER_WHITESPACE_CHARACTERS =
  ' \t\n\v\f\r\u0085\u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff';

export const RESERVED_REVIEWER_IDENTITY = 'project-owner-chat-authorization';

export function reviewerIdentitySql(db: Knex, column: string): { sql: string; bindings: string[] } {
  const client = db.client.config.client;
  const trimFunction = client === 'pg' ? 'BTRIM' : client === 'sqlite3' ? 'TRIM' : null;

  if (!trimFunction) {
    throw new Error(`Unsupported database client for reviewer identity checks: ${String(client)}`);
  }

  return {
    sql: `LOWER(${trimFunction}(COALESCE(??, ''), ?))`,
    bindings: [column, REVIEWER_WHITESPACE_CHARACTERS]
  };
}
