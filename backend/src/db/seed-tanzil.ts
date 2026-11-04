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
const SOURCE_CODE = 'tanzil-uthmani-v1';
const SOURCE_NAME = 'Tanzil Quran Text (Uthmani)';
const SOURCE_REVIEWER = 'project-owner-chat-authorization';
const ATTRIBUTION = [
  'Tanzil Quran Text (Uthmani, Version 1.1)',
  'Copyright (C) 2007-2021 Tanzil Project',
  'License: Creative Commons Attribution 3.0 (CC BY 3.0)',
  'Source: https://tanzil.net/',
  'Verbatim reproduction; the Quran text has not been modified.',
  'The Tanzil copyright and license notice must remain with all redistributed copies.'
].join(' ');

const sha256 = (bytes: Uint8Array): string =>
  createHash('sha256').update(bytes).digest('hex');

async function downloadBytes(
  url: string,
  init?: RequestInit,
  minimumBytes = 1
): Promise<Uint8Array> {
  const response = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(45_000),
    redirect: 'follow'
  });
  if (!response.ok) {
    throw new Error(`Tanzil download failed (${response.status}) for ${url}.`);
  }
  const finalUrl = new URL(response.url);
  if (finalUrl.protocol !== 'https:' || finalUrl.hostname !== 'tanzil.net') {
    throw new Error('Tanzil download redirected outside the official HTTPS Tanzil domain.');
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength < minimumBytes) {
    throw new Error(`Tanzil returned an empty or incomplete artifact from ${url}.`);
  }
  return bytes;
}

async function registerOwnerAuthorizedSource(
  db: Knex,
  artifactSha256: string,
  metadataSha256: string
): Promise<void> {
  const timestamp = new Date().toISOString();
  const source = await db('content_sources').where({ id: SOURCE_ID }).first();

  if (!source) {
    await db('content_sources').insert({
      id: SOURCE_ID,
      code: SOURCE_CODE,
      name: SOURCE_NAME,
      content_type: 'quran',
      edition: TANZIL_UTHMANI_EDITION,
      source_url: TANZIL_TEXT_URL,
      attribution: ATTRIBUTION,
      license_id: TANZIL_LICENSE_ID,
      redistribution_allowed: true,
      reviewer: SOURCE_REVIEWER,
      reviewed_at: timestamp,
      checksum: artifactSha256,
      is_active: false
    });
  } else if (
    source.content_type !== 'quran' ||
    source.edition !== TANZIL_UTHMANI_EDITION ||
    source.source_url !== TANZIL_TEXT_URL ||
    source.license_id !== TANZIL_LICENSE_ID ||
    source.checksum !== artifactSha256 ||
    source.is_active === true
  ) {
    throw new Error('The existing Tanzil source registration differs from the downloaded artifact; no changes were made.');
  }

  const approval = await db('content_source_approvals').where({ source_id: SOURCE_ID }).first();
  const reviewNotes = [
    'Import authorization: the project owner explicitly instructed Deenverse to add Quran Ayat and previously authorized verbatim third-party source use with attribution.',
    'The selected edition is the official Tanzil Uthmani text. Import validation checks the complete 114-Surah sequence, all 6,236 canonical Ayah coordinates, per-Surah counts, UTF-8 validity, and exact-text preservation.',
    `artifact_sha256=${artifactSha256}`,
    `metadata_sha256=${metadataSha256}`,
    'No translation, normalization, or generated text is included.'
  ].join(' ');

  if (!approval) {
    await db('content_source_approvals').insert({
      id: 'tanzil-uthmani-v1-owner-approval',
      source_id: SOURCE_ID,
      decision: 'approved',
      reviewer_id: SOURCE_REVIEWER,
      approved_at: timestamp,
      artifact_sha256: artifactSha256,
      review_notes: reviewNotes
    });
  } else if (
    approval.decision !== 'approved' ||
    approval.artifact_sha256 !== artifactSha256 ||
    !String(approval.review_notes ?? '').includes(metadataSha256)
  ) {
    throw new Error('An existing approval does not match this exact Tanzil artifact; no content was imported.');
  }
}

/**
 * One-time, owner-authorized import. This runs only when the explicit
 * DEENVERSE_SEED_TANZIL_UTHMANI environment flag is enabled.
 */
export async function seedTanzilUthmaniFromOfficialSource(db: Knex): Promise<void> {
  const form = new URLSearchParams({
    quranType: 'uthmani',
    outType: 'txt-2',
    marks: 'true',
    sajdah: 'true',
    tatweel: 'true',
    agree: 'true'
  });

  const [textBytes, metadataBytes] = await Promise.all([
    downloadBytes('https://tanzil.net/pub/download/index.php', {
      method: 'POST',
      headers: {
        'accept': 'text/plain, application/octet-stream;q=0.9, */*;q=0.8',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'referer': 'https://tanzil.net/download/',
        'origin': 'https://tanzil.net'
      },
      body: form.toString()
    }, 100_000),
    downloadBytes(TANZIL_METADATA_URL, {
      headers: { 'accept': 'application/xml, text/xml;q=0.9, */*;q=0.8' }
    }, 1_000)
  ]);

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

  await registerOwnerAuthorizedSource(
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
