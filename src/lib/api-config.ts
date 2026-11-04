/** Shared public API root for all read-only clients and browser CSP.
 * NEXT_PUBLIC_* is public build-time configuration, never a place for secrets.
 */
export function resolveApiBaseUrl(override?: string): string {
  const configured = override ?? process.env.NEXT_PUBLIC_API_BASE_URL;
  const value = configured?.trim() || '/api/v1';
  // Reject control characters, embedded whitespace and URL syntax that could
  // change the intended host or append directives to a browser policy.
  if (/[\s\\]/.test(value)) throw invalidApiConfiguration();

  if (value.startsWith('/') && !value.startsWith('//')) {
    if (value.includes('?') || value.includes('#')) throw invalidApiConfiguration();
    const url = new URL(value, 'https://same-origin.invalid');
    if (url.pathname.startsWith('//')) throw invalidApiConfiguration();
    return url.pathname.replace(/\/+$/, '');
  }

  try {
    const url = new URL(value);
    if (!/^https?:\/\//i.test(value) || !['https:', 'http:'].includes(url.protocol) ||
        url.username || url.password || url.search || url.hash ||
        !/^https?:\/\/(?:[a-z0-9._-]+|\[[0-9a-f:.]+\])(?::[0-9]+)?$/i.test(url.origin)) {
      throw invalidApiConfiguration();
    }
    return `${url.origin}${url.pathname.replace(/\/+$/, '')}`;
  } catch {
    // Never include the configured value: it could accidentally contain secrets.
    throw invalidApiConfiguration();
  }
}

function invalidApiConfiguration(): Error {
  return new Error('Invalid API base URL. Use an HTTP(S) URL without credentials, query or fragment, or a same-origin absolute path.');
}

/** Exact external origin only; paths never become CSP source expressions. */
export function apiConnectSource(): string | null {
  const baseUrl = resolveApiBaseUrl();
  return !baseUrl || baseUrl.startsWith('/') ? null : new URL(baseUrl).origin;
}
