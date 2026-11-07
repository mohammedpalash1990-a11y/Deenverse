import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
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
    error: 'Redistribution permission has not been explicitly approved'
  }),
  reviewer: z.string().min(1, 'Approval reviewer is required'),
  reviewedAt: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: 'Review date is invalid'
  }),
  approvalStatus: z.literal('approved', {
    error: 'Source must have an explicit approved status'
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

const configuredCursorSecret = process.env.API_CURSOR_SECRET || process.env.DATABASE_URL;
if (process.env.API_CURSOR_SECRET && process.env.API_CURSOR_SECRET.length < 32) {
  throw new Error('API_CURSOR_SECRET must contain at least 32 characters.');
}
const CURSOR_KEY = createHash('sha256')
  .update(configuredCursorSecret || randomBytes(32))
  .digest();

const isCanonicalBase64Url = (value: string): boolean => {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return false;
  try {
    const decoded = Buffer.from(value, 'base64url');
    return decoded.toString('base64url') === value;
  } catch {
    return false;
  }
};

export const PaginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().max(512).optional().refine((value) => value === undefined || (
    value.split('.').length === 2 &&
    value.split('.').every(isCanonicalBase64Url)
  ), {
    message: 'Cursor must be a signed pagination token'
  })
});

interface CursorPayload {
  v: 1;
  offset: number;
  scope: string;
}

function signCursorPayload(payload: string): Buffer {
  return createHmac('sha256', CURSOR_KEY).update(payload, 'utf8').digest();
}

const DEFAULT_CURSOR_SCOPE = 'default';

export function decodeCursor(cursor: string | undefined, scope: string = DEFAULT_CURSOR_SCOPE): number {
  if (!cursor) return 0;
  const [encodedPayload, encodedSignature, extra] = cursor.split('.');
  if (!encodedPayload || !encodedSignature || extra !== undefined ||
      !isCanonicalBase64Url(encodedPayload) || !isCanonicalBase64Url(encodedSignature)) {
    throw new Error('Invalid pagination cursor');
  }

  const payloadBytes = Buffer.from(encodedPayload, 'base64url');
  const suppliedSignature = Buffer.from(encodedSignature, 'base64url');
  const expectedSignature = signCursorPayload(encodedPayload);
  if (suppliedSignature.length !== expectedSignature.length ||
      !timingSafeEqual(suppliedSignature, expectedSignature)) {
    throw new Error('Invalid pagination cursor signature');
  }

  let payload: CursorPayload;
  try {
    payload = JSON.parse(payloadBytes.toString('utf8')) as CursorPayload;
  } catch {
    throw new Error('Invalid pagination cursor payload');
  }
  if (payload.v !== 1 || payload.scope !== scope ||
      !Number.isSafeInteger(payload.offset) || payload.offset < 0) {
    throw new Error('Pagination cursor is invalid or belongs to a different query');
  }
  return payload.offset;
}

export function encodeCursor(offset: number, scope: string = DEFAULT_CURSOR_SCOPE): string {
  if (!Number.isSafeInteger(offset) || offset < 0) {
    throw new Error('Cursor offset must be a non-negative safe integer');
  }
  if (!scope || scope.length > 512) throw new Error('Cursor scope is invalid');
  const payload: CursorPayload = { v: 1, offset, scope };
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = signCursorPayload(encodedPayload).toString('base64url');
  return encodedPayload + '.' + signature;
}
