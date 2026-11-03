import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

describe("browser security headers", () => {
  it("applies the security policy to every application path", async () => {
    const rules = await nextConfig.headers?.();

    expect(rules).toHaveLength(1);
    expect(rules?.[0]?.source).toBe("/:path*");

    const headers = new Map(
      (rules?.[0]?.headers ?? []).map(({ key, value }) => [key.toLowerCase(), value])
    );

    expect(headers.get("x-content-type-options")).toBe("nosniff");
    expect(headers.get("x-frame-options")).toBe("DENY");
    expect(headers.get("referrer-policy")).toBe("strict-origin-when-cross-origin");
    expect(headers.get("cross-origin-opener-policy")).toBe("same-origin");
    expect(headers.get("permissions-policy")).toContain("camera=()");
    expect(headers.get("permissions-policy")).toContain("microphone=()");
  });

  it("keeps the content security policy restrictive by default", async () => {
    const rules = await nextConfig.headers?.();
    const csp = rules?.[0]?.headers.find(
      ({ key }) => key.toLowerCase() === "content-security-policy"
    )?.value;

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("connect-src 'self'");
    expect(csp).not.toContain("'unsafe-eval'");
  });

  it("does not expose the framework identification header", () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });
});
