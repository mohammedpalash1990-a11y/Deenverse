import { z } from 'zod';
import { ReligiousContentType, ContentProvenance, SourceApprovalStatus } from '../types/content.js';

export const ContentProvenanceSchema = z.object({
  contentType: z.enum(['quran', 'translation', 'tafsir', 'hadith', 'dua', 'audio']),
  sourceId: z.string().min(1, 'Source ID is required'),
  edition: z.string().min(1, 'Edition is required'),
  sourceUrl: z.string().url('Must be a valid URL').refine((url) => url.startsWith('https://'), {
    message: 'Source URL must use HTTPS'
  }),
  attribution: z.string().min(1, 'Attribution is required'),
  licenseId: z.string().min(1, 'License ID is required'),
  redistributionAllowed: z.literal(true),
  reviewer: z.string().min(1, 'Approval reviewer is required'),
  reviewedAt: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: 'Review date is invalid'
  }),
  approvalStatus: z.literal('approved'),
  reviewDecisionId: z.string().min(1, 'Review decision ID is required'),
  approvedByAuthority: z.string().min(1, 'Approved by authority is required'),
  approvedAt: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: 'Approval date is invalid'
  }),
  checksum: z.string().regex(/^[a-f0-9]{64}$/, {
    message: 'Checksum must be a valid 64-character lowercase SHA-256 hex digest'
  })
});

const isValidCursor = (cursor: string): boolean => {
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(cursor)) return false;
  const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
  return /^(0|[1-9]\d*)$/.test(decoded)
    && Number.isSafeInteger(Number(decoded))
    && Buffer.from(decoded, 'utf-8').toString('base64') === cursor;
};

export const PaginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional().refine((value) => value === undefined || isValidCursor(value), {
    message: 'Cursor must be a valid non-negative pagination offset'
  })
});

export function decodeCursor(cursor?: string): number {
  if (!cursor) return 0;
  if (!isValidCursor(cursor)) throw new Error('Invalid pagination cursor');
  return Number(Buffer.from(cursor, 'base64').toString('utf-8'));
}

export function encodeCursor(offset: number): string {
  if (!Number.isSafeInteger(offset) || offset < 0) {
    throw new Error('Cursor offset must be a non-negative safe integer');
  }
  return Buffer.from(offset.toString(), 'utf-8').toString('base64');
}
