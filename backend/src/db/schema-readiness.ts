import type { Knex } from 'knex';

/** Required runtime column names from the additive migrations. This validates
 * structure, not column types, constraints, approved content, or source rights. */
export const REQUIRED_SCHEMA_COLUMNS = {
  content_sources: ['id', 'code', 'name', 'content_type', 'edition', 'source_url', 'attribution', 'license_id', 'redistribution_allowed', 'reviewer', 'reviewed_at', 'checksum', 'is_active', 'created_at'],
  quran_surahs: ['surah_number', 'name_arabic', 'name_simple', 'name_english', 'revelation_place', 'revelation_order', 'verses_count', 'source_id'],
  content_source_approvals: ['id', 'source_id', 'decision', 'reviewer_id', 'approved_at', 'artifact_sha256', 'review_notes'],
  quran_ayahs: ['id', 'surah_number', 'ayah_number', 'arabic', 'text_sha256', 'source_id'],
  hadith_books: ['id', 'source_id', 'slug', 'title_arabic', 'title_english', 'title_bengali', 'compiler_name', 'collection_type', 'edition', 'sort_order'],
  hadith_chapters: ['id', 'book_id', 'source_id', 'chapter_number', 'title_arabic', 'title_english', 'title_bengali', 'sort_order'],
  hadith_records: ['id', 'book_id', 'chapter_id', 'source_id', 'hadith_number', 'numbering_system', 'arabic_text', 'narrator_text', 'isnad_text', 'source_reference', 'text_sha256'],
  hadith_translations: ['id', 'hadith_id', 'source_id', 'locale', 'translator_name', 'translation_text', 'license_id', 'text_sha256'],
  hadith_grade_assessments: ['id', 'hadith_id', 'source_id', 'grade', 'grading_authority', 'grading_work', 'grading_reference', 'assessment_note', 'assessment_sha256', 'assessed_at'],
  hadith_record_reviews: ['id', 'hadith_id', 'source_id', 'review_role', 'review_status', 'artifact_sha256', 'reviewer_id', 'reviewed_at', 'text_match', 'reference_match', 'issue_note'],
  problem_reports: ['id', 'category', 'description', 'steps_to_reproduce', 'current_section', 'app_version', 'surah_number', 'ayah_number', 'diagnostics', 'status', 'created_at'],
} as const;

export async function hasRequiredSchema(db: Knex): Promise<boolean> {
  for (const [table, requiredColumns] of Object.entries(REQUIRED_SCHEMA_COLUMNS)) {
    if (!(await db.schema.hasTable(table))) return false;
    const columns = await db(table).columnInfo();
    if (!requiredColumns.every((column) => Object.hasOwn(columns, column))) return false;
  }
  return true;
}
