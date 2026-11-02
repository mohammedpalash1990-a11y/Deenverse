import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell } from "./app-shell";

describe("DEENVERSE app shell", () => {
  it("renders the primary navigation and safe Quran placeholder", () => {
    render(<AppShell />);
    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Return to the words." })).toBeInTheDocument();
    expect(screen.getByText("Verified content is on its way")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Reserved Arabic Quran text area" })).toHaveAttribute("dir", "rtl");
    expect(screen.getByRole("region", { name: "Reserved Arabic Quran text area" })).toHaveAttribute("lang", "ar");
  });

  it("switches sections without inventing religious content", () => {
    render(<AppShell />);
    fireEvent.click(within(screen.getByRole("navigation", { name: "Main navigation" })).getByRole("button", { name: "Hadith" }));
    expect(screen.getByRole("heading", { name: "Hadith, thoughtfully." })).toBeInTheDocument();
    expect(screen.getByText(/reviewed, source-attributed content/)).toBeInTheDocument();
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

  it("filters the section shortcuts", () => {
    render(<AppShell />);
    fireEvent.change(screen.getByRole("textbox", { name: "Find a section" }), { target: { value: "duas" } });
    const shortcuts = within(screen.getByRole("group", { name: "Explore sections" }));
    expect(shortcuts.getByRole("button", { name: /Duas & Adhkar/ })).toBeInTheDocument();
    expect(shortcuts.queryByRole("button", { name: /Hadith/ })).not.toBeInTheDocument();
  });
});
