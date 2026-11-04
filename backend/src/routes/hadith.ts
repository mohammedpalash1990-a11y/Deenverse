import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { HadithLibraryService } from '../services/hadith-library.js';
import { ApiErrorResponse } from '../types/content.js';
import { PaginationQuerySchema, decodeCursor, encodeCursor } from '../services/validation.js';

export interface HadithRoutesOptions {
  hadithService: HadithLibraryService;
}

const isCanonicalCursor = (cursor: string): boolean => {
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(cursor)) return false;
  const decoded = Buffer.from(cursor, 'base64').toString('utf8');
  return /^(0|[1-9]\d*)$/.test(decoded) &&
    Number.isSafeInteger(Number(decoded)) &&
    Buffer.from(decoded, 'utf8').toString('base64') === cursor;
};

const SearchQuerySchema = z.object({
  q: z.string().trim().min(1).max(120),
  locale: z.enum(['ar', 'bn', 'en']).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional().refine((value) => value === undefined || isCanonicalCursor(value), {
    message: 'Cursor must be a valid pagination offset'
  })
});

function errorResponse(requestId: string, code: string, message: string, retryable = false): ApiErrorResponse {
  return { error: { code: code as ApiErrorResponse['error']['code'], message, requestId, details: [], retryable } };
}

function sendServiceError(reply: any, requestId: string, status: 'unavailable' | 'not_found' | 'integrity_rejected') {
  if (status === 'unavailable') return reply.status(503).send(errorResponse(requestId, 'CONTENT_UNAVAILABLE', 'Approved Hadith content is not available.', false));
  if (status === 'not_found') return reply.status(404).send(errorResponse(requestId, 'NOT_FOUND', 'The requested Hadith resource was not found.', false));
  return reply.status(502).send(errorResponse(requestId, 'INTEGRITY_REJECTED', 'Hadith content failed integrity verification and was blocked.', false));
}

function sendPage(reply: any, requestId: string, value: { items: unknown[]; total: number }, limit: number, offset: number) {
  return reply.status(200).send({
    meta: { requestId, nextCursor: offset + limit < value.total ? encodeCursor(offset + limit) : null },
    data: value.items
  });
}

export const hadithRoutes: FastifyPluginAsync<HadithRoutesOptions> = async (
  fastify: FastifyInstance,
  opts: HadithRoutesOptions
) => {
  const { hadithService } = opts;

  fastify.get('/books', async (request, reply) => {
    const parsed = PaginationQuerySchema.safeParse(request.query);
    if (!parsed.success) return reply.status(400).send(errorResponse(request.id, 'VALIDATION_ERROR', 'Invalid pagination parameters.'));
    const { limit, cursor } = parsed.data;
    const offset = decodeCursor(cursor);
    const result = await hadithService.listBooks({ limit, offset });
    if (result.status !== 'ok') return sendServiceError(reply, request.id, result.status);
    return sendPage(reply, request.id, result.value, limit, offset);
  });

  fastify.get<{ Params: { bookId: string } }>('/books/:bookId/chapters', async (request, reply) => {
    const bookId = request.params.bookId;
    if (!bookId || bookId.length > 128) return reply.status(400).send(errorResponse(request.id, 'VALIDATION_ERROR', 'Invalid book identifier.'));
    const result = await hadithService.listChapters(bookId);
    if (result.status !== 'ok') return sendServiceError(reply, request.id, result.status);
    return reply.status(200).send({ meta: { requestId: request.id }, data: result.value });
  });

  fastify.get<{ Params: { bookId: string }; Querystring: { chapterId?: string; locale?: 'ar' | 'bn' | 'en'; limit?: string; cursor?: string } }>('/books/:bookId/records', async (request, reply) => {
    const parsed = PaginationQuerySchema.extend({
      chapterId: z.string().min(1).max(128).optional(),
      locale: z.enum(['ar', 'bn', 'en']).optional()
    }).safeParse(request.query);
    if (!parsed.success) return reply.status(400).send(errorResponse(request.id, 'VALIDATION_ERROR', 'Invalid record query parameters.'));
    if (!request.params.bookId || request.params.bookId.length > 128) return reply.status(400).send(errorResponse(request.id, 'VALIDATION_ERROR', 'Invalid book identifier.'));
    const { limit, cursor, chapterId } = parsed.data;
    const offset = decodeCursor(cursor);
    const result = await hadithService.listRecords(request.params.bookId, { limit, offset, chapterId, locale: parsed.data.locale });
    if (result.status !== 'ok') return sendServiceError(reply, request.id, result.status);
    return sendPage(reply, request.id, result.value, limit, offset);
  });

  fastify.get<{ Params: { recordId: string }; Querystring: { locale?: 'ar' | 'bn' | 'en' } }>('/records/:recordId', async (request, reply) => {
    if (!request.params.recordId || request.params.recordId.length > 128) return reply.status(400).send(errorResponse(request.id, 'VALIDATION_ERROR', 'Invalid Hadith identifier.'));
    const parsed = z.object({ locale: z.enum(['ar', 'bn', 'en']).optional() }).safeParse(request.query);
    if (!parsed.success) return reply.status(400).send(errorResponse(request.id, 'VALIDATION_ERROR', 'Invalid locale.'));
    const result = await hadithService.getRecord(request.params.recordId, parsed.data.locale);
    if (result.status !== 'ok') return sendServiceError(reply, request.id, result.status);
    return reply.status(200).send({ meta: { requestId: request.id }, data: result.value });
  });

  fastify.get('/search', async (request, reply) => {
    const parsed = SearchQuerySchema.safeParse(request.query);
    if (!parsed.success) return reply.status(400).send(errorResponse(request.id, 'VALIDATION_ERROR', 'Invalid Hadith search parameters.'));
    const { q, locale, limit, cursor } = parsed.data;
    const offset = decodeCursor(cursor);
    const result = await hadithService.search(q, locale, { limit, offset, locale });
    if (result.status !== 'ok') return sendServiceError(reply, request.id, result.status);
    return sendPage(reply, request.id, result.value, limit, offset);
  });
};
