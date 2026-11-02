import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell } from "./app-shell";

describe("DEENVERSE app shell", () => {
  it("renders the primary navigation and safe Quran placeholder", () => {
    render(<AppShell />);
    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Return to the words." })).toBeInTheDocument();
    expect(screen.getByText("Verified content is on its way")).toBeInTheDocument();
  });

  it("switches sections without inventing religious content", () => {
    render(<AppShell />);
    fireEvent.click(screen.getByRole("button", { name: /Hadith/ }));
    expect(screen.getByRole("heading", { name: "Hadith, thoughtfully." })).toBeInTheDocument();
    expect(screen.getByText(/reviewed, source-attributed content/)).toBeInTheDocument();
  });

  it("filters the section shortcuts", () => {
    render(<AppShell />);
    fireEvent.change(screen.getByRole("textbox", { name: "Find a section" }), { target: { value: "duas" } });
    expect(screen.getByRole("button", { name: /Duas & Adhkar/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Hadith/ })).not.toBeInTheDocument();
  });
});
