export type ReligiousContentType =
  | 'quran'
  | 'translation'
  | 'tafsir'
  | 'hadith'
  | 'dua'
  | 'audio';

export type SourceApprovalStatus = 'pending' | 'rejected' | 'approved';

export interface ContentProvenance {
  contentType: ReligiousContentType;
  sourceId: string;
  edition: string;
  sourceUrl: string;
  attribution: string;
  licenseId: string;
  redistributionAllowed: boolean;
  reviewer: string;
  reviewedAt: string;
  approvalStatus: SourceApprovalStatus;
  reviewDecisionId: string;
  approvedByAuthority: string;
  approvedAt: string;
  checksum: string;
}

export interface ContentRecord<T = unknown> {
  id: string;
  type: ReligiousContentType;
  title: string;
  locale: string;
  provenance: ContentProvenance;
  payload: T;
}

export interface ApiResponseMeta {
  requestId: string;
  nextCursor?: string | null;
}

export interface ApiSuccessResponse<T> {
  meta: ApiResponseMeta;
  data: T[];
}

export type ContentSourceErrorCode =
  | 'UNAVAILABLE'
  | 'UNAUTHORIZED'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'INVALID_QUERY'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'CONTENT_UNAVAILABLE'
  | 'INTEGRITY_REJECTED'
  | 'INTERNAL_ERROR';

export interface ApiErrorResponse {
  error: {
    code: ContentSourceErrorCode;
    message: string;
    retryable: boolean;
  };
}

export interface SurahPayload {
  surahNumber: number;
  nameArabic: string;
  nameSimple: string;
  nameEnglish: string;
  revelationPlace: 'makkah' | 'madinah';
  revelationOrder: number;
  versesCount: number;
}
