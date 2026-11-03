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
          code: 'INVALID_QUERY',
          message: queryValidation.error.errors.map((e) => e.message).join(', '),
          retryable: false
        }
      };
      return reply.status(400).send(errResponse);
    }

    const { limit, cursor } = queryValidation.data;
    let offset: number;
    try {
      offset = decodeCursor(cursor);
    } catch (err: any) {
      const errResponse: ApiErrorResponse = {
        error: {
          code: 'INVALID_QUERY',
          message: err.message || 'Invalid pagination cursor provided.',
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
          code: 'UNAVAILABLE',
          message: 'Verified Quran catalogue source is not configured or approved.',
          retryable: false
        }
      };
      return reply.status(503).send(errResponse);
    }

    const nextOffset = offset + limit;
    const hasNext = nextOffset < result.total;

    const response: ApiSuccessResponse<ContentRecord<SurahPayload>> = {
      meta: {
        requestId: request.id,
        nextCursor: hasNext ? encodeCursor(nextOffset) : null
      },
      data: result.items
    };

    return reply.status(200).send(response);
  });

  // GET /api/v1/quran/surahs/:surahNumber
  fastify.get<{ Params: { surahNumber: string } }>('/surahs/:surahNumber', async (request, reply) => {
    const rawSurah = request.params.surahNumber;

    // Strict positive integer match: reject non-integers, suffixes (1abc), decimals (1.5), and leading zeros (01)
    if (!/^[1-9]\d*$/.test(rawSurah)) {
      const errResponse: ApiErrorResponse = {
        error: {
          code: 'INVALID_QUERY',
          message: 'Surah number must be a positive integer without leading zeroes or alphabetic characters.',
          retryable: false
        }
      };
      return reply.status(400).send(errResponse);
    }

    const surahNum = parseInt(rawSurah, 10);
    if (surahNum > 114) {
      const errResponse: ApiErrorResponse = {
        error: {
          code: 'INVALID_QUERY',
          message: 'Surah number must be an integer between 1 and 114.',
          retryable: false
        }
      };
      return reply.status(400).send(errResponse);
    }

    const result = await catalogueService.getSurahByNumber(surahNum);

    if (!result.hasApprovedSource) {
      const errResponse: ApiErrorResponse = {
        error: {
          code: 'UNAVAILABLE',
          message: 'Verified Quran catalogue source is not configured or approved.',
          retryable: false
        }
      };
      return reply.status(503).send(errResponse);
    }

    if (!result.item) {
      const errResponse: ApiErrorResponse = {
        error: {
          code: 'NOT_FOUND',
          message: `Surah ${surahNum} not found in the verified catalogue.`,
          retryable: false
        }
      };
      return reply.status(404).send(errResponse);
    }

    return reply.status(200).send({
      meta: {
        requestId: request.id
      },
      data: [result.item]
    });
  });
};
