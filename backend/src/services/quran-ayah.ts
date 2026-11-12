import { createHash } from 'node:crypto';
import { Knex } from 'knex';
import { findSingleApprovedQuranSource } from './approved-quran-source.js';

export interface VerifiedAyah {
  id: string;
  type: 'quran';
  title: string;
  locale: 'ar';
  provenance: {
    contentType: 'quran';
    sourceId: string;
    edition: string;
    sourceUrl: string;
    attribution: string;
    licenseId: string;
    redistributionAllowed: true;
    reviewer: string;
    reviewedAt: string;
    checksum: string;
    approvalStatus: 'approved';
    reviewDecisionId: string;
    approvedByAuthority: string;
    approvedAt: string;
  };
  payload: {
    surahNumber: number;
    ayahNumber: number;
    textArabic: string;
  };
}

export type AyahLookupResult =
  | { status: 'ok'; value: VerifiedAyah }
  | { status: 'source_unavailable' }
  | { status: 'out_of_range' }
  | { status: 'not_found' }
  | { status: 'integrity_rejected' };

const sha256 = (value: string): string =>
  createHash('sha256').update(value, 'utf8').digest('hex');

const RESERVED_REVIEWER = 'project-owner-chat-authorization';

function isoDate(value: string | Date | null | undefined): string {
  if (value == null) return '';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

function isTrue(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true' || value === 't';
}

function normalizedReviewer(value: unknown): string {
  return String(value ?? '').trim().toLowerCase();
}

export class QuranAyahService {
  constructor(private readonly db: Knex) {}

  async getAyah(surah: number, ayah: number): Promise<AyahLookupResult> {
    const source = await findSingleApprovedQuranSource(this.db);
    if (!source) return { status: 'source_unavailable' };

    const checksum = String(source.checksum ?? '');
    const reviewedAt = isoDate(source.reviewed_at);
    const approvedAt = isoDate(source.approval_date);
    const sourceReviewer = normalizedReviewer(source.reviewer);
    const approvalReviewer = normalizedReviewer(source.approval_reviewer);
    let sourceUrlIsHttps = false;

    try {
      sourceUrlIsHttps = new URL(String(source.source_url)).protocol === 'https:';
    } catch {
      sourceUrlIsHttps = false;
    }

    if (
      !/^[a-f0-9]{64}$/i.test(checksum) ||
      Number(source.is_active) !== 1 ||
      !source.edition || !source.license_id || !source.attribution ||
      !sourceReviewer || !approvalReviewer ||
      sourceReviewer === approvalReviewer ||
      sourceReviewer === RESERVED_REVIEWER ||
      approvalReviewer === RESERVED_REVIEWER ||
      !reviewedAt || !approvedAt ||
      !source.approval_id || !sourceUrlIsHttps ||
      (source.redistribution_allowed !== true && Number(source.redistribution_allowed) !== 1)
    ) {
      return { status: 'source_unavailable' };
    }

    const surahRecord = await this.db('quran_surahs')
      .where({ source_id: source.id, surah_number: surah })
      .select('verses_count')
      .first();

    if (!surahRecord) return { status: 'not_found' };
    if (ayah > Number(surahRecord.verses_count)) return { status: 'out_of_range' };

    const record = await this.db('quran_ayahs')
      .where({ source_id: source.id, surah_number: surah, ayah_number: ayah })
      .select('arabic', 'text_sha256')
      .first();

    if (!record) return { status: 'not_found' };

    const review = await this.db('quran_ayah_reviews')
      .where({ source_id: source.id, surah_number: surah, ayah_number: ayah })
      .select(
        'review_status',
        'artifact_sha256',
        'reviewer_id',
        'reviewed_at',
        'text_match',
        'boundary_match',
        'second_review_status',
        'second_reviewer_id',
        'second_reviewed_at'
      )
      .first();

    if (!review) return { status: 'integrity_rejected' };

    const primaryReviewer = normalizedReviewer(review.reviewer_id);
    const secondReviewer = normalizedReviewer(review.second_reviewer_id);
    const secondStatus = review.second_review_status == null
      ? null
      : String(review.second_review_status).trim();
    const secondReviewedAt = isoDate(review.second_reviewed_at);
    const primaryIsIndependent = Boolean(primaryReviewer) &&
      primaryReviewer !== RESERVED_REVIEWER &&
      primaryReviewer !== sourceReviewer &&
      primaryReviewer !== approvalReviewer;
    const secondReviewIsConsistent = secondStatus === null
      ? !secondReviewer && !review.second_reviewed_at
      : secondStatus === 'passed' &&
        Boolean(secondReviewer) &&
        secondReviewer !== RESERVED_REVIEWER &&
        secondReviewer !== primaryReviewer &&
        secondReviewer !== sourceReviewer &&
        secondReviewer !== approvalReviewer &&
        Boolean(secondReviewedAt);

    if (
      review.review_status !== 'passed' ||
      !/^[a-f0-9]{64}$/i.test(String(review.artifact_sha256 ?? '')) ||
      String(review.artifact_sha256).toLowerCase() !== checksum.toLowerCase() ||
      !primaryIsIndependent ||
      !isoDate(review.reviewed_at) ||
      !isTrue(review.text_match) ||
      !isTrue(review.boundary_match) ||
      !secondReviewIsConsistent
    ) {
      return { status: 'integrity_rejected' };
    }

    const storedTextDigest = String(record.text_sha256 ?? '');
    if (
      !/^[a-f0-9]{64}$/i.test(storedTextDigest) ||
      sha256(record.arabic) !== storedTextDigest.toLowerCase()
    ) {
      return { status: 'integrity_rejected' };
    }

    return {
      status: 'ok',
      value: {
        id: `quran:ayah:${surah}:${ayah}`,
        type: 'quran',
        title: `Ayah ${surah}:${ayah}`,
        locale: 'ar',
        provenance: {
          contentType: 'quran',
          sourceId: source.id,
          edition: source.edition,
          sourceUrl: source.source_url,
          attribution: source.attribution,
          licenseId: source.license_id,
          redistributionAllowed: true,
          reviewer: source.reviewer,
          reviewedAt,
          checksum,
          approvalStatus: 'approved',
          reviewDecisionId: source.approval_id,
          approvedByAuthority: source.approval_reviewer,
          approvedAt
        },
        payload: {
          surahNumber: surah,
          ayahNumber: ayah,
          textArabic: record.arabic
        }
      }
    };
  }
}
