# Browser security headers

The Next.js application sends a baseline set of browser security headers on all routes:

- `X-Content-Type-Options: nosniff` prevents MIME-type sniffing.
- `X-Frame-Options: DENY` and CSP `frame-ancestors 'none'` prevent framing.
- `Referrer-Policy: strict-origin-when-cross-origin` limits referrer disclosure.
- `Permissions-Policy` disables camera, microphone, geolocation, payment, and USB browser features that this foundation does not use.
- `Cross-Origin-Opener-Policy: same-origin` isolates the top-level browsing context.
- CSP restricts scripts, styles, fonts, images, connections, base URLs, objects, and form targets to the current application and explicitly required font hosts.

## CSP deployment notes

- Inline scripts/styles remain allowed because the current Next.js app shell uses framework-generated inline bootstrap and inline styling. This is a compatibility baseline, not a strict nonce-based CSP.
- `unsafe-eval` is not allowed.
- The only external font hosts currently allowed are Google Fonts CSS and font delivery. Remove those hosts if fonts are self-hosted.
- A future external API, analytics, payment, identity, or media provider must be reviewed and explicitly added to the narrowest relevant directive. Do not replace the policy with `*`.
- Test production builds and all critical routes after changing CSP. Monitor browser console violations before tightening policy further.

## Release hardening still required

- Add HSTS only after confirming the production domain is permanently HTTPS and all covered subdomains support HTTPS.
- Consider nonce-based CSP after migrating framework inline scripts/styles to a nonce-compatible strategy.
- Verify headers on the deployed host and CDN; edge/CDN configuration can override application headers.
- Add automated deployed-header checks to the release pipeline.
- Security headers do not replace server-side authentication, authorization, input validation, rate limiting, CSRF protection, or secure secret handling.

## API origin and build configuration

All four read clients (Quran catalogue, Ayah, Bengali translation, and Hadith)
resolve their API base through `src/lib/api-config.ts`. Set
`NEXT_PUBLIC_API_BASE_URL` **before building the frontend**. For example:

```sh
NEXT_PUBLIC_API_BASE_URL=https://your-api.example/api/v1 npm run build
```

The same value determines CSP `connect-src`. Only its exact origin is allowed;
its path is not added to the policy. The former fixed Render origin is no longer
hardcoded. Existing Render deployments should keep their existing public API URL
in the frontend build environment. Rebuild after changing it; a runtime-only
change cannot replace the already-built browser bundle reliably.

If the value is omitted, blank, or a same-origin path such as `/api/v1`, CSP stays
`connect-src 'self'`. A same-origin deployment must actually route that API path
to the backend using its hosting reverse proxy; this setting alone does not
create a proxy or deploy a backend. Relative paths must start with one slash.
Trailing slashes are removed consistently across all readers.

Absolute values must use HTTP(S), with no embedded credentials, query, fragment,
whitespace or backslashes. Protocol-relative URLs and path normalization that
would produce a protocol-relative request are rejected. Invalid settings fail
closed with a generic configuration error that does not echo accidental secrets.
Use HTTPS in production. HTTP localhost values are local-development-only: a
remote user's browser resolves localhost on their own device, not on the server.

For separate frontend/backend services, also set the backend's
`CORS_ALLOWED_ORIGINS` to the exact HTTPS **frontend origin**, without an API path.
Frontend CSP and backend CORS are independent requirements. Neither is a source
approval, authorization mechanism, or substitute for TLS.
