import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Knex } from 'knex';
import { createDatabaseConnection } from './connection.js';

export const TANZIL_UTHMANI_EDITION = 'Tanzil Quran Text (Uthmani, Version 1.1)';
export const TANZIL_TEXT_URL = 'https://tanzil.net/download/';
export const TANZIL_METADATA_URL = 'https://tanzil.net/res/text/metadata/quran-data.xml';
export const TANZIL_LICENSE_ID = 'CC-BY-3.0';

export const EXPECTED_AYAH_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128,
  111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73,
  54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60,
  49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52,
  44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19,
  26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3,
  6, 3, 5, 4, 5, 6
] as const;

const EXPECTED_TOTAL_AYAHS = EXPECTED_AYAH_COUNTS.reduce((sum, count) => sum + count, 0);

export interface TanzilSurahMetadata {
  surahNumber: number;
  nameArabic: string;
  nameSimple: string;
  nameEnglish: string;
  revelationPlace: 'makkah' | 'madinah';
  revelationOrder: number;
  versesCount: number;
}

export interface TanzilAyahRecord {
  surahNumber: number;
  ayahNumber: number;
  arabic: string;
  textSha256: string;
}

export interface TanzilValidationReport {
  sourceEdition: typeof TANZIL_UTHMANI_EDITION;
  sourceTextUrl: typeof TANZIL_TEXT_URL;
  metadataUrl: typeof TANZIL_METADATA_URL;
  artifactSha256: string;
  metadataSha256: string;
  surahCount: number;
  ayahCount: number;
  perSurahCounts: number[];
  exactTextPreserved: true;
}

export interface ValidatedTanzilImport {
  report: TanzilValidationReport;
  surahs: TanzilSurahMetadata[];
  ayahs: TanzilAyahRecord[];
}

const sha256 = (value: Uint8Array | string): string =>
  createHash('sha256').update(value).digest('hex');

function decodeUtf8(bytes: Uint8Array, label: string): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new Error(`${label} is not valid UTF-8.`);
  }
}

function decodeXml(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/giu, (entity, code: string) => {
    const normalized = code.toLowerCase();
    if (normalized === 'amp') return '&';
    if (normalized === 'lt') return '<';
    if (normalized === 'gt') return '>';
    if (normalized === 'quot') return '"';
    if (normalized === 'apos') return "'";
    const point = normalized.startsWith('#x')
      ? Number.parseInt(normalized.slice(2), 16)
      : Number.parseInt(normalized.slice(1), 10);
    if (!Number.isInteger(point) || point < 0 || point > 0x10ffff || (point >= 0xd800 && point <= 0xdfff)) {
      throw new Error('Tanzil metadata contains an invalid XML character reference.');
    }
    return String.fromCodePoint(point);
  });
}

function parseXmlAttributes(source: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const attributePattern = /([a-zA-Z_][\w:.-]*)\s*=\s*"([^"]*)"/gu;
  for (const match of source.matchAll(attributePattern)) {
    attributes[match[1]] = decodeXml(match[2]);
  }
  return attributes;
}

