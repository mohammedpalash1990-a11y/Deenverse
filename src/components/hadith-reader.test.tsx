import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockClient = vi.hoisted(() => ({
  listBooks: vi.fn(),
  listChapters: vi.fn(),
  listRecords: vi.fn(),
  search: vi.fn()
}));

vi.mock("@/lib/hadith-api-client", () => ({
  createHadithClient: () => mockClient
}));

import { HadithReader } from "./hadith-reader";

const provenance = {
  contentType: "hadith" as const,
  sourceId: "fixture-source",
  edition: "fixture-edition",
  sourceUrl: "https://example.org/fixture",
  attribution: "Synthetic fixture source",
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
  chapterId: "fixture-chapter",
  arabicText: "نص اختباري موثق",
  narratorText: "Synthetic narrator fixture",
  isnadText: "Synthetic chain fixture",
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

describe("HadithReader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClient.listBooks.mockResolvedValue({
      ok: true,
      data: { items: [book], nextCursor: null }
    });
    mockClient.listChapters.mockResolvedValue({
      ok: true,
      data: [{
        id: "fixture-chapter",
        bookId: "fixture-book",
        chapterNumber: "1",
        titleArabic: "باب الاختبار",
        titleEnglish: "Fixture Chapter",
        titleBengali: "পরীক্ষামূলক অধ্যায়",
        sortOrder: 1
      }]
    });
    mockClient.listRecords.mockResolvedValue({
      ok: true,
      data: { items: [record], nextCursor: null }
    });
    mockClient.search.mockResolvedValue({
      ok: true,
      data: { items: [record], nextCursor: null }
    });
  });

  it("loads approved collection metadata and renders exact Arabic and attributed Bengali translation", async () => {
    render(<HadithReader />);

    expect(await screen.findByText("পরীক্ষামূলক সংকলন")).toBeInTheDocument();
    expect(await screen.findByText("نص اختباري موثق")).toBeInTheDocument();
    expect(screen.getByText("পরীক্ষামূলক অনুবাদ")).toBeInTheDocument();
    expect(screen.getByText("Fixture Translator")).toBeInTheDocument();
    expect(screen.getByText("Synthetic fixture source")).toBeInTheDocument();
    expect(screen.getByText("Fixture reference 1")).toBeInTheDocument();
    expect(screen.getByText("Synthetic chain fixture")).toBeInTheDocument();
  });

  it("does not display a Bengali translation under the English language selection", async () => {
    render(<HadithReader />);

    await screen.findByText("نص اختباري موثق");
    fireEvent.change(screen.getByRole("combobox", { name: "Display language" }), {
      target: { value: "en" }
    });

    await waitFor(() => {
      expect(screen.queryByText("পরীক্ষামূলক অনুবাদ")).not.toBeInTheDocument();
    });
    expect(screen.getByText("No approved translation is available for this narration in the selected language.")).toBeInTheDocument();
  });

  it("searches in the selected display language and shows reviewed results", async () => {
    render(<HadithReader />);

    await screen.findByText("نص اختباري موثق");
    fireEvent.change(screen.getByRole("searchbox", { name: "Search Hadith text" }), {
      target: { value: "পরীক্ষা" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() => {
      expect(mockClient.search).toHaveBeenCalledWith("পরীক্ষা", "bn", 20);
    });
    expect(await screen.findByRole("heading", { name: "Search results" })).toBeInTheDocument();
    expect(screen.getByText("পরীক্ষামূলক অনুবাদ")).toBeInTheDocument();
  });
});
