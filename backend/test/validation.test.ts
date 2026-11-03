import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ContentProvenanceSchema,
  PaginationQuerySchema,
  decodeCursor,
  encodeCursor
} from '../src/services/validation.js';

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
      approvalStatus: 'approved',
      reviewDecisionId: 'rev-2026-11-001',
      approvedByAuthority: 'Islamic Editorial Board',
      approvedAt: '2026-11-01T00:00:00.000Z',
      checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    };

    const parsed = ContentProvenanceSchema.safeParse(validProvenance);
    assert.equal(parsed.success, true);
  });

  await t.test('rejects pending or unapproved status', () => {
    const unapproved = {
      contentType: 'quran',
      sourceId: 'src-tanzil-uthmani',
      edition: '1.0.2',
      sourceUrl: 'https://tanzil.net/pub/download/quran-uthmani.txt',
      attribution: 'Tanzil Project Verified Quran Metadata',
      licenseId: 'CC-BY-3.0',
      redistributionAllowed: true,
      approvalStatus: 'pending', // Pending approval!
      reviewDecisionId: 'rev-2026-11-001',
      approvedByAuthority: 'Islamic Editorial Board',
      approvedAt: '2026-11-01T00:00:00.000Z',
      checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    };

    const parsed = ContentProvenanceSchema.safeParse(unapproved);
    assert.equal(parsed.success, false);
  });

  await t.test('rejects invalid checksum format', () => {
    const invalidChecksum = {
      contentType: 'quran',
      sourceId: 'src-tanzil-uthmani',
      edition: '1.0.2',
      sourceUrl: 'https://tanzil.net/pub/download/quran-uthmani.txt',
      attribution: 'Tanzil Project Verified Quran Metadata',
      licenseId: 'CC-BY-3.0',
      redistributionAllowed: true,
      approvalStatus: 'approved',
      reviewDecisionId: 'rev-2026-11-001',
      approvedByAuthority: 'Islamic Editorial Board',
      approvedAt: '2026-11-01T00:00:00.000Z',
      checksum: 'not-a-valid-sha256' // invalid!
    };

    const parsed = ContentProvenanceSchema.safeParse(invalidChecksum);
    assert.equal(parsed.success, false);
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
      approvalStatus: 'approved',
      reviewDecisionId: 'rev-2026-11-001',
      approvedByAuthority: 'Islamic Editorial Board',
      approvedAt: '2026-11-01T00:00:00.000Z',
      checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    };

    const parsed = ContentProvenanceSchema.safeParse(unapproved);
    assert.equal(parsed.success, false);
  });

  await t.test('validates pagination limits and strictly rejects tampered cursors', () => {
    const valid = PaginationQuerySchema.safeParse({ limit: '25' });
    assert.equal(valid.success, true);
    if (valid.success) {
      assert.equal(valid.data.limit, 25);
    }

    const overMax = PaginationQuerySchema.safeParse({ limit: '100' });
    assert.equal(overMax.success, false);

    // Valid cursor
    const encoded = encodeCursor(40);
    assert.equal(decodeCursor(encoded), 40);

    // Fail closed on tampered / invalid cursors
    assert.throws(() => decodeCursor('not_base64!'), /Invalid cursor format/);
    assert.throws(() => decodeCursor(Buffer.from('-5').toString('base64')), /Invalid cursor value/);
    assert.throws(() => decodeCursor(Buffer.from('3.14').toString('base64')), /Invalid cursor value/);
    assert.throws(() => decodeCursor(Buffer.from('abc').toString('base64')), /Invalid cursor value/);
    assert.throws(() => decodeCursor(Buffer.from('9007199254740992').toString('base64')), /non-negative safe integer/);
    assert.throws(() => decodeCursor('AB=='), /Invalid cursor encoding/);
    assert.throws(() => encodeCursor(Number.MAX_SAFE_INTEGER + 1), /non-negative safe integer/);
    assert.equal(decodeCursor(encodeCursor(Number.MAX_SAFE_INTEGER)), Number.MAX_SAFE_INTEGER);
  });
});
