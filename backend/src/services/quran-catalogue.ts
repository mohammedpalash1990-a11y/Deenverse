import { Knex } from 'knex';
import {
  ContentRecord,
  ContentProvenance,
  SurahPayload
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
    // 1. Fetch approved active source with controlled approval status
    // Never choose an edition implicitly when multiple approved active sources exist.
    const approvedSources = await this.db('content_sources')
      .where({
        content_type: 'quran',
        is_active: true,
        approval_status: 'approved',
        redistribution_allowed: true
      })
      .orderBy('id', 'asc')
      .limit(2);

    if (approvedSources.length !== 1) {
      return { items: [], total: 0, hasApprovedSource: false };
    }
    const source = approvedSources[0];

    // 2. Validate provenance structure and SHA-256 digest at boundary
    const approvedAt = new Date(source.approved_at);
    if (!Number.isFinite(approvedAt.getTime())) {
      return { items: [], total: 0, hasApprovedSource: false };
    }

    const provenance: ContentProvenance = {
      contentType: source.content_type,
      sourceId: source.id,
      edition: source.edition,
      sourceUrl: source.source_url,
      attribution: source.attribution,
      licenseId: source.license_id,
      redistributionAllowed: Boolean(source.redistribution_allowed),
      approvalStatus: source.approval_status,
      reviewDecisionId: source.review_decision_id,
      approvedByAuthority: source.approved_by_authority,
      approvedAt: approvedAt.toISOString(),
      checksum: source.artifact_sha256
    };

    const provValidation = ContentProvenanceSchema.safeParse(provenance);
    if (!provValidation.success) {
      // Source provenance is invalid or incomplete -> fail closed
      return { items: [], total: 0, hasApprovedSource: false };
    }

    // 3. Count total surahs for this approved source
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
    // Never choose an edition implicitly when multiple approved active sources exist.
    const approvedSources = await this.db('content_sources')
      .where({
        content_type: 'quran',
        is_active: true,
        approval_status: 'approved',
        redistribution_allowed: true
      })
      .orderBy('id', 'asc')
      .limit(2);

    if (approvedSources.length !== 1) {
      return { item: null, hasApprovedSource: false };
    }
    const source = approvedSources[0];

    const approvedAt = new Date(source.approved_at);
    if (!Number.isFinite(approvedAt.getTime())) {
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
      approvalStatus: source.approval_status,
      reviewDecisionId: source.review_decision_id,
      approvedByAuthority: source.approved_by_authority,
      approvedAt: approvedAt.toISOString(),
      checksum: source.artifact_sha256
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
