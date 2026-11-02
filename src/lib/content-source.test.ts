import { describe, expect, it, vi } from "vitest";
import { unavailableContentSource } from "./content-source";

describe("unavailableContentSource", () => {
  it("fails closed when listing verified content without a provider", async () => {
    const result = await unavailableContentSource.list({
      type: "quran",
      locale: "ar"
    });

    expect(result).toEqual({
      ok: false,
      error: {
        code: "UNAVAILABLE",
        message: "Verified content service is not configured.",
        retryable: false
      }
    });
  });

  it("does not fabricate a record when an item is not available", async () => {
    const result = await unavailableContentSource.getById("surah:1");

    expect(result).toEqual({
      ok: false,
      error: {
        code: "UNAVAILABLE",
        message: "Verified content service is not configured.",
        retryable: false
      }
    });
  });
});
