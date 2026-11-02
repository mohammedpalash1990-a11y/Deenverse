import { describe, expect, it } from "vitest";
import { evaluatePublication, type ContentProvenance } from "./content-safety";

const approved: ContentProvenance = {
  contentType: "quran",
  sourceId: "provider:edition-id",
  edition: "Named edition and version",
  sourceUrl: "https://example.org/source",
  attribution: "Required attribution",
  licenseId: "license-reference",
  redistributionAllowed: true,
  reviewer: "Human reviewer",
  reviewedAt: "2026-11-02T00:00:00Z",
  checksum: "sha256:example"
};

describe("religious content publication gate", () => {
  it("allows publication only when provenance and redistribution approval are explicit", () => {
    expect(evaluatePublication(approved)).toEqual({ allowed: true, reasons: [] });
  });

  it("fails closed when provenance is incomplete", () => {
    const decision = evaluatePublication({ contentType: "quran" });
    expect(decision.allowed).toBe(false);
    expect(decision.reasons).toContain("Missing required provenance: sourceId");
    expect(decision.reasons).toContain("Redistribution permission has not been explicitly approved");
  });

  it("rejects non-HTTPS source URLs and invalid review dates", () => {
    const decision = evaluatePublication({
      ...approved,
      sourceUrl: "http://example.org/source",
      reviewedAt: "not-a-date"
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reasons).toContain("Source URL must use HTTPS");
    expect(decision.reasons).toContain("Review date is invalid");
  });

  it("rejects unsupported content types", () => {
    const decision = evaluatePublication({
      ...approved,
      contentType: "unknown" as ContentProvenance["contentType"]
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reasons).toContain("Content type is not supported");
  });

  it("accepts complete metadata without claiming to verify religious authenticity", () => {
    // Authenticity still requires a separate source-specific human review.
    expect(evaluatePublication(approved).allowed).toBe(true);
  });
});
