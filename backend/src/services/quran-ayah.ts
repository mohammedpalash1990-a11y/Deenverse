import { createHash } from 'node:crypto';
import { Knex } from 'knex';

export interface VerifiedAyah {
  surah: number;
  ayah: number;
  arabic: string;
  provenance: {
    sourceId: string;
    edition: string;
    license: string;
    attribution: string;
    sourceUrl: string;
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

export class QuranAyahService {
  constructor(private readonly db: Knex) {}

  async getAyah(surah: number, ayah: number): Promise<AyahLookupResult> {
    const source = await this.db('quran_surahs')
      .join('content_sources', 'content_sources.id', 'quran_surahs.source_id')
      .join('content_source_approvals', 'content_source_approvals.source_id', 'content_sources.id')
      .where({
        'quran_surahs.surah_number': surah,
        'content_sources.content_type': 'quran',
        'content_sources.is_active': true,
        'content_sources.redistribution_allowed': true,
        'content_source_approvals.decision': 'approved'
      })
      .whereRaw('content_source_approvals.artifact_sha256 = content_sources.checksum')
      .select(
        'quran_surahs.verses_count',
        'content_sources.id as source_id',
        'content_sources.edition',
        'content_sources.license_id',
        'content_sources.attribution',
        'content_sources.source_url'
      )
      .first();

    if (!source) return { status: 'source_unavailable' };
    if (ayah > Number(source.verses_count)) return { status: 'out_of_range' };

    const record = await this.db('quran_ayahs')
      .where({
        source_id: source.source_id,
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
        surah,
        ayah,
        arabic: record.arabic,
        provenance: {
          sourceId: source.source_id,
          edition: source.edition,
          license: source.license_id,
          attribution: source.attribution,
          sourceUrl: source.source_url
        }
      }
    };
  }
}
