import fastify, { FastifyInstance, FastifyError } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { randomUUID } from 'crypto';
import { Knex } from 'knex';
import { QuranCatalogueService } from './services/quran-catalogue.js';
import { QuranAyahService } from './services/quran-ayah.js';
import { quranRoutes } from './routes/quran.js';
import { quranAyahRoutes } from './routes/quran-ayah.js';
import { quranTranslationRoutes } from './routes/quran-translation.js';
import { QuranEncBengaliTranslationService } from './services/quran-translation.js';
import { ApiErrorResponse } from './types/content.js';
import { quranReviewRoutes } from './routes/quran-review.js';

export interface BuildAppOptions {
  db: Knex;
  enableRateLimit?: boolean;
  allowedOrigins?: string[];
  rateLimitMax?: number;
  rateLimitWindowMs?: number;
  quranTranslationFetcher?: typeof fetch;
}

export function buildApp(opts: BuildAppOptions): FastifyInstance {
  const { db, enableRateLimit = true, allowedOrigins = [], rateLimitMax = 100, rateLimitWindowMs = 60_000 } = opts;
  if (!Number.isSafeInteger(rateLimitMax) || rateLimitMax < 1) throw new Error('rateLimitMax must be a positive safe integer.');
  if (!Number.isSafeInteger(rateLimitWindowMs) || rateLimitWindowMs < 1) throw new Error('rateLimitWindowMs must be a positive safe integer.');

  const app = fastify({
    genReqId: () => `req_${randomUUID().replace(/-/g, '')}`,
    logger: false
  });

  app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:']
      }
    }
  });

  const environmentOrigins = (process.env.CORS_ALLOWED_ORIGINS || process.env.CORS_ORIGIN || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const trustedOrigins = new Set([...allowedOrigins, ...environmentOrigins]);
  app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (trustedOrigins.has(origin)) return cb(null, true);
      return cb(new Error('Origin not allowed by CORS'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  });

  app.setErrorHandler((error: FastifyError, request, reply) => {
    const statusCode = error.message === 'Origin not allowed by CORS' ? 403 : error.statusCode || 500;
    const code = statusCode === 401 ? 'UNAUTHENTICATED'
      : statusCode === 403 ? 'FORBIDDEN'
        : statusCode === 404 ? 'NOT_FOUND'
          : statusCode === 429 ? 'RATE_LIMITED'
            : statusCode === 400 || statusCode === 422 ? 'VALIDATION_ERROR'
              : statusCode >= 400 && statusCode < 500 ? 'VALIDATION_ERROR'
                : 'INTERNAL_ERROR';
    const retryable = code === 'RATE_LIMITED' || statusCode >= 500;
    const message = code === 'INTERNAL_ERROR'
      ? 'An internal error occurred. Please try again.'
      : error.message === 'Origin not allowed by CORS'
        ? 'Cross-origin request blocked by security policy.'
        : code === 'RATE_LIMITED'
          ? 'Too many requests. Please slow down and try again later.'
          : error.message;

    const response: ApiErrorResponse = {
      error: { code, message, requestId: request.id, details: [], retryable }
    };
    reply.status(statusCode).send(response);
  });

  app.setNotFoundHandler((request, reply) => {
    const response: ApiErrorResponse = {
      error: {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found.',
        requestId: request.id,
        details: [],
        retryable: false
      }
    };
    reply.status(404).send(response);
  });

  const quranCatalogueService = new QuranCatalogueService(db);
  const quranAyahService = new QuranAyahService(db);
  const quranTranslationService = new QuranEncBengaliTranslationService(opts.quranTranslationFetcher);

  // Keep the rate limiter and its routes in one Fastify encapsulation scope.
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
            requestId: request.id,
            details: [],
            retryable: true
          }
        })
      });
    }

    api.get('/api/v1/health', async (request) => ({
      status: 'healthy',
      probe: 'liveness',
      timestamp: new Date().toISOString(),
      requestId: request.id
    }));

    api.get('/api/v1/ready', async (request, reply) => {
      try {
        await db.raw('SELECT 1');
        const requiredTables = ['content_sources', 'content_source_approvals', 'quran_surahs', 'quran_ayahs', 'quran_ayah_reviews', 'quran_review_batches', 'quran_review_invites', 'quran_review_submissions'];
        const present = await Promise.all(requiredTables.map((table) => db.schema.hasTable(table)));
        if (!present.every(Boolean)) {
          const response: ApiErrorResponse = {
            error: {
              code: 'UNAVAILABLE',
              message: 'Database schema is not fully migrated.',
              requestId: request.id,
              details: [],
              retryable: true
            }
          };
          return reply.status(503).send(response);
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
        const response: ApiErrorResponse = {
          error: {
            code: 'UNAVAILABLE',
            message: 'Database connection failed.',
            requestId: request.id,
            details: [],
            retryable: true
          }
        };
        return reply.status(503).send(response);
      }
    });

    api.register(quranRoutes, {
      prefix: '/api/v1/quran',
      catalogueService: quranCatalogueService
    });
    api.register(quranAyahRoutes, {
      prefix: '/api/v1/ayah',
      ayahService: quranAyahService
    });
    api.register(quranReviewRoutes, { prefix: '/api/v1/quran', db });
    api.register(quranTranslationRoutes, {
      prefix: '/api/v1/translation',
      translationService: quranTranslationService
    });
  });

  return app;
}
