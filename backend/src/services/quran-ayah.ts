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

function isoDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

export class QuranAyahService {
  constructor(private readonly db: Knex) {}

  async getAyah(surah: number, ayah: number): Promise<AyahLookupResult> {
    const source = await findSingleApprovedQuranSource(this.db);

    if (!source) return { status: 'source_unavailable' };
    const surahRecord = await this.db('quran_surahs')
      .where({ source_id: source.id, surah_number: surah })
      .select('verses_count')
      .first();

    if (!surahRecord) return { status: 'not_found' };
    if (ayah > Number(surahRecord.verses_count)) return { status: 'out_of_range' };

    const checksum = String(source.checksum ?? '');
    const reviewedAt = isoDate(source.reviewed_at);
    const approvedAt = isoDate(source.approval_date);
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
      !source.reviewer || !reviewedAt || !approvedAt ||
      !source.approval_id || !source.approval_reviewer || !sourceUrlIsHttps ||
      (source.redistribution_allowed !== true && Number(source.redistribution_allowed) !== 1)
    ) {
      return { status: 'source_unavailable' };
    }

    const record = await this.db('quran_ayahs')
      .where({
        source_id: source.id,
        surah_number: surah,
        ayah_number: ayah
      })
      .select('arabic', 'text_sha256')
      .first();

    if (!record) return { status: 'not_found' };
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
