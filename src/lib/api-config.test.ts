import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiConnectSource, resolveApiBaseUrl } from './api-config';

afterEach(() => { vi.unstubAllEnvs(); });

describe('shared public API configuration', () => {
  it('defaults to a same-origin API with no external CSP source', () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', '');
    expect(resolveApiBaseUrl()).toBe('/api/v1');
    expect(apiConnectSource()).toBeNull();
  });

  it('uses the configured backend and only its origin for CSP', () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', ' https://API.example.test:8443/service/api/v1/// ');
    expect(resolveApiBaseUrl()).toBe('https://api.example.test:8443/service/api/v1');
    expect(apiConnectSource()).toBe('https://api.example.test:8443');
  });

  it('lets explicit client configuration override the deployment value', () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://api.example.test/api/v1');
    expect(resolveApiBaseUrl('/proxy/api/v1///')).toBe('/proxy/api/v1');
  });

  it('supports local HTTP without expanding the CSP to arbitrary HTTP hosts', () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://localhost:4000/api/v1');
    expect(apiConnectSource()).toBe('http://localhost:4000');
  });

  it('normalizes an explicit root without producing protocol-relative requests', () => {
    expect(resolveApiBaseUrl('/')).toBe('');
    expect(`${resolveApiBaseUrl('/')}\/quran/surahs`).toBe('/quran/surahs');
  });

  it.each([
    '//evil.example.test/api', 'javascript:alert(1)', 'data:text/plain,api',
    'ftp://api.example.test', 'api/v1', 'https:api.example.test',
    'https://user:secret@api.example.test/api/v1',
    'https://api.example.test/api?token=secret', 'https://api.example.test/api#fragment',
    '/api?token=secret', '/api#fragment',
    'https://api.example.test; connect-src *', 'https://api.example.test/\napi',
    'https://api.example.test/\\evil', '/\\evil.example.test',
    'https://*', 'https://*.example.test/api', 'https://api.example.test;connect-src',
    'https://', 'http://[invalid', '/..//evil.example.test', '/%2e%2e//evil.example.test'
  ])('rejects unsafe or ambiguous API configuration %j', (value) => {
    expect(() => resolveApiBaseUrl(value)).toThrow(/Invalid API base URL/);
  });

  it('does not echo credentials when reporting invalid configuration', () => {
    expect(() => resolveApiBaseUrl('https://user:TOP_SECRET@api.example.test')).toThrow(
      /^Invalid API base URL\./
    );
  });
});
