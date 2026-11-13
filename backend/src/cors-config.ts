export interface CorsEnvironment {
  nodeEnv?: string;
  corsAllowedOrigins?: string;
  corsOrigin?: string;
}

/** Resolve exact browser origins and fail startup rather than silently allowing
 * only localhost when a production deployment omits its frontend allowlist. */
export function resolveCorsOrigins(environment: CorsEnvironment = {}): string[] {
  const nodeEnv = environment.nodeEnv ?? process.env.NODE_ENV;
  const primary = environment.corsAllowedOrigins ?? process.env.CORS_ALLOWED_ORIGINS;
  const fallback = environment.corsOrigin ?? process.env.CORS_ORIGIN;
  const configured = primary?.trim() || fallback?.trim() || '';

  if (nodeEnv === 'production' && !configured) {
    throw new Error('Production requires CORS_ALLOWED_ORIGINS or CORS_ORIGIN to list the deployed web origin(s).');
  }

  const value = configured || 'http://localhost:3000';
  const origins = value.split(',').map((origin) => origin.trim()).filter(Boolean);
  if (origins.length === 0) {
    throw new Error('CORS allowlist must contain at least one valid HTTP(S) origin.');
  }

  const normalized = origins.map((origin) => {
    if (/\s/.test(origin) || origin.includes('*')) {
      throw new Error('CORS allowlist entries must be exact HTTP(S) origins without wildcards.');
    }

    let parsed: URL;
    try {
      parsed = new URL(origin);
    } catch {
      throw new Error('CORS allowlist entries must be valid HTTP(S) origins.');
    }

    if (
      !['http:', 'https:'].includes(parsed.protocol) ||
      parsed.username ||
      parsed.password ||
      parsed.pathname !== '/' ||
      parsed.search ||
      parsed.hash
    ) {
      throw new Error('CORS allowlist entries must be exact HTTP(S) origins without credentials, paths, queries, or fragments.');
    }

    return parsed.origin;
  });

  return [...new Set(normalized)];
}
