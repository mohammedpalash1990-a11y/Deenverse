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
