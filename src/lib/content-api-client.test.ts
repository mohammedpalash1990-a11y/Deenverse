import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRestContentSource } from "./content-api-client";

const record = {
  id: "quran:surah:1",
  type: "quran",
  title: "Al-Fatihah",
  locale: "ar",
  payload: { surahNumber: 1, nameSimple: "Al-Fatihah" },
  provenance: {
    contentType: "quran",
    sourceId: "fixture-source",
    edition: "fixture-edition",
    sourceUrl: "https://example.org/fixture",
    attribution: "Synthetic fixture only",
    licenseId: "fixture-only",
    redistributionAllowed: true,
    reviewer: "fixture-reviewer",
    reviewedAt: "2026-10-01T10:00:00Z",
    checksum: "sha256:fixture"
  }
};

function response(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body
  } as Response;
}

describe("createRestContentSource", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("requests the paginated Surah metadata route and validates the response", async () => {
    const fetcher = vi.fn().mockResolvedValue(response(200, {
      data: [record],
      meta: { requestId: "req-list-1", nextCursor: null }
    }));
    const source = createRestContentSource({ baseUrl: "https://api.example.test/api/v1", fetcher });

    const result = await source.list({ type: "quran", locale: "ar", limit: 25, cursor: "cursor-1" });

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.test/api/v1/quran/surahs?limit=25&cursor=cursor-1",
      { method: "GET", headers: { Accept: "application/json" } }
    );
    expect(result).toEqual({ ok: true, data: { items: [record], nextCursor: null } });
  });

  it("maps backend content-unavailable errors without exposing server messages", async () => {
    const fetcher = vi.fn().mockResolvedValue(response(503, {
      error: {
        code: "CONTENT_UNAVAILABLE",
        message: "internal provider diagnostic",
        requestId: "req-unavailable",
        details: ["private"]
      }
    }));
    const source = createRestContentSource({ fetcher });

    const result = await source.list({ type: "quran", locale: "ar" });

    expect(result).toEqual({
      ok: false,
      error: {
        code: "CONTENT_UNAVAILABLE",
        message: "Approved content is not available at this time.",
        retryable: false
      }
    });
  });

  it("reads a single metadata record using the object response envelope", async () => {
    const fetcher = vi.fn().mockResolvedValue(response(200, {
      data: record,
      meta: { requestId: "req-detail-1" }
    }));
    const source = createRestContentSource({ fetcher });

    const result = await source.getById("quran:surah:1");

    expect(fetcher).toHaveBeenCalledWith("/api/v1/quran/surahs/1", {
      method: "GET",
      headers: { Accept: "application/json" }
    });
    expect(result).toEqual({ ok: true, data: record });
  });

  it("rejects invalid identifiers and does not make a request", async () => {
    const fetcher = vi.fn();
    const source = createRestContentSource({ fetcher });

    const result = await source.getById("quran:surah:999");

    expect(result.ok).toBe(false);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("fails closed on malformed detail payloads", async () => {
    const fetcher = vi.fn().mockResolvedValue(response(200, {
      data: record,
      meta: {}
    }));
    const source = createRestContentSource({ fetcher });

    const result = await source.getById("quran:surah:1");

    expect(result.ok).toBe(false);
  });

  it("follows backend page limits to satisfy the UI's 114-record catalogue request", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(response(200, {
        data: Array.from({ length: 50 }, (_, index) => ({ ...record, id: `quran:surah:${index + 1}` })),
        meta: { requestId: "req-page-1", nextCursor: "cursor-page-2" }
      }))
      .mockResolvedValueOnce(response(200, {
        data: Array.from({ length: 50 }, (_, index) => ({ ...record, id: `quran:surah:${index + 51}` })),
        meta: { requestId: "req-page-2", nextCursor: "cursor-page-3" }
      }))
      .mockResolvedValueOnce(response(200, {
        data: Array.from({ length: 14 }, (_, index) => ({ ...record, id: `quran:surah:${index + 101}` })),
        meta: { requestId: "req-page-3", nextCursor: null }
      }));
    const source = createRestContentSource({ fetcher });

    const result = await source.list({ type: "quran", locale: "ar", limit: 114 });

    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(fetcher.mock.calls[0][0]).toBe("/api/v1/quran/surahs?limit=50");
    expect(fetcher.mock.calls[1][0]).toBe("/api/v1/quran/surahs?limit=50&cursor=cursor-page-2");
    expect(fetcher.mock.calls[2][0]).toBe("/api/v1/quran/surahs?limit=14&cursor=cursor-page-3");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.items).toHaveLength(114);
      expect(result.data.nextCursor).toBeNull();
    }
  });

  it("reports network failures as retryable without fabricating content", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("socket details"));
    const source = createRestContentSource({ fetcher });

    const result = await source.list({ type: "quran", locale: "ar" });

    expect(result).toEqual({
      ok: false,
      error: {
        code: "UNAVAILABLE",
        message: "The content service could not be reached.",
        retryable: true
      }
    });
  });
}

  it("fails closed when the backend repeats a pagination cursor", async () => {
    const page = {
      data: [record],
      meta: { requestId: "req-repeated-cursor", nextCursor: "same-cursor" }
    };
    const fetcher = vi.fn()
      .mockResolvedValueOnce(response(200, page))
      .mockResolvedValueOnce(response(200, page));
    const source = createRestContentSource({ fetcher });

    const result = await source.list({ type: "quran", locale: "ar", limit: 114 });

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      ok: false,
      error: {
        code: "UNAVAILABLE",
        message: "The content service returned a repeated pagination cursor.",
        retryable: false
      }
    });
  });

  it("maps a missing Surah response to the canonical safe not-found error", async () => {
    const fetcher = vi.fn().mockResolvedValue(response(404, {
      error: {
        code: "NOT_FOUND",
        message: "private backend detail",
        requestId: "req-surah-missing",
        details: ["internal"]
      }
    }));
    const source = createRestContentSource({ fetcher });

    const result = await source.getById("quran:surah:114");

    expect(result).toEqual({
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: "The requested content was not found.",
        retryable: false
      }
    });
  });
});
