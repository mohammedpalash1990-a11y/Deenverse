import { describe, expect, it } from "vitest";
import { parseContentPageResponse } from "./content-api-response";

const validRecord = {
  id: "fixture-001",
  type: "quran",
  title: "Approved source fixture",
  locale: "ar",
  payload: { opaqueFixture: true },
  provenance: {
    contentType: "quran",
    sourceId: "reviewed-fixture-source",
    edition: "fixture-edition-v1",
    sourceUrl: "https://example.org/source",
    attribution: "Fixture source attribution",
    licenseId: "fixture-license",
    redistributionAllowed: true,
    reviewer: "independent-reviewer",
    reviewedAt: "2026-10-01T10:00:00Z",
    checksum: "sha256:fixture-only"
  }
};

describe("parseContentPageResponse", () => {
  it("maps a valid paginated envelope into the provider-neutral page", () => {
    expect(parseContentPageResponse({
      data: [validRecord],
      meta: { requestId: "req-fixture-1", nextCursor: "opaque-cursor" }
    }, "quran")).toEqual({
      ok: true,
      data: { items: [validRecord], nextCursor: "opaque-cursor" }
    });
  });

  it("accepts an explicit empty result with a null cursor", () => {
    expect(parseContentPageResponse({
      data: [],
      meta: { requestId: "req-empty", nextCursor: null }
    })).toEqual({ ok: true, data: { items: [], nextCursor: null } });
  });

  it.each([
    null,
    {},
    { data: {}, meta: { requestId: "req" } },
    { data: [], meta: {} },
    { data: [], meta: { requestId: "req", nextCursor: 42 } }
  ])("rejects malformed response envelopes", (response) => {
    const result = parseContentPageResponse(response);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("INTEGRITY_REJECTED");
  });

  it("rejects the whole page when any record lacks valid provenance", () => {
    const result = parseContentPageResponse({
      data: [validRecord, { ...validRecord, provenance: {} }],
      meta: { requestId: "req-bad-page", nextCursor: null }
    });
    expect(result.ok).toBe(false);
  });

  it("rejects records that do not match the requested content type", () => {
    const result = parseContentPageResponse({
      data: [validRecord],
      meta: { requestId: "req-wrong-type", nextCursor: null }
    }, "hadith");
    expect(result.ok).toBe(false);
  });
});
