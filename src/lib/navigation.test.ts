import { describe, expect, it } from "vitest";
import { getSection, sections } from "./navigation";

describe("navigation model", () => {
  it("exposes all primary destinations", () => {
    expect(sections.map((section) => section.id)).toEqual([
      "quran", "hadith", "cards", "duas", "learn", "bookmarks", "settings"
    ]);
  });

  it("falls back to Quran for an unknown destination", () => {
    expect(getSection("unknown").id).toBe("quran");
  });
});
