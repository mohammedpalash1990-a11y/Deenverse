import { describe, expect, it } from "vitest";
import { unavailableContentSource } from "./content-source";

describe("unavailableContentSource", () => {
  it("fails closed when listing verified content without a provider", async () => {
    const result = await unavailableContentSource.list({
      type: "quran",
      locale: "ar"
    });

    expect(result).toEqual({
      ok: false,
      error: {
        code: "UNAVAILABLE",
        message: "Verified content service is not configured.",
        retryable: false
      }
    });
  });

  it("does not fabricate a record when an item is not available", async () => {
    const result = await unavailableContentSource.getById("surah:1");

    expect(result).toEqual({
      ok: false,
      error: {
        code: "UNAVAILABLE",
        message: "Verified content service is not configured.",
        retryable: false
      }
    });
  });
});


describe("validateContentRecord", () => {
  const approvedRecord = {
    id: "fixture-001",
    type: "quran",
    title: "Approved source fixture",
    locale: "ar",
    payload: { sourceFixture: true },
    provenance: {
      contentType: "quran",
      sourceId: "approved-source",
      edition: "edition-1",
      sourceUrl: "https://example.org/source",
      attribution: "Source attribution",
      licenseId: "license-1",
      redistributionAllowed: true,
      reviewer: "human-reviewer",
      reviewedAt: "2026-10-01T10:00:00Z",
      checksum: "sha256:fixture"
    }
  };

  it("accepts a structurally complete record with approved provenance metadata", () => {
    expect(validateContentRecord(approvedRecord)).toEqual({ valid: true, reasons: [] });
  });

  it("rejects missing records and incomplete provenance", () => {
    const missing = validateContentRecord(null);
    expect(missing.valid).toBe(false);
    expect(missing.reasons).toContain("Content record must be an object");

    const incomplete = validateContentRecord({ ...approvedRecord, provenance: {} });
    expect(incomplete.valid).toBe(false);
    expect(incomplete.reasons).toContain("Missing required provenance: sourceId");
  });

  it("rejects a record whose type conflicts with its provenance", () => {
    const mismatch = validateContentRecord({
      ...approvedRecord,
      type: "hadith"
    });
    expect(mismatch.valid).toBe(false);
    expect(mismatch.reasons).toContain("Record type does not match provenance content type");
  });
});
