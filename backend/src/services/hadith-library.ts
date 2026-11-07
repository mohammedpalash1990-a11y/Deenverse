import { createHash } from 'node:crypto';
import { Knex } from 'knex';
import { ContentProvenanceSchema } from './validation.js';

type DbRow = Record<string, any>;
type ServiceStatus = 'unavailable' | 'not_found' | 'integrity_rejected';

export interface HadithPageQuery {
  limit: number;
  offset: number;
  chapterId?: string;
  locale?: 'ar' | 'bn' | 'en';
}

export type HadithServiceResult<T> =
  | { status: 'ok'; value: T; total?: number }
  | { status: ServiceStatus };

function isoDate(value: unknown): string {
  const parsed = value instanceof Date ? value : new Date(String(value ?? ''));
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString();
}

function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

const ARABIC_DIACRITICS = [
  '\u0640', '\u064B', '\u064C', '\u064D', '\u064E', '\u064F',
  '\u0650', '\u0651', '\u0652', '\u0653', '\u0654', '\u0655',
  '\u0656', '\u0657', '\u0658', '\u0659', '\u065A', '\u065B',
  '\u065C', '\u065D', '\u065E', '\u065F', '\u0670'
];

function normalizedArabicSearch(column: string, pattern: string): { sql: string; bindings: string[] } {
  let sql = 'LOWER(??)';
  const bindings = [column];
  for (const mark of ARABIC_DIACRITICS) {
    sql = `REPLACE(${sql}, ?, '')`;
    bindings.push(mark);
  }
  return { sql: `${sql} LIKE ?`, bindings: [...bindings, pattern] };
}

