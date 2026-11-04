import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { QuranAyahService } from '../services/quran-ayah.js';
import { ApiErrorResponse } from '../types/content.js';

export interface QuranAyahRoutesOptions {
  ayahService: QuranAyahService;
}

export const quranAyahRoutes: FastifyPluginAsync<QuranAyahRoutesOptions> = async (
  fastify: FastifyInstance,
  opts: QuranAyahRoutesOptions
) => {
  fastify.get<{ Params: { surah: string; ayah: string } }>('/:surah/:ayah', async (request, reply) => {
    const { surah: rawSurah, ayah: rawAyah } = request.params;
    if (!/^(?:[1-9]|[1-9][0-9]|10[0-9]|11[0-4])$/.test(rawSurah)
      || !/^[1-9][0-9]{0,2}$/.test(rawAyah)) {
      const response: ApiErrorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Surah and ayah must be positive integers in canonical decimal form.',
          requestId: request.id,
          details: [],
          retryable: false
        }
      };
      return reply.status(400).send(response);
    }

    const result = await opts.ayahService.getAyah(Number(rawSurah), Number(rawAyah));
    if (result.status === 'source_unavailable') {
      const response: ApiErrorResponse = {
        error: {
          code: 'CONTENT_UNAVAILABLE',
          message: 'No approved Quran source is available for this surah.',
          requestId: request.id,
          details: [],
          retryable: false
        }
      };
      return reply.status(503).send(response);
    }
    if (result.status === 'out_of_range' || result.status === 'not_found') {
      const response: ApiErrorResponse = {
        error: {
          code: 'NOT_FOUND',
          message: result.status === 'out_of_range'
            ? 'Ayah number is outside the verified surah range.'
            : 'The requested ayah is not present in the approved source.',
          requestId: request.id,
          details: [],
          retryable: false
        }
      };
      return reply.status(404).send(response);
    }
    if (result.status === 'integrity_rejected') {
      const response: ApiErrorResponse = {
        error: {
          code: 'INTEGRITY_REJECTED',
          message: 'The ayah is not eligible for publication: text integrity or per-ayah review gate failed.',
          requestId: request.id,
          details: [],
          retryable: false
        }
      };
      return reply.status(502).send(response);
    }

    return reply.status(200).send({
      meta: { requestId: request.id },
      data: result.value
    });
  });
};
