import type { NextConfig } from "next";
import { apiConnectSource } from "./src/lib/api-config";

function securityHeaders() {
  const apiOrigin = apiConnectSource();
  const isDev = process.env.NODE_ENV === "development";
  const isProd = process.env.NODE_ENV === "production";
  const cspDirectives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    `connect-src 'self'${apiOrigin ? ` ${apiOrigin}` : ""}`,
    ...(isProd ? ["upgrade-insecure-requests"] : [])
  ];

  return [
    { key: "X-DNS-Prefetch-Control", value: "off" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    {
      key: "Content-Security-Policy",
      value: cspDirectives.join("; ")
    }
  ];
}

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders()
      }
    ];
  }
};

export default nextConfig;
