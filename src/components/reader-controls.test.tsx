import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReaderControls } from "./reader-controls";

describe("ReaderControls", () => {
  it("exposes reader tools without pretending unavailable features work", () => {
    render(<ReaderControls />);
    expect(screen.getByRole("heading", { name: "Reading controls" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Quran edition" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Surah number" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Ayah number" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Play Quran recitation" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Bookmark current ayah" })).toBeDisabled();
    expect(screen.getByText(/No placeholder scripture or playback/)).toBeInTheDocument();
  });
});
