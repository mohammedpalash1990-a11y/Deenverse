import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";

function loadServiceWorker() {
  const handlers = new Map<string, (event: any) => void>();
  const cache = {
    addAll: vi.fn().mockResolvedValue(undefined),
    put: vi.fn().mockResolvedValue(undefined),
    match: vi.fn().mockResolvedValue(undefined)
  };
  const caches = {
    open: vi.fn().mockResolvedValue(cache),
    match: vi.fn().mockResolvedValue(undefined),
    keys: vi.fn().mockResolvedValue(["deenverse-shell-v1"]),
    delete: vi.fn().mockResolvedValue(true)
  };
  const fetcher = vi.fn();
  const self = {
    location: { origin: "https://app.example.test" },
    addEventListener: (type: string, handler: (event: any) => void) => handlers.set(type, handler),
    skipWaiting: vi.fn().mockResolvedValue(undefined),
    clients: { claim: vi.fn().mockResolvedValue(undefined) }
  };

  runInNewContext(
    readFileSync(resolve(process.cwd(), "public/sw.js"), "utf8"),
    {
      self,
      caches,
      fetch: fetcher,
      URL,
      Response: { error: vi.fn(() => ({ ok: false, type: "error" })) }
    }
  );

  return { handlers, cache, caches, fetcher };
}

describe("DEENVERSE service worker cache persistence", () => {
  it("keeps the app-shell navigation response pending until the shell is cached", async () => {
    const { handlers, cache, fetcher } = loadServiceWorker();
    const cachedResponse = { cached: "shell" };
    const response = { ok: true, clone: vi.fn(() => cachedResponse) };
    fetcher.mockResolvedValue(response);

    let releaseWrite!: () => void;
    const writeGate = new Promise<void>((resolveWrite) => { releaseWrite = resolveWrite; });
    let signalWriteStarted!: () => void;
    const writeStarted = new Promise<void>((resolveStarted) => { signalWriteStarted = resolveStarted; });
    cache.put.mockImplementation(async () => {
      signalWriteStarted();
      await writeGate;
    });

    let delivered: Promise<unknown> | undefined;
    const respondWith = vi.fn((promise: Promise<unknown>) => { delivered = promise; });
    handlers.get("fetch")?.({
      request: { method: "GET", url: "https://app.example.test/", mode: "navigate" },
      respondWith
    });

    await writeStarted;
    let resolved = false;
    const result = delivered!.then((value) => { resolved = true; return value; });
    await Promise.resolve();
    expect(resolved).toBe(false);

    releaseWrite();
    expect(await result).toBe(response);
    expect(cache.put).toHaveBeenCalledWith("/", cachedResponse);
  });

  it("keeps immutable build-asset responses pending until the asset is cached", async () => {
    const { handlers, cache, caches, fetcher } = loadServiceWorker();
    const cachedResponse = { cached: "asset" };
    const response = { ok: true, clone: vi.fn(() => cachedResponse) };
    fetcher.mockResolvedValue(response);
    caches.match.mockResolvedValue(undefined);

    let releaseWrite!: () => void;
    const writeGate = new Promise<void>((resolveWrite) => { releaseWrite = resolveWrite; });
    let signalWriteStarted!: () => void;
    const writeStarted = new Promise<void>((resolveStarted) => { signalWriteStarted = resolveStarted; });
    cache.put.mockImplementation(async () => {
      signalWriteStarted();
      await writeGate;
    });

    let delivered: Promise<unknown> | undefined;
    const respondWith = vi.fn((promise: Promise<unknown>) => { delivered = promise; });
    const request = {
      method: "GET",
      url: "https://app.example.test/_next/static/chunks/app.js",
      mode: "cors"
    };
    handlers.get("fetch")?.({ request, respondWith });

    await writeStarted;
    let resolved = false;
    const result = delivered!.then((value) => { resolved = true; return value; });
    await Promise.resolve();
    expect(resolved).toBe(false);

    releaseWrite();
    expect(await result).toBe(response);
    expect(cache.put).toHaveBeenCalledWith(request, cachedResponse);
  });

  it("never intercepts or caches API responses", () => {
    const { handlers, cache, fetcher } = loadServiceWorker();
    const respondWith = vi.fn();
    handlers.get("fetch")?.({
      request: {
        method: "GET",
        url: "https://app.example.test/api/v1/hadith/books",
        mode: "cors"
      },
      respondWith
    });

    expect(respondWith).not.toHaveBeenCalled();
    expect(fetcher).not.toHaveBeenCalled();
    expect(cache.put).not.toHaveBeenCalled();
  });
});