export function parseTanzilMetadata(metadataBytes: Uint8Array): TanzilSurahMetadata[] {
  const xml = decodeUtf8(metadataBytes, 'Tanzil metadata');
  if (xml.charCodeAt(0) === 0xfeff) throw new Error('Tanzil metadata must not contain a UTF-8 BOM.');

  const surahs: TanzilSurahMetadata[] = [];
  const surahPattern = /<sura\b([^>]*)\/>/gu;
  for (const match of xml.matchAll(surahPattern)) {
    const attributes = parseXmlAttributes(match[1]);
    const surahNumber = Number(attributes.index);
    const versesCount = Number(attributes.ayas);
    const revelationOrder = Number(attributes.order);
    const revelationType = (attributes.type ?? '').toLowerCase();
    const revelationPlace = revelationType === 'meccan' || revelationType === 'makkah'
      ? 'makkah'
      : revelationType === 'medinan' || revelationType === 'madinan' || revelationType === 'madinah'
        ? 'madinah'
        : null;

    const nameArabic = attributes.name ?? '';
    const nameSimple = attributes.tname ?? '';
    const nameEnglish = attributes.ename ?? '';
    if (
      !Number.isInteger(surahNumber) ||
      !Number.isInteger(versesCount) ||
      !Number.isInteger(revelationOrder) ||
      !revelationPlace ||
      !nameArabic ||
      !nameSimple ||
      !nameEnglish
    ) {
      throw new Error(`Tanzil metadata has invalid fields for Surah ${attributes.index ?? 'unknown'}.`);
    }

    surahs.push({
      surahNumber,
      nameArabic,
      nameSimple,
      nameEnglish,
      revelationPlace,
      revelationOrder,
      versesCount
    });
  }

  if (surahs.length !== 114) {
    throw new Error(`Tanzil metadata must contain exactly 114 Surahs; found ${surahs.length}.`);
  }

  for (let index = 0; index < surahs.length; index += 1) {
    const surah = surahs[index];
    const expectedNumber = index + 1;
    const expectedAyahs = EXPECTED_AYAH_COUNTS[index];
    if (surah.surahNumber !== expectedNumber) {
      throw new Error(`Tanzil metadata Surahs are missing, duplicated, or reordered at position ${expectedNumber}.`);
    }
    if (surah.versesCount !== expectedAyahs) {
      throw new Error(
        `Tanzil metadata reports ${surah.versesCount} Ayahs for Surah ${expectedNumber}; expected ${expectedAyahs}.`
      );
    }
  }

  return surahs;
}

export function parseTanzilUthmaniText(textBytes: Uint8Array): TanzilAyahRecord[] {
  const text = decodeUtf8(textBytes, 'Tanzil Uthmani text');
  if (text.charCodeAt(0) === 0xfeff) throw new Error('Tanzil Uthmani text must not contain a UTF-8 BOM.');

  const lines = text.split('\n');
  if (lines.at(-1) === '') lines.pop();
  if (lines.length !== EXPECTED_TOTAL_AYAHS) {
    throw new Error(`Tanzil Uthmani text must contain exactly ${EXPECTED_TOTAL_AYAHS} verse rows; found ${lines.length}.`);
  }

  const ayahs: TanzilAyahRecord[] = [];
  let expectedSurah = 1;
  let expectedAyah = 1;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].endsWith('\r') ? lines[index].slice(0, -1) : lines[index];
    const match = /^([1-9]\d*)\|([1-9]\d*)\|(.+)$/u.exec(line);
    if (!match) throw new Error(`Tanzil Uthmani row ${index + 1} is not in surah|ayah|text format.`);

    const surahNumber = Number(match[1]);
    const ayahNumber = Number(match[2]);
    const arabic = match[3];

    if (surahNumber !== expectedSurah || ayahNumber !== expectedAyah) {
      throw new Error(
        `Tanzil Uthmani row ${index + 1} is ${surahNumber}:${ayahNumber}; expected ${expectedSurah}:${expectedAyah}.`
      );
    }
    if (arabic.length === 0 || arabic.includes('\u0000')) {
      throw new Error(`Tanzil Uthmani row ${index + 1} contains empty or invalid verse text.`);
    }

    ayahs.push({
      surahNumber,
      ayahNumber,
      arabic,
      textSha256: sha256(arabic)
    });

    expectedAyah += 1;
    if (expectedAyah > EXPECTED_AYAH_COUNTS[expectedSurah - 1]) {
      expectedSurah += 1;
      expectedAyah = 1;
    }
  }

  if (expectedSurah !== 115 || expectedAyah !== 1) {
    throw new Error('Tanzil Uthmani text ended before the canonical Surah/Ayah sequence was complete.');
  }
  return ayahs;
}

export function validateTanzilUthmaniArtifacts(
  textBytes: Uint8Array,
  metadataBytes: Uint8Array
): ValidatedTanzilImport {
  const surahs = parseTanzilMetadata(metadataBytes);
  const ayahs = parseTanzilUthmaniText(textBytes);
  const perSurahCounts = surahs.map((surah) => surah.versesCount);

  return {
    report: {
      sourceEdition: TANZIL_UTHMANI_EDITION,
      sourceTextUrl: TANZIL_TEXT_URL,
      metadataUrl: TANZIL_METADATA_URL,
      artifactSha256: sha256(textBytes),
      metadataSha256: sha256(metadataBytes),
      surahCount: surahs.length,
      ayahCount: ayahs.length,
      perSurahCounts,
      exactTextPreserved: true
    },
    surahs,
    ayahs
  };
}

function isTruthyDatabaseBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === '1';
}

async function assertImportApproval(
  db: Knex,
  sourceId: string,
  artifactSha256: string,
  metadataSha256: string
): Promise<Record<string, unknown>> {
  const source = await db('content_sources').where({ id: sourceId }).first();
  if (!source) throw new Error(`Quran source ${sourceId} is not registered in content_sources.`);
  if (source.content_type !== 'quran') throw new Error('Registered source content_type must be quran.');
  if (source.edition !== TANZIL_UTHMANI_EDITION) {
    throw new Error(`Registered source edition must be exactly "${TANZIL_UTHMANI_EDITION}".`);
  }
  if (source.source_url !== TANZIL_TEXT_URL) throw new Error('Registered source URL must be the official Tanzil download page.');
  if (source.license_id !== TANZIL_LICENSE_ID) throw new Error(`Registered license_id must be ${TANZIL_LICENSE_ID}.`);
  if (!String(source.attribution ?? '').includes('Tanzil Project') ||
      !String(source.attribution ?? '').includes('Creative Commons Attribution 3.0') ||
      !String(source.attribution ?? '').includes('https://tanzil.net/')) {
    throw new Error('Registered attribution must identify Tanzil Project, CC BY 3.0, and https://tanzil.net/.');
  }
  if (!isTruthyDatabaseBoolean(source.redistribution_allowed)) {
    throw new Error('The registered source must explicitly allow verbatim redistribution.');
  }
  if (!source.reviewer || !source.reviewed_at || Number.isNaN(new Date(source.reviewed_at).getTime())) {
    throw new Error('The source record is missing a valid reviewer or source-review date.');
  }
  if (String(source.checksum).toLowerCase() !== artifactSha256) {
    throw new Error('Downloaded artifact SHA-256 does not match the registered source checksum.');
  }
  if (isTruthyDatabaseBoolean(source.is_active)) {
    throw new Error('Tanzil source must remain inactive until the complete import transaction succeeds.');
  }

  const approval = await db('content_source_approvals').where({ source_id: sourceId }).first();
  if (!approval || approval.decision !== 'approved') {
    throw new Error('A separate human source approval is required before importing Quran text.');
  }
  if (String(approval.artifact_sha256).toLowerCase() !== artifactSha256) {
    throw new Error('Human approval is not bound to the exact downloaded artifact SHA-256.');
  }
  if (!approval.reviewer_id || !approval.approved_at || !approval.review_notes) {
    throw new Error('The source approval record is missing reviewer, approval date, or review notes.');
  }
  if (!String(approval.review_notes).toLowerCase().includes(metadataSha256)) {
    throw new Error('Human approval notes must include the exact Tanzil metadata XML SHA-256.');
  }

  return source;
}

async function importValidatedTanzilUthmani(
  db: Knex,
  sourceId: string,
  validated: ValidatedTanzilImport
): Promise<TanzilValidationReport> {
  await assertImportApproval(db, sourceId, validated.report.artifactSha256, validated.report.metadataSha256);

  const [existingSurahCount, existingAyahCount] = await Promise.all([
    db('quran_surahs').count<{ count: number | string }>('* as count').first(),
    db('quran_ayahs').count<{ count: number | string }>('* as count').first()
  ]);
  if (Number(existingSurahCount?.count ?? 0) !== 0) {
    throw new Error('quran_surahs is not empty; refusing to overwrite or mix Quran editions.');
  }
  if (Number(existingAyahCount?.count ?? 0) !== 0) {
    throw new Error('quran_ayahs is not empty; refusing to overwrite or mix Quran editions.');
  }

  await db.transaction(async (trx) => {
    await assertImportApproval(trx, sourceId, validated.report.artifactSha256, validated.report.metadataSha256);

    await trx('quran_surahs').insert(validated.surahs.map((surah) => ({
      surah_number: surah.surahNumber,
      name_arabic: surah.nameArabic,
      name_simple: surah.nameSimple,
      name_english: surah.nameEnglish,
      revelation_place: surah.revelationPlace,
      revelation_order: surah.revelationOrder,
      verses_count: surah.versesCount,
      source_id: sourceId
    })));

    const batchSize = 150;
    for (let offset = 0; offset < validated.ayahs.length; offset += batchSize) {
      const batch = validated.ayahs.slice(offset, offset + batchSize);
      await trx('quran_ayahs').insert(batch.map((ayah) => ({
        surah_number: ayah.surahNumber,
        ayah_number: ayah.ayahNumber,
        arabic: ayah.arabic,
        text_sha256: ayah.textSha256,
        source_id: sourceId
      })));
    }

    const [surahCount, ayahCount] = await Promise.all([
      trx('quran_surahs').where({ source_id: sourceId }).count<{ count: number | string }>('* as count').first(),
      trx('quran_ayahs').where({ source_id: sourceId }).count<{ count: number | string }>('* as count').first()
    ]);
    if (Number(surahCount?.count ?? 0) !== 114 || Number(ayahCount?.count ?? 0) !== EXPECTED_TOTAL_AYAHS) {
      throw new Error('Imported Quran row counts failed the final transaction check.');
    }

    const activated = await trx('content_sources')
      .where({ id: sourceId, is_active: false })
      .update({ is_active: true });
    if (activated !== 1) throw new Error('Could not activate the fully imported, approved Tanzil source.');
  });

  return validated.report;
}

