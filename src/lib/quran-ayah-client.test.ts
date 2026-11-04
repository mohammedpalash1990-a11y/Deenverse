import { describe, expect, it, vi } from "vitest";
import { createQuranAyahClient } from "./quran-ayah-client";

const fixtureText = "SYNTHETIC_TEST_FIXTURE_NOT_QURAN";
const provenance = {
  contentType: "quran",
  sourceId: "synthetic-test-source",
  edition: "synthetic-test-edition",
  sourceUrl: "https://example.invalid/test-fixture",
  attribution: "Synthetic fixture only; not a Quran source",
  licenseId: "TEST_FIXTURE_NOT_A_LICENSE",
  redistributionAllowed: true,
  reviewer: "test-reviewer",
  reviewedAt: "2026-11-01T00:00:00.000Z",
  approvalStatus: "approved",
  reviewDecisionId: "test-approval-only",
  approvalReviewerId: "test-approval-reviewer",
  approvedAt: "2026-11-01T00:00:00.000Z",
  checksum: "a".repeat(64)
};

function response(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body
  } as Response;
}

function success(overrides: Record<string, unknown> = {}) {
  return {
    meta: { requestId: "req-ayah-fixture" },
    data: {
      id: "quran:ayah:2:255",
      type: "quran",
      title: "Ayah 2:255",
      locale: "ar",
      provenance,
      payload: {
        surahNumber: 2,
        ayahNumber: 255,
        textArabic: fixtureText
      },
      ...overrides
    }
  };
}

describe("createQuranAyahClient", () => {
  it("requests the documented route and preserves the source string exactly", async () => {
    const fetcher = vi.fn().mockResolvedValue(response(200, success()));
    const client = createQuranAyahClient({
      baseUrl: "https://api.example.test/api/v1",
      fetcher
    });

    const result = await client.getAyah(2, 255);

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.test/api/v1/ayah/2/255",
      { method: "GET", headers: { Accept: "application/json" } }
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.payload.textArabic).toBe(fixtureText);
  });

  it("uses NEXT_PUBLIC_API_BASE_URL when no explicit API base is supplied", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.deenverse.example/api/v1/");
    try {
      const fetcher = vi.fn().mockResolvedValue(response(503, {}));
      const client = createQuranAyahClient({ fetcher });

      await client.getAyah(2, 255);

      expect(fetcher).toHaveBeenCalledWith(
        "https://api.deenverse.example/api/v1/ayah/2/255",
        { method: "GET", headers: { Accept: "application/json" } }
      );
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("keeps the same-origin API path when no public API base is configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    try {
      const fetcher = vi.fn().mockResolvedValue(response(503, {}));
      const client = createQuranAyahClient({ fetcher });

      await client.getAyah(2, 255);

      expect(fetcher).toHaveBeenCalledWith(
        "/api/v1/ayah/2/255",
        { method: "GET", headers: { Accept: "application/json" } }
      );
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it.each([[0, 1], [115, 1], [1.5, 1], [1, 0], [1, -1], [1, 2.5]])(
    "rejects invalid coordinates %s:%s without making a request",
    async (surah, ayah) => {
      const fetcher = vi.fn();
      const client = createQuranAyahClient({ fetcher });

      const result = await client.getAyah(surah, ayah);

      expect(result.ok).toBe(false);
      expect(fetcher).not.toHaveBeenCalled();
    }
  );

  it("rejects an ID that does not match the requested coordinates", async () => {
    const fetcher = vi.fn().mockResolvedValue(response(200, success({
      id: "quran:ayah:2:256"
    })));
    const result = await createQuranAyahClient({ fetcher }).getAyah(2, 255);

    expect(result).toMatchObject({
      ok: false,
      error: { code: "INTEGRITY_REJECTED", retryable: false }
    });
  });

  it("rejects payload coordinates that do not match the requested route", async () => {
    const fetcher = vi.fn().mockResolvedValue(response(200, success({
      payload: { surahNumber: 2, ayahNumber: 256, textArabic: fixtureText }
    })));
    const result = await createQuranAyahClient({ fetcher }).getAyah(2, 255);

    expect(result.ok).toBe(false);
  });

  it("rejects missing or whitespace-only source text", async () => {
    for (const textArabic of ["", "   ", undefined]) {
      const fetcher = vi.fn().mockResolvedValue(response(200, success({
        payload: { surahNumber: 2, ayahNumber: 255, textArabic }
      })));
      const result = await createQuranAyahClient({ fetcher }).getAyah(2, 255);
      expect(result.ok).toBe(false);
    }
  });

  it("rejects missing approval, redistribution permission, and invalid digest", async () => {
    const invalidProvenance = [
      { ...provenance, approvalStatus: "pending" },
      { ...provenance, redistributionAllowed: false },
      { ...provenance, checksum: "not-a-sha256" },
      { ...provenance, sourceUrl: "http://example.invalid/source" },
      { ...provenance, reviewDecisionId: "" }
    ];

    for (const item of invalidProvenance) {
      const fetcher = vi.fn().mockResolvedValue(response(200, success({ provenance: item })));
      const result = await createQuranAyahClient({ fetcher }).getAyah(2, 255);
      expect(result.ok).toBe(false);
    }
  });

  it("rejects malformed success envelopes", async () => {
    const fetcher = vi.fn().mockResolvedValue(response(200, { data: {}, meta: {} }));
    const result = await createQuranAyahClient({ fetcher }).getAyah(2, 255);

    expect(result).toMatchObject({
      ok: false,
      error: { code: "INTEGRITY_REJECTED" }
    });
  });

  it("maps server errors to safe messages without exposing diagnostics", async () => {
    const fetcher = vi.fn().mockResolvedValue(response(503, {
      error: {
        code: "CONTENT_UNAVAILABLE",
        message: "private database/provider diagnostics",
        details: ["secret"]
      }
    }));
    const result = await createQuranAyahClient({ fetcher }).getAyah(2, 255);

    expect(result).toEqual({
      ok: false,
      error: {
        code: "CONTENT_UNAVAILABLE",
        message: "Approved content is not available at this time.",
        retryable: false
      }
    });
  });

  it("maps network failures to a safe retryable unavailable result", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("socket details"));
    const result = await createQuranAyahClient({ fetcher }).getAyah(2, 255);

    expect(result).toEqual({
      ok: false,
      error: {
        code: "UNAVAILABLE",
        message: "The content service could not be reached.",
        retryable: true
      }
    });
  });
});
