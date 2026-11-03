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
  redistributionAllowed: z.literal(true, {
    errorMap: () => ({ message: 'Redistribution permission has not been explicitly approved' })
  }),
  approvalStatus: z.literal('approved', {
    errorMap: () => ({ message: 'Source must have an explicit approved status' })
  }),
  reviewDecisionId: z.string().min(1, 'Review decision ID is required'),
  approvedByAuthority: z.string().min(1, 'Approved by authority is required'),
  approvedAt: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: 'Approval date is invalid'
  }),
  checksum: z.string().regex(/^[a-f0-9]{64}$/, {
    message: 'Checksum must be a valid 64-character lowercase SHA-256 hex digest'
  })
});

export const PaginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional()
});

export function decodeCursor(cursor?: string): number {
  if (!cursor) return 0;

  // Base64 regex validation to reject non-base64 input early
  const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  if (!base64Regex.test(cursor)) {
    throw new Error('Invalid cursor format');
  }

  let raw: string;
  try {
    raw = Buffer.from(cursor, 'base64').toString('utf-8');
  } catch {
    throw new Error('Invalid cursor encoding');
  }

  // Must strictly be an integer representation (digits only, no decimals or extra chars)
  if (!/^\d+$/.test(raw)) {
    throw new Error('Invalid cursor value');
  }

  const offset = parseInt(raw, 10);
  if (Number.isNaN(offset) || offset < 0) {
    throw new Error('Cursor must be a non-negative integer');
  }

  return offset;
}

export function encodeCursor(offset: number): string {
  if (offset < 0 || !Number.isInteger(offset)) {
    throw new Error('Offset must be a non-negative integer');
  }
  return Buffer.from(offset.toString(), 'utf-8').toString('base64');
}
