import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("mock problem-report endpoint", () => {
  it("does not acknowledge a report without persistent storage", async () => {
    const request = new Request("http://localhost/api/v1/problem-reports", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        category: "bug",
        description: "A report that must not be accepted into volatile memory.",
        currentSection: "settings",
        appVersion: "0.1.0"
      })
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error.code).toBe("PERSISTENCE_UNAVAILABLE");
    expect(body.error.retryable).toBe(true);
    expect(body.data).toBeUndefined();
  });
});
