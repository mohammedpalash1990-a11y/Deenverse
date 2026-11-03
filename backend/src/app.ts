import fastify, { FastifyInstance, FastifyError } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { randomUUID } from 'crypto';
import { Knex } from 'knex';
import { QuranCatalogueService } from './services/quran-catalogue.js';
import { quranRoutes } from './routes/quran.js';
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
    origin: (origin, cb) => {
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

  // Register the rate limiter and API routes in the same encapsulation scope.
  // Fastify hooks are encapsulated; keeping these registrations together ensures
  // the global rate-limit hook applies to health, readiness, and Quran routes.
  app.register(async function registerApiRoutes(api) {
    if (enableRateLimit) {
      await api.register(rateLimit, {
        max: rateLimitMax,
        timeWindow: rateLimitWindowMs,
        global: true,
        errorResponseBuilder: (request, context) => ({
          statusCode: 429,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests. Please slow down and try again later.',
            retryable: true
          }
        })
      });
    }

    // Liveness probe (indicates server process is up and responding)
    api.get('/api/v1/health', async (request, reply) => {
      return {
        status: 'ok',
        probe: 'liveness',
        timestamp: new Date().toISOString(),
        requestId: request.id
      };
    });

    // Readiness probe (verifies database connectivity and migration state)
    api.get('/api/v1/ready', async (request, reply) => {
      try {
        await db.raw('SELECT 1');
        const hasContentSources = await db.schema.hasTable('content_sources');
        const hasQuranSurahs = await db.schema.hasTable('quran_surahs');

        if (!hasContentSources || !hasQuranSurahs) {
          const errResponse: ApiErrorResponse = {
            error: {
              code: 'UNAVAILABLE',
              message: 'Database schema is not fully migrated.',
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
      } catch {
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
    api.register(quranRoutes, {
      prefix: '/api/v1/quran',
      catalogueService: quranCatalogueService
    });
  });

  return app;
}
