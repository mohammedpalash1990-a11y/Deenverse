import fastify, { FastifyInstance, FastifyError } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { randomUUID } from 'crypto';
import { Knex } from 'knex';
import { QuranCatalogueService } from './services/quran-catalogue.js';
import { quranRoutes } from './routes/quran.js';
import { INITIAL_SCHEMA_MIGRATION } from './db/migrate.js';
import { ApiErrorResponse } from './types/content.js';

export interface BuildAppOptions {
  db: Knex;
  enableRateLimit?: boolean;
  allowedOrigins?: string[];
  rateLimitMax?: number;
  rateLimitWindowMs?: number;
}

export function buildApp(opts: BuildAppOptions): FastifyInstance {
  const { db, enableRateLimit = true, allowedOrigins = [], rateLimitMax = 100, rateLimitWindowMs = 60_000 } = opts;

  if (!Number.isSafeInteger(rateLimitMax) || rateLimitMax < 1) {
    throw new Error('rateLimitMax must be a positive safe integer.');
  }
  if (!Number.isSafeInteger(rateLimitWindowMs) || rateLimitWindowMs < 1) {
    throw new Error('rateLimitWindowMs must be a positive safe integer.');
  }

  const app = fastify({
    genReqId: () => `req_${randomUUID().replace(/-/g, '')}`,
    logger: false
  });

  // Security Headers
  app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:']
      }
    }
  });

  // Strict CORS configuration with explicit allowlist
  app.register(cors, {
    origin: (origin: string | undefined, cb: (err: Error | null, allow: boolean) => void) => {
      // Requests without origin header (e.g. curl, server-to-server, mobile apps) are allowed
      if (!origin) {
        return cb(null, true);
      }

      // Check against explicit allowedOrigins list
      if (allowedOrigins.includes(origin)) {
        return cb(null, true);
      }

      // Deny untrusted origins
      return cb(new Error('Origin not allowed by CORS'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  });

  // Rate Limiting
  if (enableRateLimit) {
    app.register(rateLimit, {
      max: rateLimitMax,
      timeWindow: rateLimitWindowMs,
      errorResponseBuilder: (request, context) => ({
        statusCode: 429,
        error: 'Too Many Requests',
        message: `Rate limit exceeded, retry in ${context.after}`,
        date: Date.now(),
        expiresIn: context.ttl
      })
    });
  }

  // Consistent Error Handler
  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error.message === 'Origin not allowed by CORS') {
      const errResponse: ApiErrorResponse = {
        error: {
          code: 'FORBIDDEN',
          message: 'Cross-origin request blocked by security policy.',
          retryable: false
        }
      };
      return reply.status(403).send(errResponse);
    }

    const statusCode = error.statusCode || 500;

    if (statusCode === 429) {
      const errResponse: ApiErrorResponse = {
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please slow down and try again later.',
          retryable: true
        }
      };
      return reply.status(429).send(errResponse);
    }

    const isClientError = statusCode >= 400 && statusCode < 500;

    const errorResponse: ApiErrorResponse = {
      error: {
        code: isClientError ? 'INVALID_QUERY' : 'INTERNAL_ERROR',
        message: isClientError ? error.message : 'An internal error occurred. Please try again.',
        retryable: statusCode >= 500
      }
    };

    reply.status(statusCode).send(errorResponse);
  });

  // Core Service instances
  const quranCatalogueService = new QuranCatalogueService(db);

  // Register routes after plugins are initialized
  app.after(() => {
    // Liveness probe (indicates server process is up and responding)
    app.get('/api/v1/health', async (request, reply) => {
      return {
        status: 'ok',
        probe: 'liveness',
        timestamp: new Date().toISOString(),
        requestId: request.id
      };
    });

    // Readiness probe (verifies database connectivity and migration state)
    app.get('/api/v1/ready', async (request, reply) => {
      try {
        // 1. Check basic DB connectivity
        await db.raw('SELECT 1');

        // 2. Check that critical migration tables exist
        const hasContentSources = await db.schema.hasTable('content_sources');
        const hasQuranSurahs = await db.schema.hasTable('quran_surahs');
        const hasMigrationLedger = await db.schema.hasTable('schema_migrations');

        if (!hasContentSources || !hasQuranSurahs || !hasMigrationLedger) {
          const errResponse: ApiErrorResponse = {
            error: {
              code: 'UNAVAILABLE',
              message: 'Database schema is not fully migrated.',
              retryable: true
            }
          };
          return reply.status(503).send(errResponse);
        }

        const initialMigration = await db('schema_migrations')
          .where({ name: INITIAL_SCHEMA_MIGRATION })
          .first();

        if (!initialMigration) {
          const errResponse: ApiErrorResponse = {
            error: {
              code: 'UNAVAILABLE',
              message: 'Required database migrations have not been applied.',
              retryable: true
            }
          };
          return reply.status(503).send(errResponse);
        }

        return {
          status: 'ready',
          probe: 'readiness',
          database: 'connected',
          migrations: 'applied',
          timestamp: new Date().toISOString(),
          requestId: request.id
        };
      } catch (err: any) {
        const errResponse: ApiErrorResponse = {
          error: {
            code: 'UNAVAILABLE',
            message: 'Database connection failed.',
            retryable: true
          }
        };
        return reply.status(503).send(errResponse);
      }
    });

    // Register Quran routes
    app.register(quranRoutes, {
      prefix: '/api/v1/quran',
      catalogueService: quranCatalogueService
    });
  });

  return app;
}
