import { Knex } from 'knex';
import {
  ContentRecord,
  ContentProvenance,
  SurahPayload,
  ApiSuccessResponse,
  ApiErrorResponse
} from '../types/content.js';
import { ContentProvenanceSchema } from './validation.js';

export interface SurahListQuery {
  limit: number;
  offset: number;
}

export class QuranCatalogueService {
  constructor(private db: Knex) {}

  /**
   * Retrieves paginated Quran Surah catalogue metadata with full immutable provenance.
   * Fails closed: If no active, approved content source exists, returns null.
   */
  async listSurahs(query: SurahListQuery): Promise<{
    items: ContentRecord<SurahPayload>[];
    total: number;
    hasApprovedSource: boolean;
  }> {
    // 1. Fetch approved active source for Quran metadata
    const source = await this.db('content_sources')
      .join('content_source_approvals', 'content_source_approvals.source_id', 'content_sources.id')
      .where({
        'content_sources.content_type': 'quran',
        'content_sources.is_active': true,
        'content_sources.redistribution_allowed': true,
        'content_source_approvals.decision': 'approved'
      })
      .whereRaw('content_source_approvals.artifact_sha256 = content_sources.checksum')
      .select(
        'content_sources.*',
        'content_source_approvals.reviewer_id as approval_reviewer',
        'content_source_approvals.approved_at as approval_date'
      )
      .first();

    if (!source) {
      return { items: [], total: 0, hasApprovedSource: false };
    }

    // 2. Validate provenance structure at boundary
    const provenance: ContentProvenance = {
      contentType: source.content_type,
      sourceId: source.id,
      edition: source.edition,
      sourceUrl: source.source_url,
      attribution: source.attribution,
      licenseId: source.license_id,
      redistributionAllowed: Boolean(source.redistribution_allowed),
      reviewer: source.approval_reviewer,
      reviewedAt: new Date(source.approval_date).toISOString(),
      checksum: source.checksum
    };

    const provValidation = ContentProvenanceSchema.safeParse(provenance);
    if (!provValidation.success) {
      // Source provenance is invalid or incomplete -> fail closed
      return { items: [], total: 0, hasApprovedSource: false };
    }

    // 3. Count total surahs
    const countResult = await this.db('quran_surahs')
      .where({ source_id: source.id })
      .count<{ count: number | string }>('* as count')
      .first();

    const total = countResult ? Number(countResult.count) : 0;

    // 4. Retrieve paginated list
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
    const source = await this.db('content_sources')
      .join('content_source_approvals', 'content_source_approvals.source_id', 'content_sources.id')
      .where({
        'content_sources.content_type': 'quran',
        'content_sources.is_active': true,
        'content_sources.redistribution_allowed': true,
        'content_source_approvals.decision': 'approved'
      })
      .whereRaw('content_source_approvals.artifact_sha256 = content_sources.checksum')
      .select(
        'content_sources.*',
        'content_source_approvals.reviewer_id as approval_reviewer',
        'content_source_approvals.approved_at as approval_date'
      )
      .first();

    if (!source) {
      return { item: null, hasApprovedSource: false };
    }

    const provenance: ContentProvenance = {
      contentType: source.content_type,
      sourceId: source.id,
      edition: source.edition,
      sourceUrl: source.source_url,
      attribution: source.attribution,
      licenseId: source.license_id,
      redistributionAllowed: Boolean(source.redistribution_allowed),
      reviewer: source.approval_reviewer,
      reviewedAt: new Date(source.approval_date).toISOString(),
      checksum: source.checksum
    };

    const provValidation = ContentProvenanceSchema.safeParse(provenance);
    if (!provValidation.success) {
      return { item: null, hasApprovedSource: false };
    }

    const row = await this.db('quran_surahs')
      .where({ source_id: source.id, surah_number: surahNumber })
      .first();

    if (!row) {
      return { item: null, hasApprovedSource: true };
    }

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
