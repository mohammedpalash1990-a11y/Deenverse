import { z } from 'zod';
import { ReligiousContentType, ContentProvenance } from '../types/content.js';

export const ContentProvenanceSchema = z.object({
  contentType: z.enum(['quran', 'translation', 'tafsir', 'hadith', 'dua', 'audio']),
  sourceId: z.string().min(1, 'Source ID is required'),
  edition: z.string().min(1, 'Edition is required'),
  sourceUrl: z.string().url('Must be a valid URL').refine((url) => url.startsWith('https://'), {
    message: 'Source URL must use HTTPS'
  }),
  attribution: z.string().min(1, 'Attribution is required'),
  licenseId: z.string().min(1, 'License ID is required'),
  redistributionAllowed: z.literal(true, {
    errorMap: () => ({ message: 'Redistribution permission has not been explicitly approved' })
  }),
  reviewer: z.string().min(1, 'Reviewer is required'),
  reviewedAt: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: 'Review date is invalid'
  }),
  checksum: z.string().min(1, 'Checksum is required')
});

export const PaginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional()
});

export function decodeCursor(cursor?: string): number {
  if (!cursor) return 0;
  try {
    const raw = Buffer.from(cursor, 'base64').toString('utf-8');
    const offset = parseInt(raw, 10);
    return Number.isNaN(offset) || offset < 0 ? 0 : offset;
  } catch {
    return 0;
  }
}

export function encodeCursor(offset: number): string {
  return Buffer.from(offset.toString(), 'utf-8').toString('base64');
}
