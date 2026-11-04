import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuranAyahReader } from "./quran-ayah-reader";
import type { QuranBengaliTranslation } from "@/lib/quran-translation-client";
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
    approvedByAuthority: "fixture-approval-authority",
    approvedAt: "2026-11-01T00:00:00.000Z"
  },
  payload: { surahNumber: 2, ayahNumber: 255, textArabic: fixtureText }
};

const translationFixture: QuranBengaliTranslation = {
  surahNumber: 2,
  ayahNumber: 255,
  translation: "  SYNTHETIC translation\nunchanged  ",
  footnotes: "  SYNTHETIC footnote\nunchanged  ",
  provenance: {
    publisher: "QuranEnc.com",
    translator: "Abu Bakr Muhammad Zakaria",
    sourceTitle: "Synthetic edition title",
    sourceDescription: "Synthetic description",
    translationKey: "bengali_zakaria",
    editionVersion: "V1.1.1",
    sourceUrl: "https://quranenc.com/bn/browse/bengali_zakaria",
    termsUrl: "https://quranenc.com/en/home",
    lastUpdated: null
  }
};

describe("QuranAyahReader", () => {
  it("does not display text before an approved API response is received", () => {
    const client = { getAyah: vi.fn() };
    render(<QuranAyahReader client={client} />);

    expect(screen.getByRole("heading", { name: "Read an Ayah" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/valid approval, licensing and integrity metadata/);
    expect(screen.queryByText(fixtureText)).not.toBeInTheDocument();
    expect(client.getAyah).not.toHaveBeenCalled();
    expect(screen.queryByRole("region", { name: "Hifz recall practice" })).not.toBeInTheDocument();
  });

  it("loads and displays only the returned record with RTL Arabic direction", async () => {
    const client = { getAyah: vi.fn().mockResolvedValue({ ok: true, data: fixture }) };
    const translationClient = { getAyah: vi.fn().mockResolvedValue({ ok: false, message: "Synthetic translation unavailable" }) };
    render(<QuranAyahReader client={client} translationClient={translationClient} />);

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
    expect(screen.queryByRole("region", { name: "Hifz recall practice" })).not.toBeInTheDocument();
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

  it("retains publisher attribution, exact translation and footnotes in the reader", async () => {
    const translation = translationFixture;
    const client = { getAyah: vi.fn().mockResolvedValue({ ok: true, data: fixture }) };
    const translationClient = { getAyah: vi.fn().mockResolvedValue({ ok: true, data: translation }) };
    render(<QuranAyahReader client={client} translationClient={translationClient} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Surah number" }), { target: { value: "2" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Ayah number" }), { target: { value: "255" } });
    fireEvent.click(screen.getByRole("button", { name: "Load Ayah" }));

    const translationText = await screen.findByText("SYNTHETIC translation unchanged");
    expect(translationText.textContent).toBe(translation.translation);
    expect(translationText).toHaveAttribute("lang", "bn");
    expect(screen.getByText("SYNTHETIC footnote unchanged").textContent).toBe(translation.footnotes);
    expect(screen.getByText(/Abu Bakr Muhammad Zakaria · QuranEnc.com/)).toHaveTextContent("V1.1.1");
    expect(screen.getByRole("link", { name: "QuranEnc-এর মূল অনুবাদ" })).toHaveAttribute("href", translation.provenance.sourceUrl);
    expect(screen.getByRole("link", { name: "প্রকাশের শর্ত" })).toHaveAttribute("href", translation.provenance.termsUrl);
    expect(translationClient.getAyah).toHaveBeenCalledWith(2, 255);
    expect(screen.getByText(fixtureText)).toBeInTheDocument();
  });

  it("keeps verified Arabic visible and allows retry after translation failure", async () => {
    const client = { getAyah: vi.fn().mockResolvedValue({ ok: true, data: fixture }) };
    const translationClient = { getAyah: vi.fn().mockResolvedValue({ ok: false, message: "Synthetic translation unavailable" }) };
    render(<QuranAyahReader client={client} translationClient={translationClient} />);
    fireEvent.click(screen.getByRole("button", { name: "Load Ayah" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Synthetic translation unavailable");
    expect(screen.getByText(fixtureText)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Load Ayah" })).toBeEnabled();
    expect(screen.queryByRole("link", { name: "QuranEnc-এর মূল অনুবাদ" })).not.toBeInTheDocument();
  });

  it("does not request a translation when Arabic source verification fails", async () => {
    const client = { getAyah: vi.fn().mockResolvedValue({
      ok: false, error: { code: "INTEGRITY_REJECTED", message: "Synthetic integrity failure", retryable: false }
    }) };
    const translationClient = { getAyah: vi.fn() };
    render(<QuranAyahReader client={client} translationClient={translationClient} />);
    fireEvent.click(screen.getByRole("button", { name: "Load Ayah" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Synthetic integrity failure");
    expect(translationClient.getAyah).not.toHaveBeenCalled();
  });


  it("keeps source attribution visible while concealing verified text for recall", async () => {
    const client = { getAyah: vi.fn().mockResolvedValue({ ok: true, data: fixture }) };
    const translationClient = { getAyah: vi.fn().mockResolvedValue({ ok: false, message: "Synthetic translation unavailable" }) };
    render(<QuranAyahReader client={client} translationClient={translationClient} />);
    fireEvent.click(screen.getByRole("button", { name: "Load Ayah" }));
    await screen.findByText(fixtureText);
    fireEvent.click(screen.getByRole("button", { name: "Start Hifz practice" }));
    expect(screen.queryByText(fixtureText)).not.toBeInTheDocument();
    expect(screen.getByText(fixture.provenance.attribution)).toBeInTheDocument();
    expect(screen.getByText(fixture.provenance.edition)).toBeInTheDocument();
    expect(screen.getByText(/Surah 2 · Ayah 255/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reveal Ayah" }));
    expect(screen.getByText(fixtureText).textContent).toBe(fixtureText);
    expect(client.getAyah).toHaveBeenCalledTimes(1);
    expect(translationClient.getAyah).toHaveBeenCalledTimes(1);
  });

  it("resets practice when another Ayah is loaded and removes the previous text", async () => {
    const nextText = "SYNTHETIC_SECOND_AYAH_NOT_QURAN";
    const nextRecord = {
      ...fixture, id: "quran:ayah:2:256",
      payload: { ...fixture.payload, ayahNumber: 256, textArabic: nextText }
    };
    const client = { getAyah: vi.fn()
      .mockResolvedValueOnce({ ok: true, data: fixture })
      .mockResolvedValueOnce({ ok: true, data: nextRecord }) };
    const translationClient = { getAyah: vi.fn().mockResolvedValue({ ok: false, message: "Synthetic translation unavailable" }) };
    render(<QuranAyahReader client={client} translationClient={translationClient} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Surah number" }), { target: { value: "2" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Ayah number" }), { target: { value: "255" } });
    fireEvent.click(screen.getByRole("button", { name: "Load Ayah" }));
    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: "Start Hifz practice" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Ayah number" }), { target: { value: "256" } });
    fireEvent.click(screen.getByRole("button", { name: "Load Ayah" }));
    expect(await screen.findByText(nextText)).toBeInTheDocument();
    expect(screen.queryByText(fixtureText)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start Hifz practice" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Exit practice" })).not.toBeInTheDocument();
    expect(client.getAyah).toHaveBeenLastCalledWith(2, 256);
  });

  it("does not expose a late translation response while recall is concealed", async () => {
    const client = { getAyah: vi.fn().mockResolvedValue({ ok: true, data: fixture }) };
    let finishTranslation: ((value: unknown) => void) | undefined;
    const translationClient = { getAyah: vi.fn().mockImplementation(() => new Promise((resolve) => { finishTranslation = resolve; })) };
    render(<QuranAyahReader client={client} translationClient={translationClient} />);
    fireEvent.click(screen.getByRole("button", { name: "Load Ayah" }));
    await screen.findByText(fixtureText);
    fireEvent.click(screen.getByRole("button", { name: "Start Hifz practice" }));
    await act(async () => {
      finishTranslation?.({ ok: true, data: translationFixture });
    });
    expect(screen.queryByText("SYNTHETIC translation unchanged")).not.toBeInTheDocument();
    expect(screen.queryByText("SYNTHETIC footnote unchanged")).not.toBeInTheDocument();
    expect(screen.queryByText(fixtureText)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reveal Ayah" }));
    expect(screen.getByText("SYNTHETIC translation unchanged").textContent).toBe(translationFixture.translation);
    expect(screen.getByText("SYNTHETIC footnote unchanged").textContent).toBe(translationFixture.footnotes);
  });

});
