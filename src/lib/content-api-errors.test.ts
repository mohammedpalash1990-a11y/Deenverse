import { describe, expect, it } from "vitest";
import { mapContentApiError } from "./content-api-errors";

describe("mapContentApiError", () => {
  it.each([
    [400, "VALIDATION_ERROR", false],
    [401, "UNAUTHENTICATED", false],
    [403, "FORBIDDEN", false],
    [404, "NOT_FOUND", false],
    [422, "VALIDATION_ERROR", false],
    [429, "RATE_LIMITED", true],
    [503, "UNAVAILABLE", true],
    [500, "INTERNAL_ERROR", true]
  ] as const)("maps HTTP %i to a stable safe error", (status, code, retryable) => {
    const result = mapContentApiError(status, { error: { code: "UNKNOWN", message: "database password leaked" } });
    expect(result.code).toBe(code);
    expect(result.retryable).toBe(retryable);
    expect(result.message).not.toContain("database");
  });

  it("uses a recognized API code and never leaks the provider message", () => {
    const result = mapContentApiError(403, {
      error: { code: "CONTENT_UNAVAILABLE", message: "private provider diagnostic", details: ["secret"] }
    });
    expect(result).toEqual({
      code: "CONTENT_UNAVAILABLE",
      message: "Approved content is not available at this time.",
      retryable: false
    });
  });

  it("handles malformed error bodies safely", () => {
    expect(mapContentApiError(502, "not-json")).toEqual({
      code: "INTERNAL_ERROR",
      message: "The content service encountered an error. Please try again later.",
      retryable: true
    });
  });
});