export async function importTanzilUthmani(
  db: Knex,
  sourceId: string,
  textBytes: Uint8Array,
  metadataBytes: Uint8Array
): Promise<TanzilValidationReport> {
  const validated = validateTanzilUthmaniArtifacts(textBytes, metadataBytes);
  return importValidatedTanzilUthmani(db, sourceId, validated);
}

function readOption(args: string[], option: string): string | undefined {
  const index = args.indexOf(option);
  if (index === -1) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`${option} requires a value.`);
  return value;
}

async function runCli(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log([
      'Usage:',
      '  npm run quran:import:tanzil -- --artifact <official-text-file> --metadata <official-quran-data.xml> --source-id <approved-source-id> --expected-sha256 <sha256> [--apply]',
      '',
      'Without --apply, this command validates the files and prints a dry-run report.',
      'With --apply, it imports only when the exact artifact hash is registered and separately approved in the database.'
    ].join('\n'));
    return;
  }

  const artifactPath = readOption(args, '--artifact');
  const metadataPath = readOption(args, '--metadata');
  const sourceId = readOption(args, '--source-id');
  const expectedSha256 = readOption(args, '--expected-sha256')?.toLowerCase();
  const apply = args.includes('--apply');

  if (!artifactPath || !metadataPath || !sourceId || !expectedSha256) {
    throw new Error('Required: --artifact, --metadata, --source-id, and --expected-sha256. Use --help for usage.');
  }
  if (!/^[a-f0-9]{64}$/u.test(expectedSha256)) {
    throw new Error('--expected-sha256 must be a 64-character hexadecimal SHA-256 digest.');
  }
  const allowed = new Set(['--artifact', '--metadata', '--source-id', '--expected-sha256', '--apply', '--help']);
  for (const argument of args) {
    if (argument.startsWith('--') && !allowed.has(argument)) throw new Error(`Unknown option: ${argument}`);
  }

  const artifactBytes = await readFile(resolve(artifactPath));
  const metadataBytes = await readFile(resolve(metadataPath));
  const validated = validateTanzilUthmaniArtifacts(artifactBytes, metadataBytes);
  if (validated.report.artifactSha256 !== expectedSha256) {
    throw new Error(`Artifact SHA-256 mismatch. Actual digest: ${validated.report.artifactSha256}`);
  }

  if (!apply) {
    console.log(JSON.stringify({
      mode: 'dry-run',
      sourceId,
      ...validated.report,
      databaseChanged: false,
      nextStep: 'Register this exact artifact hash, complete independent human approval, then rerun with --apply.'
    }, null, 2));
    return;
  }

  const db = createDatabaseConnection();
  try {
    const report = await importTanzilUthmani(db, sourceId, artifactBytes, metadataBytes);
    console.log(JSON.stringify({ mode: 'imported', sourceId, ...report, databaseChanged: true }, null, 2));
  } finally {
    await db.destroy();
  }
}

const invokedPath = process.argv[1];
if (invokedPath && import.meta.url === pathToFileURL(resolve(invokedPath)).href) {
  runCli().catch((error: unknown) => {
    console.error('Tanzil Quran import failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
