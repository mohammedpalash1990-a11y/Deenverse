import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "./app-shell";

const arabicFixture = Array.from({ length: 6236 }, (_, index) => "1|" + (index + 1) + "|بِسْمِ اللَّهِ").join("\n");

describe("DEENVERSE app shell", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).includes("raw.githubusercontent.com")) {
        return { ok: true, text: async () => arabicFixture } as Response;
      }
      return {
        ok: true,
        json: async () => ({
          meta: { requestId: "test-request" },
          data: {
            surahNumber: 1,
            ayahs: Array.from({ length: 7 }, (_, index) => ({
              surahNumber: 1, ayahNumber: index + 1, translation: "বাংলা অনুবাদ", footnotes: ""
            })),
            provenance: {
              publisher: "QuranEnc.com",
              translator: "Abu Bakr Muhammad Zakaria",
              sourceTitle: "Bengali translation",
              editionVersion: "V1.1.1",
              sourceUrl: "https://quranenc.com/bn/browse/bengali_zakaria",
              termsUrl: "https://quranenc.com/en/home"
            }
          }
        })
      } as Response;
    }));
  });

  afterEach(() => vi.unstubAllGlobals());
  it("renders the primary navigation and public beta Quran reader", () => {
    render(<AppShell />);
    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Skip to main content" })).toHaveAttribute("href", "#main-content");
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
    expect(screen.getByRole("heading", { name: "Return to the words." })).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: "Public beta notice" })).toHaveTextContent("DEENVERSE এখনো উন্নয়ন ও যাচাইয়ের পর্যায়ে আছে।");
    expect(screen.getByText(/নির্ভরযোগ্য মূল উৎসের সঙ্গে মিলিয়ে নিন/)).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "আল-কুরআন — আরবি ও বাংলা" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "সূরা নির্বাচন" })).toBeInTheDocument();
  });

  it("keeps the active section announcement and selected navigation state in sync", () => {
    render(<AppShell />);
    const navigation = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(navigation).getByRole("button", { name: "Hadith" }));
    expect(within(navigation).getByRole("button", { name: "Hadith" })).toHaveAttribute("aria-current", "page");
    const breadcrumb = document.querySelector(".breadcrumb");
    expect(breadcrumb).toHaveTextContent("DEENVERSE / HADITH");
    expect(breadcrumb).toHaveAttribute("aria-live", "polite");
  });

  it("switches sections without inventing religious content", () => {
    render(<AppShell />);
    fireEvent.click(within(screen.getByRole("navigation", { name: "Main navigation" })).getByRole("button", { name: "Hadith" }));
    expect(screen.getByRole("heading", { name: "Hadith, thoughtfully." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Hadith library" })).toBeInTheDocument();
  });

  it("announces mobile navigation expanded state", () => {
    render(<AppShell />);
    const toggle = screen.getByRole("button", { name: "Toggle navigation" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the mobile navigation with Escape and restores focus", () => {
    render(<AppShell />);
    const toggle = screen.getByRole("button", { name: "Toggle navigation" });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(window, { key: "Escape" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();
  });

  it("provides a labelled backdrop to dismiss the mobile navigation", () => {
    render(<AppShell />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle navigation" }));
    fireEvent.click(screen.getByRole("button", { name: "Close navigation" }));
    expect(screen.getByRole("button", { name: "Toggle navigation" })).toHaveAttribute("aria-expanded", "false");
  });

  it("filters the section shortcuts", () => {
    render(<AppShell />);
    fireEvent.change(screen.getByRole("textbox", { name: "Find a section" }), { target: { value: "duas" } });
    const shortcuts = within(screen.getByRole("group", { name: "Explore sections" }));
    expect(shortcuts.getByRole("button", { name: /Duas & Adhkar/ })).toBeInTheDocument();
    expect(shortcuts.queryByRole("button", { name: /Hadith/ })).not.toBeInTheDocument();
  });
});
