import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("mock API readiness", () => {
  it("does not advertise readiness without a persistent database or applied migrations", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toMatchObject({
      status: "not_ready",
      probe: "readiness",
      database: "unavailable",
      migrations: "not_applied"
    });
    expect(body.requestId).toMatch(/^req_[a-f0-9]{32}$/);
  });
});
