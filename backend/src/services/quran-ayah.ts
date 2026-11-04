import { createHash } from 'node:crypto';
import { Knex } from 'knex';

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
  payload: { surahNumber: number; ayahNumber: number; textArabic: string };
}

export type AyahLookupResult =
  | { status: 'ok'; value: VerifiedAyah }
  | { status: 'source_unavailable' }
  | { status: 'out_of_range' }
  | { status: 'not_found' }
  | { status: 'integrity_rejected' };

const sha256 = (value: string): string =>
  createHash('sha256').update(value, 'utf8').digest('hex');

function isoDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

function isTrue(value: unknown): boolean {
  return value === true || Number(value) === 1;
}

export class QuranAyahService {
  constructor(private readonly db: Knex) {}

  async getAyah(surah: number, ayah: number): Promise<AyahLookupResult> {
    const source = await this.db('quran_surahs')
      .join('content_sources', 'content_sources.id', 'quran_surahs.source_id')
      .join('content_source_approvals', 'content_source_approvals.source_id', 'content_sources.id')
      .where({
        'quran_surahs.surah_number': surah,
        'content_sources.content_type': 'quran',
        'content_source_approvals.decision': 'approved'
      })
      .whereRaw('content_source_approvals.artifact_sha256 = content_sources.checksum')
      .select(
        'quran_surahs.verses_count',
        'content_sources.id as source_id',
        'content_sources.edition',
        'content_sources.license_id',
        'content_sources.attribution',
        'content_sources.source_url',
        'content_sources.redistribution_allowed',
        'content_sources.is_active',
        'content_sources.reviewer',
        'content_sources.reviewed_at',
        'content_sources.checksum',
        'content_source_approvals.id as approval_id',
        'content_source_approvals.reviewer_id as approval_reviewer_id',
        'content_source_approvals.approved_at'
      )
      .first();

    if (!source) return { status: 'source_unavailable' };
    if (ayah > Number(source.verses_count)) return { status: 'out_of_range' };

    const checksum = String(source.checksum ?? '');
    const reviewedAt = isoDate(source.reviewed_at);
    const approvedAt = isoDate(source.approved_at);
    let sourceUrlIsHttps = false;
    try { sourceUrlIsHttps = new URL(String(source.source_url)).protocol === 'https:'; }
    catch { sourceUrlIsHttps = false; }

    if (
      !/^[a-f0-9]{64}$/i.test(checksum) || !isTrue(source.is_active) ||
      !source.edition || !source.license_id || !source.attribution ||
      !source.reviewer || !reviewedAt || !approvedAt ||
      !source.approval_id || !source.approval_reviewer_id || !sourceUrlIsHttps ||
      !isTrue(source.redistribution_allowed)
    ) return { status: 'source_unavailable' };

    const record = await this.db('quran_ayahs')
      .where({ source_id: source.source_id, surah_number: surah, ayah_number: ayah })
      .select('arabic', 'text_sha256')
      .first();
    if (!record) return { status: 'not_found' };

    const review = await this.db('quran_ayah_reviews')
      .where({ source_id: source.source_id, surah_number: surah, ayah_number: ayah })
      .select('review_status', 'artifact_sha256', 'reviewer_id', 'reviewed_at',
        'text_match', 'boundary_match', 'second_review_status')
      .first();

    if (
      !review || review.review_status !== 'passed' ||
      String(review.artifact_sha256).toLowerCase() !== checksum.toLowerCase() ||
      !review.reviewer_id || !isoDate(review.reviewed_at) ||
      !isTrue(review.text_match) || !isTrue(review.boundary_match) ||
      (review.second_review_status != null && review.second_review_status !== 'passed')
    ) return { status: 'integrity_rejected' };

    if (!/^[a-f0-9]{64}$/.test(record.text_sha256) || sha256(record.arabic) !== record.text_sha256) {
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
          contentType: 'quran', sourceId: source.source_id, edition: source.edition,
          sourceUrl: source.source_url, attribution: source.attribution, licenseId: source.license_id,
          redistributionAllowed: true, reviewer: source.reviewer, reviewedAt, checksum,
          approvalStatus: 'approved', reviewDecisionId: source.approval_id,
          approvedByAuthority: source.approval_reviewer_id, approvedAt
        },
        payload: { surahNumber: surah, ayahNumber: ayah, textArabic: record.arabic }
      }
    };
  }
}
