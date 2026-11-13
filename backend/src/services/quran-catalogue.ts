import { Knex } from 'knex';
import {
  ContentRecord,
  ContentProvenance,
  SurahPayload
} from '../types/content.js';
import { ContentProvenanceSchema } from './validation.js';
import { EXPECTED_AYAH_COUNTS } from './quran-surah-counts.js';
import { findSingleApprovedQuranSource } from './approved-quran-source.js';

export interface SurahListQuery {
  limit: number;
  offset: number;
}

export class QuranCatalogueService {
  constructor(private db: Knex) {}

  /**
   * The public catalogue is all-or-nothing: a source is not readable unless
   * every canonical Surah is present exactly once and has its canonical Ayah count.
   */
  private async hasCompleteSurahCatalogue(sourceId: string): Promise<boolean> {
    const rows = await this.db('quran_surahs')
      .where({ source_id: sourceId })
      .select('surah_number', 'verses_count')
      .orderBy('surah_number', 'asc');

    return rows.length === EXPECTED_AYAH_COUNTS.length && rows.every((row, index) =>
      Number(row.surah_number) === index + 1 &&
      Number(row.verses_count) === EXPECTED_AYAH_COUNTS[index]
    );
  }

  /**
   * Retrieves paginated Quran Surah catalogue metadata only after an explicit
   * approval record is bound to the exact registered artifact checksum.
   * The database digest comparison does not independently fetch/hash the artifact.
   */
  async listSurahs(query: SurahListQuery): Promise<{
    items: ContentRecord<SurahPayload>[];
    total: number;
    hasApprovedSource: boolean;
  }> {
    const source = await findSingleApprovedQuranSource(this.db);

    if (!source) return { items: [], total: 0, hasApprovedSource: false };

    const provenance: ContentProvenance = {
      contentType: source.content_type,
      sourceId: source.id,
      edition: source.edition,
      sourceUrl: source.source_url,
      attribution: source.attribution,
      licenseId: source.license_id,
      redistributionAllowed: Boolean(source.redistribution_allowed),
      reviewer: source.reviewer,
      reviewedAt: new Date(source.reviewed_at).toISOString(),
      approvalStatus: source.approval_decision,
      reviewDecisionId: source.approval_id,
      approvedByAuthority: source.approval_reviewer,
      approvedAt: new Date(source.approval_date).toISOString(),
      checksum: source.checksum
    };

    const provenanceValidation = ContentProvenanceSchema.safeParse(provenance);
    if (!provenanceValidation.success) return { items: [], total: 0, hasApprovedSource: false };

    if (!(await this.hasCompleteSurahCatalogue(source.id))) {
      return { items: [], total: 0, hasApprovedSource: false };
    }

    const countResult = await this.db('quran_surahs')
      .where({ source_id: source.id })
      .count<{ count: number | string }>('* as count')
      .first();
    const total = countResult ? Number(countResult.count) : 0;

    const rows = await this.db('quran_surahs')
      .where({ source_id: source.id })
      .orderBy('surah_number', 'asc')
      .limit(query.limit)
      .offset(query.offset);

    const items: ContentRecord<SurahPayload>[] = rows.map((row) => ({
      id: `quran:surah:${row.surah_number}`,
      type: 'quran',
      title: row.name_simple,
      locale: 'ar',
      provenance,
      payload: {
        surahNumber: row.surah_number,
        nameArabic: row.name_arabic,
        nameSimple: row.name_simple,
        nameEnglish: row.name_english,
        revelationPlace: row.revelation_place,
        revelationOrder: row.revelation_order,
        versesCount: row.verses_count
      }
    }));

    return { items, total, hasApprovedSource: true };
  }

  async getSurahByNumber(surahNumber: number): Promise<{
    item: ContentRecord<SurahPayload> | null;
    hasApprovedSource: boolean;
  }> {
    const source = await findSingleApprovedQuranSource(this.db);

    if (!source) return { item: null, hasApprovedSource: false };

    const provenance: ContentProvenance = {
      contentType: source.content_type,
      sourceId: source.id,
      edition: source.edition,
      sourceUrl: source.source_url,
      attribution: source.attribution,
      licenseId: source.license_id,
      redistributionAllowed: Boolean(source.redistribution_allowed),
      reviewer: source.reviewer,
      reviewedAt: new Date(source.reviewed_at).toISOString(),
      approvalStatus: source.approval_decision,
      reviewDecisionId: source.approval_id,
      approvedByAuthority: source.approval_reviewer,
      approvedAt: new Date(source.approval_date).toISOString(),
      checksum: source.checksum
    };

    const provenanceValidation = ContentProvenanceSchema.safeParse(provenance);
    if (!provenanceValidation.success) return { item: null, hasApprovedSource: false };

    if (!(await this.hasCompleteSurahCatalogue(source.id))) {
      return { item: null, hasApprovedSource: false };
    }

    const row = await this.db('quran_surahs')
      .where({ source_id: source.id, surah_number: surahNumber })
      .first();
    if (!row) return { item: null, hasApprovedSource: true };

    return {
      hasApprovedSource: true,
      item: {
        id: `quran:surah:${row.surah_number}`,
        type: 'quran',
        title: row.name_simple,
        locale: 'ar',
        provenance,
        payload: {
          surahNumber: row.surah_number,
          nameArabic: row.name_arabic,
          nameSimple: row.name_simple,
          nameEnglish: row.name_english,
          revelationPlace: row.revelation_place,
          revelationOrder: row.revelation_order,
          versesCount: row.verses_count
        }
      }
    };
  }
}
