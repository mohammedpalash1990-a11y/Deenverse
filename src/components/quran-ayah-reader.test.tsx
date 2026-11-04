import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuranAyahReader } from "./quran-ayah-reader";
import type { QuranAyahRecord } from "@/lib/quran-ayah-client";

const fixtureText = "SYNTHETIC_TEST_FIXTURE_NOT_QURAN";
const fixture: QuranAyahRecord = {
  id: "quran:ayah:2:255",
  type: "quran",
  title: "Ayah 2:255",
  locale: "ar",
  provenance: {
    contentType: "quran",
    sourceId: "fixture-source",
    edition: "fixture-edition",
    sourceUrl: "https://example.invalid/fixture",
    attribution: "Synthetic fixture only; not a Quran source",
    licenseId: "TEST_FIXTURE_ONLY",
    redistributionAllowed: true,
    reviewer: "test-reviewer",
    reviewedAt: "2026-11-01T00:00:00.000Z",
    checksum: "a".repeat(64),
    approvalStatus: "approved",
    reviewDecisionId: "fixture-approval",
    approvedByAuthority: "fixture-authority",
    approvedAt: "2026-11-01T00:00:00.000Z"
  },
  payload: { surahNumber: 2, ayahNumber: 255, textArabic: fixtureText }
};

describe("QuranAyahReader", () => {
  it("does not display text before an approved API response is received", () => {
    const client = { getAyah: vi.fn() };
    render(<QuranAyahReader client={client} />);

    expect(screen.getByRole("heading", { name: "Read an Ayah" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/valid approval, licensing and integrity metadata/);
    expect(screen.queryByText(fixtureText)).not.toBeInTheDocument();
    expect(client.getAyah).not.toHaveBeenCalled();
  });

  it("loads and displays only the returned record with RTL Arabic direction", async () => {
    const client = { getAyah: vi.fn().mockResolvedValue({ ok: true, data: fixture }) };
    render(<QuranAyahReader client={client} />);

    fireEvent.change(screen.getByRole("textbox", { name: "Surah number" }), { target: { value: "2" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Ayah number" }), { target: { value: "255" } });
    fireEvent.click(screen.getByRole("button", { name: "Load Ayah" }));

    expect(await screen.findByText(fixtureText)).toHaveAttribute("dir", "rtl");
    expect(screen.getByText(fixtureText)).toHaveAttribute("lang", "ar");
    expect(screen.getByText("fixture-edition")).toBeInTheDocument();
    expect(screen.getByText(/Surah 2 · Ayah 255/)).toBeInTheDocument();
    expect(client.getAyah).toHaveBeenCalledWith(2, 255);
  });

  it("shows safe errors and never renders content on integrity rejection", async () => {
    const client = {
      getAyah: vi.fn().mockResolvedValue({
        ok: false,
        error: { code: "INTEGRITY_REJECTED", message: "The record failed integrity checks.", retryable: false }
      })
    };
    render(<QuranAyahReader client={client} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Surah number" }), { target: { value: "2" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Ayah number" }), { target: { value: "255" } });
    fireEvent.click(screen.getByRole("button", { name: "Load Ayah" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("The record failed integrity checks.");
    expect(screen.queryByText(fixtureText)).not.toBeInTheDocument();
  });

  it("rejects non-numeric coordinates without calling the API", async () => {
    const client = { getAyah: vi.fn() };
    render(<QuranAyahReader client={client} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Surah number" }), { target: { value: "2x" } });
    fireEvent.click(screen.getByRole("button", { name: "Load Ayah" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("whole-number Surah and Ayah coordinates");
    expect(client.getAyah).not.toHaveBeenCalled();
  });

  it("announces loading and disables duplicate submissions", async () => {
    let resolveRequest: ((value: unknown) => void) | undefined;
    const client = {
      getAyah: vi.fn().mockImplementation(() => new Promise((resolve) => { resolveRequest = resolve; }))
    };
    render(<QuranAyahReader client={client} />);
    fireEvent.click(screen.getByRole("button", { name: "Load Ayah" }));

    expect(screen.getByRole("status")).toHaveTextContent("Checking the approved source");
    expect(screen.getByRole("button", { name: "Loading…" })).toBeDisabled();
    resolveRequest?.({ ok: false, error: { code: "UNAVAILABLE", message: "Unavailable", retryable: true } });
    expect(await screen.findByRole("alert")).toHaveTextContent("Unavailable");
  });
});
