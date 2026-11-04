import { createHash } from 'node:crypto';
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
  EXPECTED_AYAH_COUNTS,
  TANZIL_LICENSE_ID,
  TANZIL_METADATA_URL,
  TANZIL_TEXT_URL,
  TANZIL_UTHMANI_EDITION,
  importTanzilUthmani,
  validateTanzilUthmaniArtifacts
} from '../src/db/import-tanzil.js';
import { createDatabaseConnection } from '../src/db/connection.js';
import { runMigrations } from '../src/db/migrate.js';

function buildOfficialShapeFixture(): { text: Buffer; metadata: Buffer } {
  const textRows: string[] = [];
  const metadataRows: string[] = [];

  EXPECTED_AYAH_COUNTS.forEach((ayahCount, surahIndex) => {
    const surahNumber = surahIndex + 1;
    metadataRows.push(
      `<sura index="${surahNumber}" name="سورة اختبار ${surahNumber}" tname="Test-${surahNumber}" ename="Test Chapter ${surahNumber}" type="${surahNumber % 2 === 0 ? 'Medinan' : 'Meccan'}" order="${surahNumber}" rukus="1" ayas="${ayahCount}" />`
    );

    for (let ayahNumber = 1; ayahNumber <= ayahCount; ayahNumber += 1) {
      textRows.push(`${surahNumber}|${ayahNumber}|نص اختبار غير قرآني ${surahNumber}:${ayahNumber}`);
    }
  });

  return {
    text: Buffer.from(`${textRows.join('\n')}\n`, 'utf8'),
    metadata: Buffer.from(`<?xml version="1.0" encoding="utf-8"?>\n<quran><suras>\n${metadataRows.join('\n')}\n</suras></quran>\n`, 'utf8')
  };
}

test('validates a complete Tanzil-shaped corpus without changing verse text', () => {
  const fixture = buildOfficialShapeFixture();
  const validated = validateTanzilUthmaniArtifacts(fixture.text, fixture.metadata);

  assert.equal(validated.report.surahCount, 114);
  assert.equal(validated.report.ayahCount, 6236);
  assert.equal(validated.report.artifactSha256, createHash('sha256').update(fixture.text).digest('hex'));
  assert.equal(validated.report.metadataSha256, createHash('sha256').update(fixture.metadata).digest('hex'));
  assert.equal(validated.report.exactTextPreserved, true);
  assert.equal(validated.ayahs[0].arabic, 'نص اختبار غير قرآني 1:1');
  assert.equal(validated.ayahs.at(-1)?.surahNumber, 114);
  assert.equal(validated.ayahs.at(-1)?.ayahNumber, 6);
});

test('rejects a missing Ayah row', () => {
  const fixture = buildOfficialShapeFixture();
  const lines = fixture.text.toString('utf8').trimEnd().split('\n');
  lines.splice(7, 1);
  assert.throws(
    () => validateTanzilUthmaniArtifacts(Buffer.from(lines.join('\n'), 'utf8'), fixture.metadata),
    /exactly 6236 verse rows/
  );
});

test('rejects reordered and duplicated Ayah coordinates', () => {
  const fixture = buildOfficialShapeFixture();
  const lines = fixture.text.toString('utf8').trimEnd().split('\n');
  [lines[0], lines[1]] = [lines[1], lines[0]];
  assert.throws(
    () => validateTanzilUthmaniArtifacts(Buffer.from(lines.join('\n'), 'utf8'), fixture.metadata),
    /expected 1:1/
  );

  const duplicate = fixture.text.toString('utf8').trimEnd().split('\n');
  duplicate[1] = duplicate[0];
  assert.throws(
    () => validateTanzilUthmaniArtifacts(Buffer.from(duplicate.join('\n'), 'utf8'), fixture.metadata),
    /expected 1:2/
  );
});

test('rejects incomplete or mismatched Tanzil metadata', () => {
  const fixture = buildOfficialShapeFixture();
  const withoutLastSurah = fixture.metadata.toString('utf8').replace(/<sura index="114"[^>]*\/>\s*/u, '');
  assert.throws(
    () => validateTanzilUthmaniArtifacts(fixture.text, Buffer.from(withoutLastSurah, 'utf8')),
    /exactly 114 Surahs/
  );

  const wrongCount = fixture.metadata.toString('utf8').replace('index="1" name="سورة اختبار 1"', 'index="1" name="سورة اختبار 1"').replace('ayas="7"', 'ayas="8"');
  assert.throws(
    () => validateTanzilUthmaniArtifacts(fixture.text, Buffer.from(wrongCount, 'utf8')),
    /expected 7/
  );
});

test('imports only after exact artifact checksum and independent approval are registered', async () => {
  const fixture = buildOfficialShapeFixture();
  const validated = validateTanzilUthmaniArtifacts(fixture.text, fixture.metadata);
  const db = createDatabaseConnection({
    client: 'sqlite3',
    connection: { filename: ':memory:' },
    useNullAsDefault: true
  });
  const sourceId = 'tanzil-uthmani-test-source';
  const now = '2026-11-04 00:00:00';

  try {
    await runMigrations(db);
    await db('content_sources').insert({
      id: sourceId,
      code: 'tanzil-uthmani-test',
      name: 'Tanzil Quran Text (Uthmani)',
      content_type: 'quran',
      edition: TANZIL_UTHMANI_EDITION,
      source_url: TANZIL_TEXT_URL,
      attribution: 'Tanzil Project. License: Creative Commons Attribution 3.0. Source: https://tanzil.net/',
      license_id: TANZIL_LICENSE_ID,
      redistribution_allowed: true,
      reviewer: 'independent-reviewer',
      reviewed_at: now,
      checksum: validated.report.artifactSha256,
      is_active: false
    });
    await assert.rejects(
      () => importTanzilUthmani(db, sourceId, fixture.text, fixture.metadata),
      /separate human source approval/
    );
    assert.equal(Number((await db('quran_surahs').count('* as count').first())?.count), 0);

    await db('content_source_approvals').insert({
      id: 'tanzil-test-approval',
      source_id: sourceId,
      decision: 'approved',
      reviewer_id: 'independent-reviewer',
      approved_at: now,
      artifact_sha256: validated.report.artifactSha256,
      review_notes: 'Synthetic test fixture only; no Quran content.'
    });

    const report = await importTanzilUthmani(db, sourceId, fixture.text, fixture.metadata);
    assert.equal(report.surahCount, 114);
    assert.equal(report.ayahCount, 6236);
    assert.equal(Number((await db('quran_surahs').count('* as count').first())?.count), 114);
    assert.equal(Number((await db('quran_ayahs').count('* as count').first())?.count), 6236);
    const source = await db('content_sources').where({ id: sourceId }).first();
    assert.equal(Number(source.is_active), 1);
  } finally {
    await db.destroy();
  }
});
