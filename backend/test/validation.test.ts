import test from 'node:test';
import assert from 'node:assert/strict';
import { ContentProvenanceSchema, PaginationQuerySchema, decodeCursor, encodeCursor } from '../src/services/validation.js';

test('Validation Service', async (t) => {
  await t.test('validates approved content provenance correctly', () => {
    const validProvenance = {
      contentType: 'quran',
      sourceId: 'src-tanzil-uthmani',
      edition: '1.0.2',
      sourceUrl: 'https://tanzil.net/pub/download/quran-uthmani.txt',
      attribution: 'Tanzil Project Verified Quran Metadata',
      licenseId: 'CC-BY-3.0',
      redistributionAllowed: true,
      reviewer: 'Islamic Editorial Board',
      reviewedAt: '2026-11-01T00:00:00.000Z',
      checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    };

    const parsed = ContentProvenanceSchema.safeParse(validProvenance);
    assert.equal(parsed.success, true);
  });

  await t.test('rejects unapproved redistribution permission', () => {
    const unapproved = {
      contentType: 'quran',
      sourceId: 'src-tanzil-uthmani',
      edition: '1.0.2',
      sourceUrl: 'https://tanzil.net/pub/download/quran-uthmani.txt',
      attribution: 'Tanzil Project Verified Quran Metadata',
      licenseId: 'CC-BY-3.0',
      redistributionAllowed: false, // rejected!
      reviewer: 'Islamic Editorial Board',
      reviewedAt: '2026-11-01T00:00:00.000Z',
      checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    };

    const parsed = ContentProvenanceSchema.safeParse(unapproved);
    assert.equal(parsed.success, false);
  });

  await t.test('rejects non-HTTPS source URLs', () => {
    const insecureUrl = {
      contentType: 'quran',
      sourceId: 'src-tanzil-uthmani',
      edition: '1.0.2',
      sourceUrl: 'http://tanzil.net/pub/download/quran-uthmani.txt', // HTTP!
      attribution: 'Tanzil Project Verified Quran Metadata',
      licenseId: 'CC-BY-3.0',
      redistributionAllowed: true,
      reviewer: 'Islamic Editorial Board',
      reviewedAt: '2026-11-01T00:00:00.000Z',
      checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    };

    const parsed = ContentProvenanceSchema.safeParse(insecureUrl);
    assert.equal(parsed.success, false);
  });

  await t.test('validates pagination limits and cursors', () => {
    const valid = PaginationQuerySchema.safeParse({ limit: '25' });
    assert.equal(valid.success, true);
    if (valid.success) {
      assert.equal(valid.data.limit, 25);
    }

    const overMax = PaginationQuerySchema.safeParse({ limit: '100' });
    assert.equal(overMax.success, false);

    const encoded = encodeCursor(40);
    assert.equal(decodeCursor(encoded), 40);
    for (const invalid of ['invalid-base64', 'MQ==junk', 'LTE=', 'MS4y', '']) {
      if (invalid === '') continue;
      assert.equal(PaginationQuerySchema.safeParse({ cursor: invalid }).success, false);
      assert.throws(() => decodeCursor(invalid));
    }
    assert.equal(PaginationQuerySchema.safeParse({ cursor: encodeCursor(0) }).success, true);
    assert.throws(() => encodeCursor(-1));
  });
});
