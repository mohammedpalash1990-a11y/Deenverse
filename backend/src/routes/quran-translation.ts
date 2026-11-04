import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { QuranEncBengaliTranslationService } from '../services/quran-translation.js';
import { ApiErrorResponse } from '../types/content.js';

export interface QuranTranslationRoutesOptions {
  translationService: QuranEncBengaliTranslationService;
}

export const quranTranslationRoutes: FastifyPluginAsync<QuranTranslationRoutesOptions> = async (
  fastify: FastifyInstance,
  opts: QuranTranslationRoutesOptions
) => {
  fastify.get<{ Params: { surahNumber: string } }>('/bn/:surahNumber', async (request, reply) => {
    const surahNumber = Number(request.params.surahNumber);
    if (!/^(?:[1-9]|[1-9][0-9]|1[01][0-9]|114)$/.test(request.params.surahNumber) ||
        !Number.isSafeInteger(surahNumber)) {
      const response: ApiErrorResponse = {
        error: { code: 'VALIDATION_ERROR', message: 'Surah must be an integer between 1 and 114.',
          requestId: request.id, details: [], retryable: false }
      };
      return reply.status(400).send(response);
    }

    const result = await opts.translationService.getSurah(surahNumber);
    if (result.status === 'not_found') {
      const response: ApiErrorResponse = {
        error: { code: 'NOT_FOUND', message: 'The requested Surah translation was not found in QuranEnc.',
          requestId: request.id, details: [], retryable: false }
      };
      return reply.status(404).send(response);
    }
    if (result.status !== 'ok') {
      const response: ApiErrorResponse = {
        error: {
          code: result.status === 'invalid_source_response' ? 'INTEGRITY_REJECTED' : 'CONTENT_UNAVAILABLE',
          message: result.status === 'invalid_source_response'
            ? 'QuranEnc returned an invalid, incomplete, or mismatched Surah translation.'
            : 'The QuranEnc translation source is temporarily unavailable.',
          requestId: request.id, details: [], retryable: result.status === 'unavailable'
        }
      };
      return reply.status(result.status === 'invalid_source_response' ? 502 : 503).send(response);
    }
    return reply.status(200).send({ meta: { requestId: request.id }, data: result.value });
  });

  fastify.get<{ Params: { surahNumber: string; ayahNumber: string } }>(
    '/bn/:surahNumber/:ayahNumber',
    async (request, reply) => {
      const surahNumber = Number(request.params.surahNumber);
      const ayahNumber = Number(request.params.ayahNumber);
      if (!/^(?:[1-9]|[1-9][0-9]|1[01][0-9]|114)$/.test(request.params.surahNumber) ||
          !/^[1-9][0-9]*$/.test(request.params.ayahNumber) ||
          !Number.isSafeInteger(surahNumber) || surahNumber < 1 || surahNumber > 114 ||
          !Number.isSafeInteger(ayahNumber)) {
        const response: ApiErrorResponse = {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Surah must be 1–114 and Ayah must be a positive integer.',
            requestId: request.id,
            details: [],
            retryable: false
          }
        };
        return reply.status(400).send(response);
      }

      const result = await opts.translationService.getAyah(surahNumber, ayahNumber);
      if (result.status === 'not_found') {
        const response: ApiErrorResponse = {
          error: {
            code: 'NOT_FOUND',
            message: 'The requested translation Ayah was not found in QuranEnc.',
            requestId: request.id,
            details: [],
            retryable: false
          }
        };
        return reply.status(404).send(response);
      }
      if (result.status !== 'ok') {
        const response: ApiErrorResponse = {
          error: {
            code: result.status === 'invalid_source_response' ? 'INTEGRITY_REJECTED' : 'CONTENT_UNAVAILABLE',
            message: result.status === 'invalid_source_response'
              ? 'QuranEnc returned an invalid or mismatched translation record.'
              : 'The QuranEnc translation source is temporarily unavailable.',
            requestId: request.id,
            details: [],
            retryable: result.status === 'unavailable'
          }
        };
        return reply.status(result.status === 'invalid_source_response' ? 502 : 503).send(response);
      }

      return reply.status(200).send({
        meta: { requestId: request.id },
        data: result.value
      });
    }
  );
};
