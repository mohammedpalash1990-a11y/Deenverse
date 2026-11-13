import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "./app-shell";
 
describe("DEENVERSE app shell", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({
        meta: { requestId: "test-request", nextCursor: null },
        data: []
      })
    } as Response)));
  });

  afterEach(() => vi.unstubAllGlobals());
  it("renders navigation and keeps unapproved Quran content unavailable", () => {
    render(<AppShell />);
    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Skip to main content" })).toHaveAttribute("href", "#main-content");
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
    expect(screen.getByRole("heading", { name: "Return to the words." })).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: "Public beta notice" })).toHaveTextContent("DEENVERSE এখনো উন্নয়ন ও যাচাইয়ের পর্যায়ে আছে।");
    expect(screen.getByText(/নির্ভরযোগ্য মূল উৎসের সঙ্গে মিলিয়ে নিন/)).toBeInTheDocument();
    expect(screen.getByText("CONTENT APPROVAL PENDING")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "আল-কুরআন — যাচাইকৃত পাঠ" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("কুরআনের আরবি পাঠ, বাংলা অনুবাদ ও অডিও এখনো প্রকাশের জন্য অনুমোদিত নয়।");
    expect(screen.queryByRole("combobox", { name: "সূরা নির্বাচন" })).not.toBeInTheDocument();
    expect(document.querySelector("audio")).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
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

  it("moves keyboard focus into the mobile navigation when opened", () => {
    render(<AppShell />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle navigation" }));
    const navigation = screen.getByRole("navigation", { name: "Main navigation" });
    expect(within(navigation).getByRole("button", { name: "Quran" })).toHaveFocus();
  });

  it("hides the closed mobile sidebar from keyboard and assistive navigation", () => {
    const css = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");
    expect(css).toMatch(/@media\(max-width:680px\)\{\.app-frame\{display:block\}\.sidebar\{[^}]*visibility:hidden[^}]*\}\.sidebar\.sidebar-open\{[^}]*visibility:visible/);
  });

  it("traps keyboard focus in the open mobile navigation and makes the page inert", () => {
    render(<AppShell />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle navigation" }));

    const dialog = screen.getByRole("dialog", { name: "Mobile navigation" });
    const brand = within(dialog).getByRole("link", { name: "DEENVERSE home" });
    const lastNavigationItem = within(dialog).getByRole("button", { name: "Settings" });
    const main = document.getElementById("main-content");

    expect(main).toHaveAttribute("inert");
    expect(main).toHaveAttribute("aria-hidden", "true");

    brand.focus();
    fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
    expect(lastNavigationItem).toHaveFocus();

    lastNavigationItem.focus();
    fireEvent.keyDown(window, { key: "Tab" });
    expect(brand).toHaveFocus();
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

  it("opens the in-app problem report form from Settings", () => {
    render(<AppShell />);
    const navigation = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(navigation).getByRole("button", { name: "Settings" }));
    expect(screen.getByRole("heading", { name: "Settings & support" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Report a problem" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Submit report/ })).toBeInTheDocument();
  });

  it("filters the section shortcuts", () => {
    render(<AppShell />);
    fireEvent.change(screen.getByRole("textbox", { name: "Find a section" }), { target: { value: "duas" } });
    const shortcuts = within(screen.getByRole("group", { name: "Explore sections" }));
    expect(shortcuts.getByRole("button", { name: /Duas & Adhkar/ })).toBeInTheDocument();
    expect(shortcuts.queryByRole("button", { name: /Hadith/ })).not.toBeInTheDocument();
  });
});
