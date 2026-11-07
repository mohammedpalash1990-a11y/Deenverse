import { afterEach, describe, expect, it, vi } from "vitest";
import nextConfig from "../../next.config";

afterEach(() => { vi.unstubAllEnvs(); });

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

  it("allows only the configured API origin, not a fixed hosting provider or wildcard", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.test:8443/service/api/v1/");
    const rules = await nextConfig.headers?.();
    const csp = rules?.[0]?.headers.find(({ key }) => key === "Content-Security-Policy")?.value;
    expect(csp?.split("; ").find((directive) => directive.startsWith("connect-src")))
      .toBe("connect-src 'self' https://api.example.test:8443");
    expect(csp).not.toContain("deenverse-api.onrender.com");
    expect(csp).not.toContain("/service/api/v1");
  });

  it.each(["", "/api/v1", "/proxy/api/v1", "/"])("keeps %j same-origin for API and blocks unverified raw-content hosts", async (apiBase) => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", apiBase);
    const rules = await nextConfig.headers?.();
    const csp = rules?.[0]?.headers.find(({ key }) => key === "Content-Security-Policy")?.value;
    expect(csp?.split("; ").find((directive) => directive.startsWith("connect-src")))
      .toBe("connect-src 'self'");
  });

  it("rejects unsafe deployment configuration instead of inserting CSP directives", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.test; connect-src *");
    await expect(nextConfig.headers?.()).rejects.toThrow(/Invalid API base URL/);
  });

});
