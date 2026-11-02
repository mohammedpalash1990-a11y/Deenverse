import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuranCatalogue } from "./quran-catalogue";
import type { ContentRecord, ContentSource } from "@/lib/content-source";

const record: ContentRecord = {
  id: "fixture-surah-001",
  type: "quran",
  title: "Approved catalogue fixture",
  locale: "ar",
  payload: { metadataOnly: true },
  provenance: {
    contentType: "quran",
    sourceId: "fixture-source",
    edition: "fixture-edition",
    sourceUrl: "https://example.org/quran-catalogue",
    attribution: "Fixture attribution",
    licenseId: "fixture-license",
    redistributionAllowed: true,
    reviewer: "human-reviewer",
    reviewedAt: "2026-10-01T10:00:00Z",
    checksum: "sha256:fixture"
  }
};

function sourceReturning(result: Awaited<ReturnType<ContentSource["list"]>>): ContentSource {
  return {
    list: vi.fn().mockResolvedValue(result),
    getById: vi.fn().mockResolvedValue({ ok: true, data: null })
  };
}

describe("QuranCatalogue", () => {
  it("shows a loading state while the source is pending", () => {
    const source: ContentSource = {
      list: () => new Promise(() => undefined),
      getById: vi.fn()
    };
    render(<QuranCatalogue source={source} />);
    expect(screen.getByText("Loading verified catalogue")).toBeInTheDocument();
  });

  it("fails closed when no approved provider is configured", async () => {
    render(<QuranCatalogue />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Verified content service is not configured.");
  });

  it("shows an explicit empty state", async () => {
    render(<QuranCatalogue source={sourceReturning({ ok: true, data: { items: [] } })} />);
    expect(await screen.findByText("No approved Surah records yet")).toBeInTheDocument();
  });

  it("renders only records that pass provenance validation", async () => {
    render(<QuranCatalogue source={sourceReturning({ ok: true, data: { items: [record] } })} />);
    expect(await screen.findByText("Approved catalogue fixture")).toBeInTheDocument();
    expect(screen.getByText(/source-verified catalogue records/)).toBeInTheDocument();
  });

  it("rejects records with incomplete provenance", async () => {
    const invalid = { ...record, provenance: { ...record.provenance, redistributionAllowed: false } } as ContentRecord;
    render(<QuranCatalogue source={sourceReturning({ ok: true, data: { items: [invalid] } })} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("failed the content-integrity checks");
    expect(screen.queryByText("Approved catalogue fixture")).not.toBeInTheDocument();
  });

  it("supports previous/next catalogue navigation without displaying religious text", async () => {
    const second = { ...record, id: "fixture-surah-002", title: "Second approved fixture" };
    render(<QuranCatalogue source={sourceReturning({ ok: true, data: { items: [record, second] } })} />);
    fireEvent.click(await screen.findByRole("button", { name: /Approved catalogue fixture/ }));
    expect(screen.getByText(/Religious text will load only/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() => expect(screen.getByText("Second approved fixture")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Previous" })).toBeEnabled();
  });

  it("offers retry after a retryable source failure", async () => {
    const source: ContentSource = {
      list: vi.fn()
        .mockResolvedValueOnce({ ok: false, error: { code: "UNAVAILABLE", message: "Temporary outage", retryable: true } })
        .mockResolvedValueOnce({ ok: true, data: { items: [record] } }),
      getById: vi.fn()
    };
    render(<QuranCatalogue source={source} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Temporary outage");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Approved catalogue fixture")).toBeInTheDocument();
  });
  it("filters approved catalogue metadata by Surah name or stable ID", async () => {
    const second = { ...record, id: "fixture-surah-002", title: "Second approved fixture" };
    render(<QuranCatalogue source={sourceReturning({ ok: true, data: { items: [record, second] } })} />);
    await screen.findByText("Approved catalogue fixture");
    fireEvent.change(screen.getByRole("textbox", { name: "Search Surah catalogue" }), { target: { value: "second" } });
    expect(screen.getByText("Second approved fixture")).toBeInTheDocument();
    expect(screen.queryByText("Approved catalogue fixture")).not.toBeInTheDocument();
  });

});
