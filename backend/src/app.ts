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
}

export function buildApp(opts: BuildAppOptions): FastifyInstance {
  const { db, enableRateLimit = true } = opts;

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

  // CORS is opt-in: configure exact browser origins with CORS_ALLOWED_ORIGINS.
  // Requests without an Origin header (e.g. server-to-server/health probes) remain valid.
  const allowedOrigins = new Set(
    (process.env.CORS_ALLOWED_ORIGINS || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
  );
  app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      return cb(null, allowedOrigins.has(origin));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  });

  // Rate Limiting
  if (enableRateLimit) {
    app.register(rateLimit, {
      max: 100,
      timeWindow: '1 minute',
      errorResponseBuilder: (request, context) => ({
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please slow down and try again later.',
          retryable: true
        }
      })
    });
  }

  // Consistent Error Handler
  app.setErrorHandler((error: FastifyError, request, reply) => {
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

  // Health route
  app.get('/api/v1/health', async (request, reply) => {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      requestId: request.id
    };
  });

  // Register Quran routes
  app.register(quranRoutes, {
    prefix: '/api/v1/quran',
    catalogueService: quranCatalogueService
  });

  return app;
}
