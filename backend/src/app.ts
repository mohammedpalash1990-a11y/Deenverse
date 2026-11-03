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
          requestId: request.id,
          details: [],
          retryable: true
        }
      })
    });
  }

  // Keep HTTP status semantics aligned with the shared API error contract.
  app.setErrorHandler((error: FastifyError, request, reply) => {
    const statusCode = error.statusCode || 500;
    const code = statusCode === 401 ? 'UNAUTHENTICATED'
      : statusCode === 403 ? 'FORBIDDEN'
        : statusCode === 404 ? 'NOT_FOUND'
          : statusCode === 429 ? 'RATE_LIMITED'
            : statusCode === 400 || statusCode === 422 ? 'VALIDATION_ERROR'
              : statusCode >= 400 && statusCode < 500 ? 'VALIDATION_ERROR'
                : 'INTERNAL_ERROR';
    const retryable = code === 'RATE_LIMITED' || statusCode >= 500;

    const errorResponse: ApiErrorResponse = {
      error: {
        code,
        message: statusCode >= 500 ? 'An internal error occurred. Please try again.' : error.message,
        requestId: request.id,
        details: [],
        retryable
      }
    };

    reply.status(statusCode).send(errorResponse);
  });

  // Unknown routes must use the same canonical error envelope as known routes.
  app.setNotFoundHandler((request, reply) => {
    const errorResponse: ApiErrorResponse = {
      error: {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found.',
        requestId: request.id,
        details: [],
        retryable: false
      }
    };
    reply.status(404).send(errorResponse);
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
