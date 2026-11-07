import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { QuranCatalogueService } from '../services/quran-catalogue.js';
import {
  PaginationQuerySchema,
  decodeCursor,
  encodeCursor
} from '../services/validation.js';
import { ApiSuccessResponse, ApiErrorResponse, SurahPayload, ContentRecord } from '../types/content.js';

export interface QuranRoutesOptions {
  catalogueService: QuranCatalogueService;
}

export const quranRoutes: FastifyPluginAsync<QuranRoutesOptions> = async (
  fastify: FastifyInstance,
  opts: QuranRoutesOptions
) => {
  const { catalogueService } = opts;

  // GET /api/v1/quran/surahs
  fastify.get('/surahs', async (request, reply) => {
    const queryValidation = PaginationQuerySchema.safeParse(request.query);
    if (!queryValidation.success) {
      const errResponse: ApiErrorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: queryValidation.error.issues.map((issue) => issue.message).join(', '),
          requestId: request.id,
          details: [],
          retryable: false
        }
      };
      return reply.status(400).send(errResponse);
    }

    const { limit, cursor } = queryValidation.data;
    const cursorScope = JSON.stringify(['quran', 'surahs', limit]);
    let offset: number;
    try {
      offset = decodeCursor(cursor, cursorScope);
    } catch {
      const errResponse: ApiErrorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Pagination cursor is invalid or belongs to a different query.',
          requestId: request.id,
          details: [],
          retryable: false
        }
      };
      return reply.status(400).send(errResponse);
    }

    const result = await catalogueService.listSurahs({ limit, offset });

    // Fail closed if no verified content source is available
    if (!result.hasApprovedSource) {
      const errResponse: ApiErrorResponse = {
        error: {
          code: 'CONTENT_UNAVAILABLE',
          message: 'Approved Quran catalogue metadata is not available.',
          requestId: request.id,
          details: [],
          retryable: false
        }
      };
      return reply.status(503).send(errResponse);
    }

    const nextOffset = offset + limit;
    const hasNext = nextOffset < result.total;

    const response: ApiSuccessResponse<ContentRecord<SurahPayload>[]> = {
      meta: {
        requestId: request.id,
        nextCursor: hasNext ? encodeCursor(nextOffset, cursorScope) : null
      },
      data: result.items
    };

    return reply.status(200).send(response);
  });

  // GET /api/v1/quran/surahs/:surahNumber
  fastify.get<{ Params: { surahNumber: string } }>('/surahs/:surahNumber', async (request, reply) => {
    const rawSurahNumber = request.params.surahNumber;
    const surahNum = Number(rawSurahNumber);
    if (!/^(?:[1-9]|[1-9][0-9]|1[01][0-9]|114)$/.test(rawSurahNumber) || !Number.isInteger(surahNum) || surahNum < 1 || surahNum > 114) {
      const errResponse: ApiErrorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Surah number must be an integer between 1 and 114.',
          requestId: request.id,
          details: [],
          retryable: false
        }
      };
      return reply.status(400).send(errResponse);
    }

    const result = await catalogueService.getSurahByNumber(surahNum);

    if (!result.hasApprovedSource) {
      const errResponse: ApiErrorResponse = {
        error: {
          code: 'CONTENT_UNAVAILABLE',
          message: 'Approved Quran catalogue metadata is not available.',
          requestId: request.id,
          details: [],
          retryable: false
        }
      };
      return reply.status(503).send(errResponse);
    }

    if (!result.item) {
      const errResponse: ApiErrorResponse = {
        error: {
          code: 'NOT_FOUND',
          message: `Surah ${surahNum} not found in the approved catalogue metadata.`,
          requestId: request.id,
          details: [],
          retryable: false
        }
      };
      return reply.status(404).send(errResponse);
    }

    return reply.status(200).send({
      meta: {
        requestId: request.id
      },
      data: result.item
    });
  });
};
