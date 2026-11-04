import { createHash } from 'node:crypto';
import type { Knex } from 'knex';
import {
  importTanzilUthmani,
  TANZIL_LICENSE_ID,
  TANZIL_METADATA_URL,
  TANZIL_TEXT_URL,
  TANZIL_UTHMANI_EDITION,
  validateTanzilUthmaniArtifacts
} from './import-tanzil.js';

const SOURCE_ID = 'tanzil-uthmani-v1';
const ATTRIBUTION =
  'Tanzil Quran Text (Uthmani), Tanzil Project. Creative Commons Attribution 3.0 (CC BY 3.0). Verbatim and unmodified. Source: https://tanzil.net/.';

async function assertIndependentlyApprovedSource(
  db: Knex,
  artifactSha256: string,
  metadataSha256: string
): Promise<void> {
  const source = await db('content_sources').where({ id: SOURCE_ID }).first();
  if (!source) throw new Error('Tanzil source must be registered and independently reviewed before import.');
  if (
    source.content_type !== 'quran' ||
    source.edition !== TANZIL_UTHMANI_EDITION ||
    source.source_url !== TANZIL_TEXT_URL ||
    source.license_id !== TANZIL_LICENSE_ID ||
    !String(source.attribution ?? '').includes('Tanzil Project') ||
    !String(source.attribution ?? '').includes('Creative Commons Attribution 3.0') ||
    !String(source.attribution ?? '').includes('https://tanzil.net/') ||
    !(source.redistribution_allowed === true || source.redistribution_allowed === 1 || source.redistribution_allowed === '1') ||
    !source.reviewer ||
    source.reviewer === 'project-owner-chat-authorization' ||
    !source.reviewed_at ||
    String(source.checksum).toLowerCase() !== artifactSha256 ||
    source.is_active === true
  ) throw new Error('Tanzil source registration is incomplete, unverified, active, or does not match the exact artifact.');

  const approval = await db('content_source_approvals').where({ source_id: SOURCE_ID }).first();
  if (
    !approval ||
    approval.decision !== 'approved' ||
    !approval.reviewer_id ||
    approval.reviewer_id === 'project-owner-chat-authorization' ||
    approval.reviewer_id === source.reviewer ||
    !approval.approved_at ||
    !approval.review_notes ||
    String(approval.artifact_sha256).toLowerCase() !== artifactSha256 ||
    !String(approval.review_notes).includes(metadataSha256)
  ) throw new Error('A separate, independent human approval bound to the exact Tanzil text and metadata checksums is required.');
}

/**
 * One-time, source-approved import. This runs only when the explicit
 * DEENVERSE_SEED_TANZIL_UTHMANI environment flag is enabled.
 */
export async function seedTanzilUthmaniFromOfficialSource(db: Knex): Promise<void> {
  const downloadUrl = new URL('https://tanzil.net/pub/download/index.php');
  downloadUrl.searchParams.set('quranType', 'uthmani');
  downloadUrl.searchParams.set('outType', 'txt');
  downloadUrl.searchParams.set('agree', 'true');

  const [textBytes, metadataBytes] = await Promise.all([
    downloadBytes(downloadUrl.toString(), {
      headers: {
        'accept': 'text/plain, application/octet-stream;q=0.9, */*;q=0.8',
        'referer': 'https://tanzil.net/download/'
      }
    }, 100_000),
    downloadBytes(TANZIL_METADATA_URL, {
      headers: { 'accept': 'application/xml, text/xml;q=0.9, */*;q=0.8' }
    }, 1_000)
  ]);

  const rawLineCount = new TextDecoder('utf-8', { fatal: true }).decode(textBytes).split(/\r?\n/u).length - 1;
  console.info(JSON.stringify({
    tanzilArtifactDiagnostics: {
      format: 'plain-one-verse-per-line-with-official-license-footer',
      rawLineCount,
      expectedAyahCount: 6236
    }
  }));

  const validated = validateTanzilUthmaniArtifacts(textBytes, metadataBytes);
  if (
    validated.report.surahCount !== 114 ||
    validated.report.ayahCount !== 6236 ||
    validated.report.exactTextPreserved !== true
  ) {
    throw new Error('Tanzil Quran corpus failed canonical count or exact-text validation.');
  }

  const [surahCountResult, ayahCountResult] = await Promise.all([
    db('quran_surahs').count<{ count: number | string }>('* as count').first(),
    db('quran_ayahs').count<{ count: number | string }>('* as count').first()
  ]);
  const surahCount = Number(surahCountResult?.count ?? 0);
  const ayahCount = Number(ayahCountResult?.count ?? 0);

  if (surahCount === 114 && ayahCount === 6236) {
    const existingSource = await db('content_sources').where({ id: SOURCE_ID }).first();
    if (
      existingSource?.is_active === true &&
      existingSource.checksum === validated.report.artifactSha256
    ) {
      console.log(JSON.stringify({
        mode: 'already-imported',
        sourceId: SOURCE_ID,
        surahCount,
        ayahCount,
        artifactSha256: validated.report.artifactSha256
      }));
      return;
    }
    throw new Error('Quran tables already contain records, but they do not match this complete approved Tanzil import.');
  }

  if (surahCount !== 0 || ayahCount !== 0) {
    throw new Error('Quran tables contain partial data; refusing to overwrite or mix editions.');
  }

  await assertIndependentlyApprovedSource(
    db,
    validated.report.artifactSha256,
    validated.report.metadataSha256
  );

  const report = await importTanzilUthmani(db, SOURCE_ID, textBytes, metadataBytes);
  console.log(JSON.stringify({
    mode: 'imported',
    sourceId: SOURCE_ID,
    ...report
  }));
}
