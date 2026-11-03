# Architectural Decision Record (ADR) 001: Backend Foundation Stack

- **Status**: Accepted
- **Deciders**: Jules (Backend Lead)
- **Date**: 2026-11-02

## Context and Problem Statement

DEENVERSE requires a high-performance, secure, and type-safe backend platform to serve Web/PWA, Android, and iOS clients. Key requirements include:
1. Strict Islamic content integrity: Immutable source provenance, cryptographic checksums (SHA-256), and formal human approval state machines.
2. Universal client support: Web/PWA, Android, and iOS clients require standardized JSON envelopes, versioned REST endpoints (`/api/v1/`), typed pagination cursors, strict origin-based CORS allowlists, and predictable error mapping.
3. Zero-secret policy and safe local development: Easy local setup with zero external dependencies (in-memory/SQLite) while ensuring full production compatibility (PostgreSQL via `DATABASE_URL`).
4. Automated verification: High-speed automated unit and integration tests for provenance validation, pagination, and fail-closed security.

## Decision

We have selected:
1. **Runtime & Language**: **Node.js (v22+) + TypeScript (strict mode)**.
2. **Framework**: **Fastify v5**.
   - Built-in schema compilation and validation.
   - High throughput and low latency.
   - Modular plugin architecture with security headers (`@fastify/helmet`), explicit origin allowlist CORS (`@fastify/cors`), and rate limiting (`@fastify/rate-limit`).
3. **Database Layer**: **Knex.js** with **SQLite** for local development/automated testing and **PostgreSQL** compatibility for production.
4. **Validation**: **Zod** for compile-time and runtime validation.
5. **Testing**: **Node.js native test runner (`node --test`)** with TypeScript loader (`tsx`).

## Content Integrity & Boundary Compatibility

The backend strictly implements the contract defined in `docs/CONTENT-API-RESPONSE-PARSING.md` and `src/lib/content-source.ts`:
- Returns `{ meta: { requestId, nextCursor }, data: [...] }`.
- Fails closed when no verified source exists (returns `503 UNAVAILABLE` or empty data, never invented text).
- Every content record includes full `provenance` metadata with approval status, authority identifier, review decision ID, review timestamp, and 64-hex SHA-256 checksum.
- All sample snippets are synthetic illustrations only and do not constitute certified religious content.