function provenanceFromRow(row: DbRow, prefix = '') {
  const field = (name: string) => row[`${prefix}${name}`];
  const candidate = {
    contentType: field('content_type'),
    sourceId: field('source_id'),
    edition: field('edition'),
    sourceUrl: field('source_url'),
    attribution: field('attribution'),
    licenseId: field('license_id'),
    redistributionAllowed: Boolean(field('redistribution_allowed')),
    reviewer: field('approval_reviewer'),
    reviewedAt: isoDate(field('approval_date')),
    approvalStatus: field('approval_decision'),
    reviewDecisionId: field('approval_id'),
    approvedByAuthority: field('approval_reviewer'),
    approvedAt: isoDate(field('approval_date')),
    checksum: field('checksum')
  };
  const parsed = ContentProvenanceSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

export class HadithLibraryService {
  constructor(private readonly db: Knex) {}

  private async approvedHadithSources(): Promise<Map<string, ReturnType<typeof provenanceFromRow>>> {
    const rows = await this.db('content_sources as cs')
      .join('content_source_approvals as csa', 'csa.source_id', 'cs.id')
      .where({
        'cs.content_type': 'hadith',
        'cs.is_active': true,
        'cs.redistribution_allowed': true,
        'csa.decision': 'approved'
      })
      .whereRaw('LOWER(TRIM(cs.reviewer)) <> LOWER(TRIM(csa.reviewer_id))')
      .whereRaw("LOWER(TRIM(csa.reviewer_id)) <> 'project-owner-chat-authorization'")
      .whereRaw('csa.artifact_sha256 = cs.checksum')
      .select(
        'cs.id as source_id',
        'cs.content_type as content_type',
        'cs.edition as edition',
        'cs.source_url as source_url',
        'cs.attribution as attribution',
        'cs.license_id as license_id',
        'cs.redistribution_allowed as redistribution_allowed',
        'cs.checksum as checksum',
        'csa.id as approval_id',
        'csa.decision as approval_decision',
        'csa.reviewer_id as approval_reviewer',
        'csa.approved_at as approval_date'
      );

    const sources = new Map<string, ReturnType<typeof provenanceFromRow>>();
    for (const row of rows) {
      const provenance = provenanceFromRow(row);
      if (provenance) sources.set(String(row.source_id), provenance);
    }
    return sources;
  }

  private verifiedRecordsQuery() {
    return this.db('hadith_records as hr')
      .join('hadith_books as hb', 'hb.id', 'hr.book_id')
      .join('content_sources as cs', 'cs.id', 'hr.source_id')
      .join('content_source_approvals as csa', 'csa.source_id', 'cs.id')
      .join('hadith_record_reviews as pr', 'pr.hadith_id', 'hr.id')
      .join('hadith_record_reviews as ir', 'ir.hadith_id', 'hr.id')
      .where({
        'cs.content_type': 'hadith',
        'cs.is_active': true,
        'cs.redistribution_allowed': true,
        'csa.decision': 'approved',
        'pr.review_role': 'primary',
        'pr.review_status': 'passed',
        'pr.text_match': true,
        'pr.reference_match': true,
        'ir.review_role': 'independent',
        'ir.review_status': 'passed',
        'ir.text_match': true,
        'ir.reference_match': true
      })
      .whereRaw('csa.artifact_sha256 = cs.checksum')
      .whereRaw('pr.artifact_sha256 = cs.checksum')
      .whereRaw('ir.artifact_sha256 = cs.checksum')
      .whereRaw('pr.reviewer_id <> ir.reviewer_id')
      .whereRaw('LOWER(TRIM(cs.reviewer)) <> LOWER(TRIM(csa.reviewer_id))')
      .whereRaw("LOWER(TRIM(csa.reviewer_id)) <> 'project-owner-chat-authorization'")
      .select(
        'hr.id as id',
        'hr.book_id as book_id',
        'hr.chapter_id as chapter_id',
        'hr.source_id as source_id',
        'hr.hadith_number as hadith_number',
        'hr.numbering_system as numbering_system',
        'hr.arabic_text as arabic_text',
        'hr.narrator_text as narrator_text',
        'hr.isnad_text as isnad_text',
        'hr.source_reference as source_reference',
        'hr.text_sha256 as text_sha256',
        'hb.slug as book_slug',
        'hb.title_arabic as book_title_arabic',
        'hb.title_english as book_title_english',
        'hb.title_bengali as book_title_bengali',
        'hb.compiler_name as compiler_name',
        'hb.collection_type as collection_type',
        'hb.edition as book_edition',
        'cs.content_type as content_type',
        'cs.edition as edition',
        'cs.source_url as source_url',
        'cs.attribution as attribution',
        'cs.license_id as license_id',
        'cs.redistribution_allowed as redistribution_allowed',
        'cs.checksum as checksum',
        'csa.id as approval_id',
        'csa.decision as approval_decision',
        'csa.reviewer_id as approval_reviewer',
        'csa.approved_at as approval_date'
      );
  }

  private async attachTranslations(
    records: DbRow[],
    locale?: string
  ): Promise<HadithServiceResult<DbRow[]>> {
    if (records.length === 0) return { status: 'ok', value: records };
    const ids = records.map((record) => String(record.id));
    let query = this.db('hadith_translations as ht')
      .join('content_sources as ts', 'ts.id', 'ht.source_id')
      .join('content_source_approvals as tsa', 'tsa.source_id', 'ts.id')
      .whereIn('ht.hadith_id', ids)
      .where({
        'ts.content_type': 'translation',
        'ts.is_active': true,
        'ts.redistribution_allowed': true,
        'tsa.decision': 'approved'
      })
      .whereRaw('LOWER(TRIM(ts.reviewer)) <> LOWER(TRIM(tsa.reviewer_id))')
      .whereRaw("LOWER(TRIM(tsa.reviewer_id)) <> 'project-owner-chat-authorization'")
      .whereRaw('tsa.artifact_sha256 = ts.checksum')
      .whereRaw('ht.license_id = ts.license_id');
    if (locale) query = query.where('ht.locale', locale);

    const rows = await query.select(
      'ht.id as translation_id',
      'ht.hadith_id as hadith_id',
      'ht.locale as locale',
      'ht.translator_name as translator_name',
      'ht.translation_text as translation_text',
      'ht.license_id as translation_license_id',
      'ht.text_sha256 as translation_sha256',
      'ts.content_type as content_type',
      'ts.id as source_id',
      'ts.edition as edition',
      'ts.source_url as source_url',
      'ts.attribution as attribution',
      'ts.license_id as license_id',
      'ts.redistribution_allowed as redistribution_allowed',
      'ts.checksum as checksum',
      'tsa.id as approval_id',
      'tsa.decision as approval_decision',
      'tsa.reviewer_id as approval_reviewer',
      'tsa.approved_at as approval_date'
    );

    const byRecord = new Map<string, DbRow[]>();
    for (const row of rows) {
      if (sha256(String(row.translation_text)) !== String(row.translation_sha256)) {
        return { status: 'integrity_rejected' };
      }
      const provenance = provenanceFromRow(row);
      if (!provenance) return { status: 'integrity_rejected' };
      const list = byRecord.get(String(row.hadith_id)) ?? [];
      list.push({
        id: row.translation_id,
        locale: row.locale,
        translatorName: row.translator_name,
        text: row.translation_text,
        licenseId: row.translation_license_id,
        provenance
      });
      byRecord.set(String(row.hadith_id), list);
    }

    return {
      status: 'ok',
      value: records.map((record) => ({
        ...record,
        translations: byRecord.get(String(record.id)) ?? []
      }))
    };
  }

  private async presentRecords(rows: DbRow[]): Promise<HadithServiceResult<DbRow[]>> {
    const records: DbRow[] = [];
    for (const row of rows) {
      if (sha256(String(row.arabic_text)) !== String(row.text_sha256)) {
        return { status: 'integrity_rejected' };
      }
      const provenance = provenanceFromRow(row);
      if (!provenance) return { status: 'integrity_rejected' };
      records.push({
        id: row.id,
        hadithNumber: row.hadith_number,
        numberingSystem: row.numbering_system,
        book: {
          id: row.book_id,
          slug: row.book_slug,
          titleArabic: row.book_title_arabic,
          titleEnglish: row.book_title_english,
          titleBengali: row.book_title_bengali,
          compilerName: row.compiler_name,
          collectionType: row.collection_type,
          edition: row.book_edition
        },
        chapterId: row.chapter_id,
        arabicText: row.arabic_text,
        narratorText: row.narrator_text,
        isnadText: row.isnad_text,
        sourceReference: row.source_reference,
        provenance,
        translations: []
      });
    }
    const translated = await this.attachTranslations(records, undefined);
    if (translated.status !== 'ok') return translated;
    return translated;
  }

  async listBooks(query: HadithPageQuery): Promise<HadithServiceResult<{ items: DbRow[]; total: number }>> {
    const sources = await this.approvedHadithSources();
    if (sources.size === 0) return { status: 'unavailable' };
    const sourceIds = [...sources.keys()];
    const countRow = await this.db('hadith_books').whereIn('source_id', sourceIds)
      .count<{ count: number | string }>({ count: '*' }).first();
    const rows = await this.db('hadith_books')
      .whereIn('source_id', sourceIds)
      .orderBy('sort_order', 'asc')
      .orderBy('slug', 'asc')
      .limit(query.limit)
      .offset(query.offset);
    return {
      status: 'ok',
      total: Number(countRow?.count ?? 0),
      value: {
        total: Number(countRow?.count ?? 0),
        items: rows.map((row) => ({
          id: row.id,
          slug: row.slug,
          titleArabic: row.title_arabic,
          titleEnglish: row.title_english,
          titleBengali: row.title_bengali,
          compilerName: row.compiler_name,
          collectionType: row.collection_type,
          edition: row.edition,
          provenance: sources.get(String(row.source_id))
        }))
      }
    };
  }

  async listChapters(bookId: string): Promise<HadithServiceResult<DbRow[]>> {
    const sources = await this.approvedHadithSources();
    if (sources.size === 0) return { status: 'unavailable' };
    const book = await this.db('hadith_books').where({ id: bookId }).whereIn('source_id', [...sources.keys()]).first();
    if (!book) return { status: 'not_found' };
    const rows = await this.db('hadith_chapters')
      .where({ book_id: bookId })
      .orderBy('sort_order', 'asc')
      .orderBy('chapter_number', 'asc');
    return {
      status: 'ok',
      value: rows.map((row) => ({
        id: row.id,
        bookId: row.book_id,
        chapterNumber: row.chapter_number,
        titleArabic: row.title_arabic,
        titleEnglish: row.title_english,
        titleBengali: row.title_bengali,
        sortOrder: row.sort_order
      }))
    };
  }

  async listRecords(bookId: string, query: HadithPageQuery): Promise<HadithServiceResult<{ items: DbRow[]; total: number }>> {
    const sources = await this.approvedHadithSources();
    if (sources.size === 0) return { status: 'unavailable' };
    const book = await this.db('hadith_books').where({ id: bookId }).whereIn('source_id', [...sources.keys()]).first();
    if (!book) return { status: 'not_found' };

    const base = this.verifiedRecordsQuery().where('hr.book_id', bookId);
    if (query.chapterId) base.where('hr.chapter_id', query.chapterId);
    const countRow = await base.clone().clearSelect().count<{ count: number | string }>({ count: 'hr.id' }).first();
    const rows = await base.clone().orderBy('hr.hadith_number', 'asc').limit(query.limit).offset(query.offset);
    const presented = await this.presentRecords(rows);
    if (presented.status !== 'ok') return presented;
    const items = query.locale
      ? presented.value.map((record) => ({
          ...record,
          translations: record.translations.filter((translation: DbRow) => translation.locale === query.locale)
        }))
      : presented.value;
    return { status: 'ok', total: Number(countRow?.count ?? 0), value: { items, total: Number(countRow?.count ?? 0) } };
  }

  async getRecord(recordId: string, locale?: string): Promise<HadithServiceResult<DbRow>> {
    const sources = await this.approvedHadithSources();
    if (sources.size === 0) return { status: 'unavailable' };
    const row = await this.verifiedRecordsQuery().where('hr.id', recordId).first();
    if (!row || !sources.has(String(row.source_id))) return { status: 'not_found' };
    const presented = await this.presentRecords([row]);
    if (presented.status !== 'ok') return presented;
    const record = presented.value[0];
    if (locale) record.translations = record.translations.filter((translation: DbRow) => translation.locale === locale);
    return { status: 'ok', value: record };
  }

  async search(queryText: string, locale: 'ar' | 'bn' | 'en' | undefined, query: HadithPageQuery): Promise<HadithServiceResult<{ items: DbRow[]; total: number }>> {
    const sources = await this.approvedHadithSources();
    if (sources.size === 0) return { status: 'unavailable' };
    const clean = queryText.trim().replace(/[%_]/g, '');
    if (!clean) return { status: 'not_found' };
    const pattern = `%${clean.toLowerCase()}%`;
    const normalizedArabicTerm = ARABIC_DIACRITICS.reduce((value, mark) => value.split(mark).join(''), clean.normalize('NFKC')).toLowerCase();
    const arabicPattern = `%${normalizedArabicTerm}%`;
    const base = this.verifiedRecordsQuery().where(function () {
      const searchArabic = !locale || locale === 'ar';
      const searchTranslation = !locale || locale === 'bn' || locale === 'en';
      if (searchArabic) {
        const columns = ['hr.arabic_text', 'hr.narrator_text', 'hr.isnad_text'];
        columns.forEach((column, index) => {
          const clause = normalizedArabicSearch(column, arabicPattern);
          if (index === 0) this.whereRaw(clause.sql, clause.bindings);
          else this.orWhereRaw(clause.sql, clause.bindings);
        });
      }
      if (searchTranslation) {
        const addTranslationMatch = function (this: Knex.QueryBuilder) {
          this.select('*').from('hadith_translations as ht')
            .join('content_sources as ts', 'ts.id', 'ht.source_id')
            .join('content_source_approvals as tsa', 'tsa.source_id', 'ts.id')
            .whereRaw('ht.hadith_id = hr.id')
            .where({
              'ts.content_type': 'translation',
              'ts.is_active': true,
              'ts.redistribution_allowed': true,
              'tsa.decision': 'approved'
            })
            .whereRaw('tsa.artifact_sha256 = ts.checksum')
            .whereRaw('ht.license_id = ts.license_id')
            .whereRaw('LOWER(??) LIKE ?', ['ht.translation_text', pattern]);
          if (locale) this.where('ht.locale', locale);
        };
        if (searchArabic) this.orWhereExists(addTranslationMatch);
        else this.whereExists(addTranslationMatch);
      }
    });
    const countRow = await base.clone().clearSelect().count<{ count: number | string }>({ count: 'hr.id' }).first();
    const rows = await base.clone().orderBy('hr.book_id', 'asc').orderBy('hr.hadith_number', 'asc')
      .limit(query.limit).offset(query.offset);
    const presented = await this.presentRecords(rows);
    if (presented.status !== 'ok') return presented;
    const items = locale
      ? presented.value.map((record) => ({ ...record, translations: record.translations.filter((translation: DbRow) => translation.locale === locale) }))
      : presented.value;
    return { status: 'ok', total: Number(countRow?.count ?? 0), value: { items, total: Number(countRow?.count ?? 0) } };
  }
}
