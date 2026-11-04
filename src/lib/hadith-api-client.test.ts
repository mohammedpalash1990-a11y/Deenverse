import { describe, expect, it, vi } from "vitest";
import { createHadithClient } from "./hadith-api-client";

const provenance = {
  contentType: "hadith" as const,
  sourceId: "fixture-source",
  edition: "fixture-edition",
  sourceUrl: "https://example.org/fixture",
  attribution: "Synthetic fixture only",
  licenseId: "TEST-NOT-A-LICENSE",
  redistributionAllowed: true as const,
  reviewer: "fixture-reviewer",
  reviewedAt: "2026-11-04T00:00:00.000Z",
  approvalStatus: "approved" as const,
  reviewDecisionId: "fixture-approval",
  approvedByAuthority: "fixture-authority",
  approvedAt: "2026-11-04T00:00:00.000Z",
  checksum: "a".repeat(64)
};

const book = {
  id: "fixture-book",
  slug: "fixture-collection",
  titleArabic: "مجموعة اختبارية",
  titleEnglish: "Fixture Collection",
  titleBengali: "পরীক্ষামূলক সংকলন",
  compilerName: "Fixture Compiler",
  collectionType: "collection",
  edition: "fixture-edition",
  provenance
};

const record = {
  id: "fixture-record",
  hadithNumber: "1",
  numberingSystem: "fixture-edition",
  book: {
    id: "fixture-book",
    slug: "fixture-collection",
    titleArabic: "مجموعة اختبارية",
    titleEnglish: "Fixture Collection",
    titleBengali: "পরীক্ষামূলক সংকলন",
    compilerName: "Fixture Compiler",
    collectionType: "collection",
    edition: "fixture-edition"
  },
  chapterId: null,
  arabicText: "نص اختباري موثق",
  narratorText: null,
  isnadText: null,
  sourceReference: "Fixture reference 1",
  provenance,
  translations: [{
    id: "fixture-translation",
    locale: "bn",
    translatorName: "Fixture Translator",
    text: "পরীক্ষামূলক অনুবাদ",
    licenseId: "TEST-TRANSLATION",
    provenance: { ...provenance, contentType: "translation" as const }
  }]
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  });
}

describe("Hadith API client", () => {
  it("reads the approved book list and pagination metadata", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      meta: { requestId: "req_fixture", nextCursor: "MTA=" },
      data: [book]
    }));
    const client = createHadithClient({ baseUrl: "https://api.example.org/api/v1", fetcher });

    const result = await client.listBooks();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.items).toHaveLength(1);
      expect(result.data.items[0].provenance.approvalStatus).toBe("approved");
      expect(result.data.nextCursor).toBe("MTA=");
    }
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.org/api/v1/hadith/books?limit=50",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("parses reviewed records and preserves exact Arabic and translation strings", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      meta: { requestId: "req_fixture", nextCursor: null },
      data: [record]
    }));
    const client = createHadithClient({ fetcher });

    const result = await client.search("পরীক্ষামূলক", "bn");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.items[0].arabicText).toBe("نص اختباري موثق");
      expect(result.data.items[0].translations[0].text).toBe("পরীক্ষামূলক অনুবাদ");
      expect(result.data.nextCursor).toBeNull();
    }
    expect(fetcher).toHaveBeenCalledWith(
      "/api/v1/hadith/search?q=%E0%A6%AA%E0%A6%B0%E0%A7%80%E0%A6%95%E0%A7%8D%E0%A6%B7%E0%A6%BE%E0%A6%AE%E0%A7%82%E0%A6%B2%E0%A6%95&locale=bn&limit=20",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("rejects records without approved source provenance", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      meta: { requestId: "req_fixture", nextCursor: null },
      data: [{ ...record, provenance: { ...provenance, approvalStatus: "pending" } }]
    }));
    const client = createHadithClient({ fetcher });

    const result = await client.search("fixture");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("INTEGRITY_REJECTED");
  });

  it("maps unavailable API responses to a safe error", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      error: { code: "CONTENT_UNAVAILABLE", message: "internal detail" }
    }, 503));
    const client = createHadithClient({ fetcher });

    const result = await client.listBooks();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("CONTENT_UNAVAILABLE");
      expect(result.error.message).not.toContain("internal detail");
    }
  });
});
